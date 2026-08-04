/**
 * Tests TDD pour la suppression de familyInviteCode du JWT/session.
 *
 * Comportement attendu (post-fix) :
 *   - jwt callback : ne doit PAS écrire familyInviteCode sur le token
 *   - session callback : ne doit PAS exposer familyInviteCode sur session.user
 *   - authorize : ne doit PAS retourner familyInviteCode dans l'objet utilisateur
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- mocks déclarés avant tout import du module testé ---
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}))

vi.mock('@/lib/members', () => ({
  ensureMemberForUser: vi.fn(),
}))

// Import APRÈS les mocks
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { ensureMemberForUser } from '@/lib/members'

// Typage pour accéder aux callbacks
type JwtCallback = NonNullable<NonNullable<typeof authOptions.callbacks>['jwt']>
type SessionCallback = NonNullable<NonNullable<typeof authOptions.callbacks>['session']>

const jwtCallback = authOptions.callbacks!.jwt! as JwtCallback
const sessionCallback = authOptions.callbacks!.session! as SessionCallback

// Accès au provider Credentials (index 0)
const credentialsProvider = authOptions.providers[0] as {
  options: { authorize: (credentials: Record<string, string>) => Promise<unknown> }
}
const authorize = credentialsProvider.options.authorize

describe('auth-options — jwt callback', () => {
  it('should NOT set familyInviteCode on token', async () => {
    const userWithInviteCode = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      familyId: 'family-1',
      familyName: 'Les Dupont',
      familyInviteCode: 'SECRET_CODE',
      familyMemberId: 'member-1',
    }

    const token = await jwtCallback({
      token: {},
      user: userWithInviteCode as never,
      account: null,
      trigger: 'signIn',
    })

    expect(token.familyInviteCode).toBeUndefined()
  })

  it('should still set familyId, familyName, and familyMemberId on token', async () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      familyId: 'family-1',
      familyName: 'Les Dupont',
      familyInviteCode: 'SECRET_CODE',
      familyMemberId: 'member-1',
    }

    const token = await jwtCallback({
      token: {},
      user: user as never,
      account: null,
      trigger: 'signIn',
    })

    expect(token.familyId).toBe('family-1')
    expect(token.familyName).toBe('Les Dupont')
    expect(token.familyMemberId).toBe('member-1')
  })
})

describe('auth-options — session callback', () => {
  it('should NOT expose familyInviteCode on session.user', async () => {
    const tokenWithInviteCode = {
      id: 'user-1',
      familyId: 'family-1',
      familyName: 'Les Dupont',
      familyInviteCode: 'SECRET_CODE',
      familyMemberId: 'member-1',
    }

    const session = await (sessionCallback as (args: unknown) => Promise<unknown>)({
      session: {
        user: { name: 'Test', email: 'test@example.com', image: null },
        expires: '2099-01-01',
      },
      token: tokenWithInviteCode,
      newSession: undefined,
      trigger: 'update',
    }) as { user?: Record<string, unknown> }

    expect(session.user?.familyInviteCode).toBeUndefined()
  })

  it('should still set familyId, familyName, and familyMemberId on session.user', async () => {
    const token = {
      id: 'user-1',
      familyId: 'family-1',
      familyName: 'Les Dupont',
      familyInviteCode: 'SECRET_CODE',
      familyMemberId: 'member-1',
    }

    const session = await (sessionCallback as (args: unknown) => Promise<unknown>)({
      session: {
        user: { name: 'Test', email: 'test@example.com', image: null },
        expires: '2099-01-01',
      },
      token: token,
      newSession: undefined,
      trigger: 'update',
    }) as { user?: Record<string, unknown> }

    expect(session.user?.familyId).toBe('family-1')
    expect(session.user?.familyName).toBe('Les Dupont')
    expect(session.user?.familyMemberId).toBe('member-1')
  })
})

describe('auth-options — authorize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should NOT return familyInviteCode in the returned user object', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed_password',
      familyId: 'family-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      family: {
        id: 'family-1',
        name: 'Les Dupont',
        slug: 'les-dupont',
        inviteCode: 'TESTCODE',
        createdAt: new Date(),
      },
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(compare as ReturnType<typeof vi.fn>).mockResolvedValue(true)
    vi.mocked(ensureMemberForUser).mockResolvedValue({ id: 'member-1' } as never)

    const result = await authorize({
      email: 'test@example.com',
      password: 'password123',
    }) as Record<string, unknown> | null

    expect(result).not.toBeNull()
    expect(result).not.toHaveProperty('familyInviteCode')
  })

  it('should still return familyId and familyName in the returned user object', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed_password',
      familyId: 'family-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      family: {
        id: 'family-1',
        name: 'Les Dupont',
        slug: 'les-dupont',
        inviteCode: 'TESTCODE',
        createdAt: new Date(),
      },
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(compare as ReturnType<typeof vi.fn>).mockResolvedValue(true)
    vi.mocked(ensureMemberForUser).mockResolvedValue({ id: 'member-1' } as never)

    const result = await authorize({
      email: 'test@example.com',
      password: 'password123',
    }) as Record<string, unknown> | null

    expect(result).not.toBeNull()
    expect(result?.familyId).toBe('family-1')
    expect(result?.familyName).toBe('Les Dupont')
  })
})
