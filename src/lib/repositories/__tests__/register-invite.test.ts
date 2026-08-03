/**
 * Tests pour la correction de la faille double-lookup code invitation.
 *
 * Comportement attendu (post-fix) :
 *   - seule une Invitation valide (findValidByCode !== null) permet de rejoindre une famille
 *   - si findValidByCode retourne null → 404, même si Family.inviteCode brut existe encore
 *   - familyRepository.findByInviteCode ne doit JAMAIS être appelé dans le flux "join"
 *   - invitation.update est appelé avec usedAt + usedByUserId après inscription réussie
 *   - un inviteCode composé uniquement d'espaces doit retourner 400
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- mocks déclarés avant tout import du module testé ---
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    family: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    invitation: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    familyMember: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/invitations', () => ({
  hashInvitationCode: (code: string) => `hashed:${code}`,
  getInvitationExpirationDate: () => new Date('2099-01-01'),
  defaultInvitationExpirationDays: 7,
}))

vi.mock('@/lib/members', () => ({
  ensureMemberForUser: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/lib/utils', () => ({
  generateInviteCode: vi.fn().mockReturnValue('NEWCODE'),
  slugify: vi.fn((s: string) => s.toLowerCase().replace(/\s+/g, '-')),
}))

// Import APRES les mocks
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'

// Helper : crée une Request Next.js compatible
function buildRequest(body: object): Request {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Payload minimal valide pour le mode "join"
const validJoinPayload = {
  mode: 'join',
  name: 'Alice',
  email: 'alice@example.com',
  password: 'secret123',
  inviteCode: 'INVITE01',
}

describe('POST /api/auth/register — flux "join"', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Par défaut : email non utilisé
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
  })

  it('should return 404 when invitationRepository.findValidByCode returns null', async () => {
    // findFirst pour l'Invitation → null (code révoqué / inexistant)
    vi.mocked(prisma.invitation.findFirst).mockResolvedValue(null)

    const res = await POST(buildRequest(validJoinPayload))

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.message).toBe('Code famille invalide')
  })

  it('should NOT call family.findUnique as fallback when invitation is null', async () => {
    // Invitation introuvable
    vi.mocked(prisma.invitation.findFirst).mockResolvedValue(null)

    await POST(buildRequest(validJoinPayload))

    // Le fallback family.findUnique({ where: { inviteCode } }) ne doit PAS être appelé
    expect(vi.mocked(prisma.family.findUnique)).not.toHaveBeenCalled()
  })

  it('should allow joining when a valid invitation exists', async () => {
    const mockFamily = { id: 'family-1', name: 'Les Dupont', slug: 'les-dupont', inviteCode: 'INVITE01', createdAt: new Date() }
    const mockInvitation = {
      id: 'inv-1',
      familyId: 'family-1',
      codeHash: 'hashed:INVITE01',
      createdAt: new Date(),
      expiresAt: new Date('2099-01-01'),
      usedAt: null,
      usedByUserId: null,
      createdByUserId: null,
      family: mockFamily,
    }
    const mockUser = { id: 'user-1', name: 'Alice', email: 'alice@example.com', password: 'hashed', familyId: 'family-1', createdAt: new Date(), updatedAt: new Date() }

    vi.mocked(prisma.invitation.findFirst).mockResolvedValue(mockInvitation as never)

    // fulfillInvitation utilise $transaction
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      const txMock = {
        user: { create: vi.fn().mockResolvedValue(mockUser) },
        invitation: { update: vi.fn().mockResolvedValue({ ...mockInvitation, usedAt: new Date(), usedByUserId: mockUser.id }) },
      }
      return fn(txMock as unknown as typeof prisma)
    })

    const res = await POST(buildRequest(validJoinPayload))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('should return 409 when email is already taken', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'existing-user' } as never)

    const res = await POST(buildRequest(validJoinPayload))

    expect(res.status).toBe(409)
  })

  /**
   * [Critical 2] Vérifie que l'invitation est bien marquée usedAt après inscription réussie.
   * Ce test doit ÉCHOUER avec le code actuel (deux opérations séparées au lieu de fulfillInvitation).
   * Il doit PASSER après l'application du fix Critical 1 (utilisation de fulfillInvitation).
   */
  it('should mark invitation as used (usedAt + usedByUserId) via transaction on successful join', async () => {
    const mockFamily = { id: 'family-1', name: 'Les Dupont', slug: 'les-dupont', inviteCode: 'INVITE01', createdAt: new Date() }
    const mockInvitation = {
      id: 'inv-1',
      familyId: 'family-1',
      codeHash: 'hashed:INVITE01',
      createdAt: new Date(),
      expiresAt: new Date('2099-01-01'),
      usedAt: null,
      usedByUserId: null,
      createdByUserId: null,
      family: mockFamily,
    }
    const mockUser = { id: 'user-1', name: 'Alice', email: 'alice@example.com', password: 'hashed', familyId: 'family-1', createdAt: new Date(), updatedAt: new Date() }

    vi.mocked(prisma.invitation.findFirst).mockResolvedValue(mockInvitation as never)

    // Capturer la fonction tx passée à $transaction pour l'inspecter
    let capturedTxFn: ((tx: typeof prisma) => Promise<unknown>) | null = null
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      capturedTxFn = fn
      const txMock = {
        user: { create: vi.fn().mockResolvedValue(mockUser) },
        invitation: { update: vi.fn().mockResolvedValue({ ...mockInvitation, usedAt: new Date(), usedByUserId: mockUser.id }) },
      }
      return fn(txMock as unknown as typeof prisma)
    })

    const res = await POST(buildRequest(validJoinPayload))
    expect(res.status).toBe(200)

    // fulfillInvitation DOIT passer par $transaction
    expect(vi.mocked(prisma.$transaction)).toHaveBeenCalledTimes(1)
    expect(capturedTxFn).not.toBeNull()

    // Rejouer la transaction avec un tx frais pour capturer les appels
    const txInvitation = { update: vi.fn().mockResolvedValue({}) }
    const txUser = { create: vi.fn().mockResolvedValue(mockUser) }
    await capturedTxFn!({ user: txUser, invitation: txInvitation } as unknown as typeof prisma)

    expect(txInvitation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inv-1' },
        data: expect.objectContaining({
          usedAt: expect.any(Date),
          usedByUserId: expect.any(String),
        }),
      })
    )
  })
})

/**
 * [Important 3] Valide que le schéma Zod rejette un inviteCode composé uniquement d'espaces.
 * Un code "    " passe min(4) mais est trimé en "" → hashInvitationCode("") → 404 silencieux.
 * Ce test doit ÉCHOUER avec le code actuel, puis PASSER après ajout du .refine().
 */
describe('POST /api/auth/register — validation inviteCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
  })

  it('should return 400 for a whitespace-only inviteCode (edge case after trim)', async () => {
    const payload = {
      mode: 'join',
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123',
      inviteCode: '    ', // 4 espaces : passe min(4), trimé en ""
    }

    const res = await POST(buildRequest(payload))

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toBe('Payload invalide')
  })
})
