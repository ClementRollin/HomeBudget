import { describe, it, expect } from 'vitest'
import { getActivePlan, checkLimit, PLAN_LIMITS } from '@/lib/subscription'

// ─── getActivePlan ────────────────────────────────────────────────────────────

describe('getActivePlan', () => {
  it('returns FREE for FREE status', () => {
    expect(getActivePlan('FREE', null)).toBe('FREE')
    expect(getActivePlan('FREE', new Date())).toBe('FREE')
  })

  it('returns PRO for PRO status', () => {
    expect(getActivePlan('PRO', null)).toBe('PRO')
  })

  it('returns PRO for PRO_PAST_DUE status', () => {
    expect(getActivePlan('PRO_PAST_DUE', null)).toBe('PRO')
  })

  it('returns PRO for PRO_CANCELED with endsAt in the future', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
    expect(getActivePlan('PRO_CANCELED', future)).toBe('PRO')
  })

  it('returns FREE for PRO_CANCELED with endsAt in the past', () => {
    const past = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // -7 days
    expect(getActivePlan('PRO_CANCELED', past)).toBe('FREE')
  })

  it('returns FREE for PRO_CANCELED with null endsAt', () => {
    expect(getActivePlan('PRO_CANCELED', null)).toBe('FREE')
  })
})

// ─── checkLimit ───────────────────────────────────────────────────────────────

describe('checkLimit', () => {
  it('allows when below the FREE limit', () => {
    const result = checkLimit('FREE', 'maxSheets', 2)
    expect(result.allowed).toBe(true)
    expect(result.current).toBe(2)
    expect(result.limit).toBe(PLAN_LIMITS.FREE.maxSheets)
  })

  it('blocks when at the FREE limit', () => {
    const limit = PLAN_LIMITS.FREE.maxSheets
    const result = checkLimit('FREE', 'maxSheets', limit)
    expect(result.allowed).toBe(false)
  })

  it('blocks when exceeding the FREE limit', () => {
    const result = checkLimit('FREE', 'maxSheets', 999)
    expect(result.allowed).toBe(false)
  })

  it('always allows for PRO plan (Infinity)', () => {
    expect(checkLimit('PRO', 'maxSheets', 0).allowed).toBe(true)
    expect(checkLimit('PRO', 'maxSheets', 1000).allowed).toBe(true)
    expect(checkLimit('PRO', 'maxAssets', 999).allowed).toBe(true)
    expect(checkLimit('PRO', 'maxDebts', 999).allowed).toBe(true)
    expect(checkLimit('PRO', 'maxGoals', 999).allowed).toBe(true)
  })

  it('returns -1 for PRO limit (Infinity serialized as -1)', () => {
    const result = checkLimit('PRO', 'maxSheets', 0)
    expect(result.limit).toBe(-1)
  })

  it('checks maxAssets FREE limit', () => {
    const limit = PLAN_LIMITS.FREE.maxAssets
    expect(checkLimit('FREE', 'maxAssets', limit - 1).allowed).toBe(true)
    expect(checkLimit('FREE', 'maxAssets', limit).allowed).toBe(false)
  })

  it('checks maxDebts FREE limit', () => {
    const limit = PLAN_LIMITS.FREE.maxDebts
    expect(checkLimit('FREE', 'maxDebts', limit - 1).allowed).toBe(true)
    expect(checkLimit('FREE', 'maxDebts', limit).allowed).toBe(false)
  })

  it('checks maxGoals FREE limit', () => {
    const limit = PLAN_LIMITS.FREE.maxGoals
    expect(checkLimit('FREE', 'maxGoals', limit - 1).allowed).toBe(true)
    expect(checkLimit('FREE', 'maxGoals', limit).allowed).toBe(false)
  })

  it('always returns the current count in result', () => {
    const count = 7
    const result = checkLimit('PRO', 'maxSheets', count)
    expect(result.current).toBe(count)
  })
})

// ─── PLAN_LIMITS sanity ───────────────────────────────────────────────────────

describe('PLAN_LIMITS', () => {
  it('FREE plan has finite positive limits', () => {
    expect(PLAN_LIMITS.FREE.maxSheets).toBeGreaterThan(0)
    expect(PLAN_LIMITS.FREE.maxAssets).toBeGreaterThan(0)
    expect(PLAN_LIMITS.FREE.maxDebts).toBeGreaterThan(0)
    expect(PLAN_LIMITS.FREE.maxGoals).toBeGreaterThan(0)
    expect(isFinite(PLAN_LIMITS.FREE.maxSheets)).toBe(true)
  })

  it('PRO plan has Infinity for all limits', () => {
    expect(PLAN_LIMITS.PRO.maxSheets).toBe(Infinity)
    expect(PLAN_LIMITS.PRO.maxAssets).toBe(Infinity)
    expect(PLAN_LIMITS.PRO.maxDebts).toBe(Infinity)
    expect(PLAN_LIMITS.PRO.maxGoals).toBe(Infinity)
  })
})
