/**
 * Tests pour la correction de la faille double-lookup code invitation.
 *
 * Comportement attendu (post-fix) :
 *   - seule une Invitation valide (findValidByCode !== null) permet de rejoindre une famille
 *   - si findValidByCode retourne null → 404, même si Family.inviteCode brut existe encore
 *   - familyRepository.findByInviteCode ne doit JAMAIS être appelé dans le flux "join"
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
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as never)

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
})
