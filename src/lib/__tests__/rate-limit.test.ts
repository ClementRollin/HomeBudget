/**
 * Tests TDD pour le rate limiter en mémoire.
 *
 * Comportement attendu :
 *   - Autorise les requêtes dans la limite
 *   - Bloque la N+1ème requête avec retryAfterMs
 *   - Réinitialise après expiration de la fenêtre temporelle
 *   - Suit les IPs indépendamment
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { createRateLimiter } from '@/lib/rate-limit'

afterEach(() => {
  vi.useRealTimers()
})

describe('createRateLimiter', () => {
  it('allows requests within the limit', () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 5; i++) {
      const result = limiter.check('192.168.1.1')
      expect(result.ok).toBe(true)
    }
  })

  it('blocks the 6th request and returns retryAfterMs', () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 5; i++) {
      limiter.check('192.168.1.1')
    }

    const result = limiter.check('192.168.1.1')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.retryAfterMs).toEqual(expect.any(Number))
      expect(result.retryAfterMs).toBeGreaterThan(0)
    }
  })

  it('resets after the window expires', () => {
    vi.useFakeTimers()

    const windowMs = 15 * 60 * 1000
    const limiter = createRateLimiter({ limit: 5, windowMs })

    // Épuiser la limite
    for (let i = 0; i < 5; i++) {
      limiter.check('192.168.1.1')
    }

    // Vérifier que la 6ème est bloquée
    const blockedResult = limiter.check('192.168.1.1')
    expect(blockedResult.ok).toBe(false)

    // Avancer le temps au-delà de la fenêtre
    vi.advanceTimersByTime(windowMs + 1)

    // Doit être autorisé à nouveau
    const result = limiter.check('192.168.1.1')
    expect(result.ok).toBe(true)
  })

  it('different IPs are tracked independently', () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 })

    // Épuiser la limite pour ip1
    for (let i = 0; i < 6; i++) {
      limiter.check('ip1')
    }

    // ip2 n'a fait qu'une seule requête → doit être autorisée
    const result = limiter.check('ip2')
    expect(result.ok).toBe(true)
  })
})
