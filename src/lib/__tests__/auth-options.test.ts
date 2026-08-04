/**
 * Tests pour la config auth v5 :
 *   - jwt callback : ne doit PAS écrire familyInviteCode sur le token
 *   - session callback : ne doit PAS exposer familyInviteCode sur session.user
 *   - credentialsAuthorize : ne doit PAS retourner familyInviteCode
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-auth', () => ({
  default: () => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}))

vi.mock('next-auth/providers/credentials', () => ({
  default: (opts: { authorize: (c: unknown) => unknown }) => ({ options: { authorize: opts.authorize } }),
}))

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

import { authConfig, credentialsAuthorize } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { ensureMemberForUser } from '@/lib/members'

const jwtCallback = authConfig.callbacks!.jwt!
const sessionCallback = authConfig.callbacks!.session!

describe('auth — jwt callback', () => {
  it('should NOT set familyInviteCode on token', async () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      familyId: 'family-1',
      familyName: 'Les Dupont',
      familyInviteCode: 'SECRET_CODE',
      familyMemberId: 'member-1',
    }

    const token = await jwtCallback({ token: {}, user: user as never })

    expect((token as Record<string, unknown>).familyInviteCode).toBeUndefined()
  })

  it('should still set familyId, familyName, and familyMemberId on token', async () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      familyId: 'family-1',
      familyName: 'Les Dupont',
      familyMemberId: 'member-1',
    }

    const token = await jwtCallback({ token: {}, user: user as never }) as Record<string, unknown>

    expect(token.familyId).toBe('family-1')
    expect(token.familyName).toBe('Les Dupont')
    expect(token.familyMemberId).toBe('member-1')
  })
})

describe('auth — session callback', () => {
  it('should NOT expose familyInviteCode on session.user', async () => {
    const token = {
      id: 'user-1',
      familyId: 'family-1',
      familyName: 'Les Dupont',
      familyInviteCode: 'SECRET_CODE',
      familyMemberId: 'member-1',
    }

    const session = await sessionCallback({
      session: { user: { name: 'Test', email: 'test@example.com', image: null }, expires: '2099-01-01' },
      token: token as never,
    } as never) as { user?: Record<string, unknown> }

    expect(session.user?.familyInviteCode).toBeUndefined()
  })

  it('should still set familyId, familyName, and familyMemberId on session.user', async () => {
    const token = {
      id: 'user-1',
      familyId: 'family-1',
      familyName: 'Les Dupont',
      familyMemberId: 'member-1',
    }

    const session = await sessionCallback({
      session: { user: { name: 'Test', email: 'test@example.com', image: null }, expires: '2099-01-01' },
      token: token as never,
    } as never) as { user?: Record<string, unknown> }

    expect(session.user?.familyId).toBe('family-1')
    expect(session.user?.familyName).toBe('Les Dupont')
    expect(session.user?.familyMemberId).toBe('member-1')
  })
})

describe('auth — credentialsAuthorize', () => {
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
      family: { id: 'family-1', name: 'Les Dupont', slug: 'les-dupont', inviteCode: 'TESTCODE', createdAt: new Date() },
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(compare as ReturnType<typeof vi.fn>).mockResolvedValue(true)
    vi.mocked(ensureMemberForUser).mockResolvedValue({ id: 'member-1' } as never)

    const result = await credentialsAuthorize({ email: 'test@example.com', password: 'password123' }) as Record<string, unknown> | null

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
      family: { id: 'family-1', name: 'Les Dupont', slug: 'les-dupont', inviteCode: 'TESTCODE', createdAt: new Date() },
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(compare as ReturnType<typeof vi.fn>).mockResolvedValue(true)
    vi.mocked(ensureMemberForUser).mockResolvedValue({ id: 'member-1' } as never)

    const result = await credentialsAuthorize({ email: 'test@example.com', password: 'password123' }) as Record<string, unknown> | null

    expect(result).not.toBeNull()
    expect(result?.familyId).toBe('family-1')
    expect(result?.familyName).toBe('Les Dupont')
  })
})
