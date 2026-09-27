import { describe, it, expect, vi, afterEach } from 'vitest'
import { createRateLimiter } from '@/lib/rate-limit'

afterEach(() => {
  vi.useRealTimers()
})

describe('createRateLimiter', () => {
  it('allows requests within the limit', async () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 5; i++) {
      const result = await limiter.check('192.168.1.1')
      expect(result.ok).toBe(true)
    }
  })

  it('blocks the 6th request and returns retryAfterMs', async () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 5; i++) {
      await limiter.check('192.168.1.1')
    }

    const result = await limiter.check('192.168.1.1')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.retryAfterMs).toEqual(expect.any(Number))
      expect(result.retryAfterMs).toBeGreaterThan(0)
    }
  })

  it('resets after the window expires', async () => {
    vi.useFakeTimers()

    const windowMs = 15 * 60 * 1000
    const limiter = createRateLimiter({ limit: 5, windowMs })

    for (let i = 0; i < 5; i++) {
      await limiter.check('192.168.1.1')
    }

    const blockedResult = await limiter.check('192.168.1.1')
    expect(blockedResult.ok).toBe(false)

    vi.advanceTimersByTime(windowMs + 1)

    const result = await limiter.check('192.168.1.1')
    expect(result.ok).toBe(true)
  })

  it('different IPs are tracked independently', async () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 6; i++) {
      await limiter.check('ip1')
    }

    const result = await limiter.check('ip2')
    expect(result.ok).toBe(true)
  })
})
