import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { encryptValue, decryptValue, encryptNumber, decryptNumber } from '@/lib/crypto'

// 32 zero-bytes encoded as base64 (valid AES-256-GCM key for tests)
const TEST_KEY = Buffer.alloc(32).toString('base64')

const originalKey = process.env.ENCRYPTION_KEY

beforeAll(() => {
  process.env.ENCRYPTION_KEY = TEST_KEY
})

afterAll(() => {
  if (originalKey !== undefined) {
    process.env.ENCRYPTION_KEY = originalKey
  } else {
    delete process.env.ENCRYPTION_KEY
  }
})

// ─── encryptValue / decryptValue ─────────────────────────────────────────────

describe('encryptValue / decryptValue', () => {
  it('round-trips a simple ASCII string', () => {
    const plain = 'hello world'
    expect(decryptValue(encryptValue(plain))).toBe(plain)
  })

  it('round-trips a string with special characters', () => {
    const plain = 'Héros & €uro — "quoted" \'apostrophe\''
    expect(decryptValue(encryptValue(plain))).toBe(plain)
  })

  it('round-trips a numeric string', () => {
    const plain = '12345.67'
    expect(decryptValue(encryptValue(plain))).toBe(plain)
  })

  it('round-trips an empty string', () => {
    const plain = ''
    expect(decryptValue(encryptValue(plain))).toBe(plain)
  })

  it('round-trips a long string', () => {
    const plain = 'A'.repeat(1000)
    expect(decryptValue(encryptValue(plain))).toBe(plain)
  })

  it('produces different ciphertexts for the same input (random IV)', () => {
    const plain = 'same input'
    const c1 = encryptValue(plain)
    const c2 = encryptValue(plain)
    expect(c1).not.toBe(c2)
  })

  it('decryptValue returns empty string for empty payload', () => {
    expect(decryptValue('')).toBe('')
  })

  it('throws on tampered ciphertext (GCM auth tag fails)', () => {
    const encrypted = encryptValue('secret')
    const buf = Buffer.from(encrypted, 'base64')
    // flip the last byte of the ciphertext (after IV + tag)
    buf[buf.length - 1] ^= 0xff
    const tampered = buf.toString('base64')
    expect(() => decryptValue(tampered)).toThrow()
  })

  it('throws when ENCRYPTION_KEY is missing', () => {
    const saved = process.env.ENCRYPTION_KEY
    delete process.env.ENCRYPTION_KEY
    expect(() => encryptValue('test')).toThrow('ENCRYPTION_KEY')
    process.env.ENCRYPTION_KEY = saved
  })
})

// ─── encryptNumber / decryptNumber ───────────────────────────────────────────

describe('encryptNumber / decryptNumber', () => {
  it('round-trips a positive integer', () => {
    expect(decryptNumber(encryptNumber(42))).toBeCloseTo(42, 2)
  })

  it('round-trips a decimal value', () => {
    expect(decryptNumber(encryptNumber(1234.56))).toBeCloseTo(1234.56, 2)
  })

  it('round-trips zero', () => {
    expect(decryptNumber(encryptNumber(0))).toBeCloseTo(0, 2)
  })

  it('round-trips a negative number', () => {
    expect(decryptNumber(encryptNumber(-99.99))).toBeCloseTo(-99.99, 2)
  })

  it('returns 0 for empty payload', () => {
    expect(decryptNumber('')).toBe(0)
  })
})
