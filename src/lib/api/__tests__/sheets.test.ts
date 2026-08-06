/**
 * Tests TDD pour serializeSheet et resolveFamilySession.
 *
 * Ces tests doivent ÉCHOUER avant la création de src/lib/api/sheets.ts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks déclarés avant tout import du module testé ---
vi.mock('@/lib/auth', () => ({
  getCurrentSession: vi.fn(),
}))

vi.mock('@/lib/crypto', () => ({
  decryptValue: (v: string) => v.replace('enc:', ''),
  decryptNumber: (v: string) => parseFloat(v.replace('enc:', '')),
  encryptValue: (v: string) => `enc:${v}`,
  encryptNumber: (v: number) => `enc:${v}`,
}))

// Mock Prisma pour éviter la résolution du client généré
vi.mock('@/lib/members', () => ({
  findOrCreateMember: vi.fn(),
  getFamilyMembers: vi.fn(),
  ensureMemberForUser: vi.fn(),
}))

// Import APRÈS les mocks
import { serializeSheet, resolveFamilySession } from '@/lib/api/sheets'
import { getCurrentSession } from '@/lib/auth'
import type { SecureSheet } from '@/lib/sheets'

// Helper pour créer un SecureSheet minimal
const makeSecureSheet = (overrides: Partial<SecureSheet> = {}): SecureSheet => ({
  id: 'sheet-1',
  year: 2024,
  month: 1,
  familyId: 'fam-1',
  ownerId: 'user-1',
  createdAt: new Date('2024-01-15T10:00:00.000Z'),
  salaries: [],
  charges: [],
  budgets: [],
  ...overrides,
})

describe('serializeSheet', () => {
  it('converts createdAt Date to ISO string', () => {
    const sheet = makeSecureSheet()
    const result = serializeSheet(sheet)

    expect(typeof result.createdAt).toBe('string')
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('decrypts label and amount from salaries', () => {
    const sheet = makeSecureSheet({
      salaries: [
        {
          id: 'sal-1',
          sheetId: 'sheet-1',
          memberId: 'member-1',
          encryptedLabel: 'enc:Salaire principal',
          encryptedAmount: 'enc:3000',
          createdAt: new Date('2024-01-15T10:00:00.000Z'),
          member: { id: 'member-1', familyId: 'fam-1', userId: null, slug: 'moi', displayName: 'Moi', birthDate: null, fiscalRole: 'DECLARANT_1' as const, isAlternateGuard: false, isDisabled: false, createdAt: new Date(), updatedAt: new Date() },
        },
      ],
    })

    const result = serializeSheet(sheet)

    expect(result.salaries[0].label).toBe('Salaire principal')
    expect(result.salaries[0].amount).toBe(3000)
  })
})

describe('resolveFamilySession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when no session', async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null)

    const result = await resolveFamilySession()

    expect(result).toBeNull()
  })

  it('returns familyId and userId when session exists', async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: {
        id: 'user-1',
        familyId: 'fam-1',
        familyName: 'Les Dupont',
        familyMemberId: 'member-1',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
      expires: '2099-01-01',
    } as never)

    const result = await resolveFamilySession()

    expect(result).toEqual({ familyId: 'fam-1', userId: 'user-1' })
  })
})
