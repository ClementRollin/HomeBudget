import { describe, it, expect } from 'vitest'
import {
  computePERCeiling,
  PER_CEILING_MIN,
  PER_CEILING_MAX,
  computeQuotientFamilial,
  computeIRTax,
  computeIRSimulation,
  IR_BRACKETS_2024,
  QF_CAP_PER_HALF_PART,
} from '@/lib/fiscalite'
import type { FamilyMemberFiscal } from '@/lib/fiscalite'

// ─── computePERCeiling ────────────────────────────────────────────────────────

describe('computePERCeiling', () => {
  it('returns the minimum ceiling for very low income', () => {
    expect(computePERCeiling(0)).toBe(PER_CEILING_MIN)
    expect(computePERCeiling(10_000)).toBe(PER_CEILING_MIN) // 10% = 1000 < min 4637
  })

  it('returns 10% of income for mid-range income', () => {
    const income = 60_000
    expect(computePERCeiling(income)).toBe(income * 0.10)
  })

  it('returns the maximum ceiling for high income', () => {
    expect(computePERCeiling(500_000)).toBe(PER_CEILING_MAX)
  })

  it('clamps exactly at min boundary', () => {
    // At exactly PER_CEILING_MIN / 0.10, 10% equals the minimum — result is PER_CEILING_MIN
    const incomeThatHits10Pct = PER_CEILING_MIN / 0.10 // 46370
    expect(computePERCeiling(incomeThatHits10Pct)).toBe(PER_CEILING_MIN)
  })

  it('clamps exactly at max boundary', () => {
    // At exactly PER_CEILING_MAX / 0.10, 10% equals the maximum — result is PER_CEILING_MAX
    const incomeThatHitsMax = PER_CEILING_MAX / 0.10 // 370940
    expect(computePERCeiling(incomeThatHitsMax)).toBe(PER_CEILING_MAX)
  })
})

// ─── computeQuotientFamilial ──────────────────────────────────────────────────

describe('computeQuotientFamilial', () => {
  const d1: FamilyMemberFiscal = { fiscalRole: 'DECLARANT_1', isAlternateGuard: false, isDisabled: false }
  const d2: FamilyMemberFiscal = { fiscalRole: 'DECLARANT_2', isAlternateGuard: false, isDisabled: false }
  const child: FamilyMemberFiscal = { fiscalRole: 'DEPENDENT_CHILD', isAlternateGuard: false, isDisabled: false }

  it('returns 1 part for single declarant with no dependents', () => {
    const result = computeQuotientFamilial([d1])
    expect(result.parts).toBe(1)
    expect(result.isParentIsole).toBe(false)
  })

  it('returns 2 parts for couple with no dependents', () => {
    const result = computeQuotientFamilial([d1, d2])
    expect(result.parts).toBe(2)
    expect(result.isParentIsole).toBe(false)
  })

  it('adds 0.5 part per child for first two children', () => {
    const result = computeQuotientFamilial([d1, d2, child, child])
    // 2 (couple) + 0.5 (enfant 1) + 0.5 (enfant 2) = 3
    expect(result.parts).toBe(3)
  })

  it('adds 1 part for 3rd+ child', () => {
    const result = computeQuotientFamilial([d1, d2, child, child, child])
    // 2 + 0.5 + 0.5 + 1 = 4
    expect(result.parts).toBe(4)
  })

  it('adds 0.25 part per child in alternate custody (1st/2nd rank)', () => {
    const altChild: FamilyMemberFiscal = { fiscalRole: 'DEPENDENT_CHILD', isAlternateGuard: true, isDisabled: false }
    const result = computeQuotientFamilial([d1, d2, altChild])
    // 2 + 0.25 (0.5/2) = 2.25
    expect(result.parts).toBe(2.25)
  })

  it('adds 0.5 part for 3rd child in alternate custody', () => {
    const altChild: FamilyMemberFiscal = { fiscalRole: 'DEPENDENT_CHILD', isAlternateGuard: true, isDisabled: false }
    const result = computeQuotientFamilial([d1, d2, child, child, altChild])
    // 2 + 0.5 + 0.5 + 0.5 (1/2 for 3rd alternate) = 3.5
    expect(result.parts).toBe(3.5)
  })

  it('adds 0.5 extra part for disabled child', () => {
    const disabledChild: FamilyMemberFiscal = { fiscalRole: 'DEPENDENT_CHILD', isAlternateGuard: false, isDisabled: true }
    const result = computeQuotientFamilial([d1, d2, disabledChild])
    // 2 + 0.5 (child) + 0.5 (disability) = 3
    expect(result.parts).toBe(3)
  })

  it('applies parent isole bonus for single parent with child', () => {
    const result = computeQuotientFamilial([d1, child])
    // 1 + 0.5 (enfant) + 0.5 (parent isolé) = 2
    expect(result.parts).toBe(2)
    expect(result.isParentIsole).toBe(true)
  })

  it('does not apply parent isole for couple', () => {
    const result = computeQuotientFamilial([d1, d2, child])
    expect(result.isParentIsole).toBe(false)
  })

  it('adds 0.5 part per ascendant', () => {
    const ascendant: FamilyMemberFiscal = { fiscalRole: 'ASCENDANT', isAlternateGuard: false, isDisabled: false }
    const result = computeQuotientFamilial([d1, d2, ascendant, ascendant])
    // 2 + 0.5 + 0.5 = 3
    expect(result.parts).toBe(3)
  })

  it('treats DEPENDENT_ADULT with same part rules as DEPENDENT_CHILD', () => {
    const adult: FamilyMemberFiscal = { fiscalRole: 'DEPENDENT_ADULT', isAlternateGuard: false, isDisabled: false }
    const result = computeQuotientFamilial([d1, d2, adult])
    // 2 + 0.5 (premier enfant majeur rattaché) = 2.5
    expect(result.parts).toBe(2.5)
  })

  it('uses "Enfant majeur rattaché" label for DEPENDENT_ADULT in breakdown', () => {
    const adult: FamilyMemberFiscal = { fiscalRole: 'DEPENDENT_ADULT', isAlternateGuard: false, isDisabled: false }
    const result = computeQuotientFamilial([d1, d2, adult])
    const entry = result.breakdown.find((b) => b.label.includes('majeur rattaché'))
    expect(entry).toBeDefined()
  })
})

// ─── computeIRTax ─────────────────────────────────────────────────────────────

describe('computeIRTax', () => {
  it('returns 0 tax for income below first bracket threshold', () => {
    const result = computeIRTax(10_000, 1)
    expect(result.taxAmount).toBe(0)
    expect(result.marginalRate).toBe(0)
  })

  it('correctly taxes income in the 11% bracket', () => {
    // income 20000, bracket: 11294 @ 0%, 20000-11294=8706 @ 11%
    const result = computeIRTax(20_000, 1)
    const expected = (20_000 - 11_294) * 0.11
    expect(result.taxAmount).toBeCloseTo(expected, 2)
    expect(result.marginalRate).toBe(0.11)
  })

  it('computes progressive tax correctly for income spanning two brackets', () => {
    // income 35000 : 11294@0%, (28797-11294)@11%, (35000-28797)@30%
    const result = computeIRTax(35_000, 1)
    const bracket2 = (28_797 - 11_294) * 0.11
    const bracket3 = (35_000 - 28_797) * 0.30
    expect(result.taxAmount).toBeCloseTo(bracket2 + bracket3, 2)
    expect(result.marginalRate).toBe(0.30)
  })

  it('correctly taxes income at exact bracket boundary (28797)', () => {
    // At exactly the 11% bracket upper bound, marginal rate stays 11%
    const result = computeIRTax(28_797, 1)
    expect(result.marginalRate).toBe(0.11)
    const expected = (28_797 - 11_294) * 0.11
    expect(result.taxAmount).toBeCloseTo(expected, 2)
  })

  it('divides taxable income by parts for quotient familial', () => {
    const taxSingle = computeIRTax(60_000, 1)
    const taxCouple = computeIRTax(60_000, 2)
    expect(taxCouple.taxAmount).toBeLessThan(taxSingle.taxAmount)
  })

  it('averageRate is taxAmount / income', () => {
    const income = 50_000
    const result = computeIRTax(income, 1)
    expect(result.averageRate).toBeCloseTo(result.taxAmount / income, 10)
  })

  it('averageRate is 0 when income is 0', () => {
    const result = computeIRTax(0, 1)
    expect(result.averageRate).toBe(0)
    expect(result.taxAmount).toBe(0)
  })

  it('caps the QF benefit at QF_CAP_PER_HALF_PART per extra half-part', () => {
    // With high enough income, the QF saving is definitively capped
    const parts = 5
    const taxWith1Part = computeIRTax(500_000, 1)
    const taxWithParts = computeIRTax(500_000, parts)
    const saving = taxWith1Part.taxAmount - taxWithParts.taxAmount
    // extra half-parts = (5 - 1) * 2 = 8, max saving = 8 * QF_CAP_PER_HALF_PART
    const extraHalfParts = (parts - 1) * 2
    const maxSaving = QF_CAP_PER_HALF_PART * extraHalfParts
    // At 500k income, the cap is definitively hit — saving should equal maxSaving exactly
    expect(saving).toBeCloseTo(maxSaving, 1)
  })
})

// ─── computeIRSimulation ─────────────────────────────────────────────────────

describe('computeIRSimulation', () => {
  const baseParams = {
    case1AJ: 40_000,
    case1BJ: 0,
    perContribYTD: 0,
    dividends: 0,
    capitalGains: 0,
    rentalIncome: 0,
    parts: 1,
  }

  it('applies 10% salary abatement to case1AJ', () => {
    const result = computeIRSimulation(baseParams)
    // Net salary = 40000 - 4000 = 36000
    expect(result.taxableIncome).toBeCloseTo(36_000, 2)
  })

  it('applies 10% salary abatement to case1BJ (declarant 2)', () => {
    const result = computeIRSimulation({ ...baseParams, case1AJ: 0, case1BJ: 30_000 })
    // Net salary D2 = 30000 - 3000 = 27000
    expect(result.taxableIncome).toBeCloseTo(27_000, 2)
  })

  it('accumulates both declarant salaries in taxable income', () => {
    const result = computeIRSimulation({ ...baseParams, case1AJ: 40_000, case1BJ: 30_000 })
    // 36000 (D1) + 27000 (D2) = 63000
    expect(result.taxableIncome).toBeCloseTo(63_000, 2)
  })

  it('deducts PER contributions from taxable income', () => {
    const result = computeIRSimulation({ ...baseParams, perContribYTD: 5_000 })
    // 36000 - 5000 = 31000
    expect(result.taxableIncome).toBeCloseTo(31_000, 2)
  })

  it('applies 40% abatement to dividends', () => {
    const result = computeIRSimulation({ ...baseParams, case1AJ: 0, dividends: 10_000 })
    // Net dividends = 10000 * 0.6 = 6000
    expect(result.taxableIncome).toBeCloseTo(6_000, 2)
  })

  it('taxes capital gains at PFU rate (12.8%) separately', () => {
    const gains = 20_000
    const result = computeIRSimulation({ ...baseParams, case1AJ: 0, capitalGains: gains })
    expect(result.pfuCapitalGains).toBeCloseTo(gains * 0.128, 2)
  })

  it('totalIR = irProgressive + pfuCapitalGains', () => {
    const result = computeIRSimulation({ ...baseParams, capitalGains: 10_000 })
    expect(result.totalIR).toBeCloseTo(result.irProgressive + result.pfuCapitalGains, 2)
  })

  it('taxableIncome is never negative', () => {
    const result = computeIRSimulation({ ...baseParams, perContribYTD: 999_999 })
    expect(result.taxableIncome).toBe(0)
  })

  it('averageRate = totalIR / grossIncome', () => {
    const params = { ...baseParams, capitalGains: 5_000 }
    const result = computeIRSimulation(params)
    const grossIncome = params.case1AJ + params.case1BJ + params.dividends + params.capitalGains + params.rentalIncome
    expect(result.averageRate).toBeCloseTo(result.totalIR / grossIncome, 10)
  })

  it('averageRate is 0 when all income is 0', () => {
    const result = computeIRSimulation({ case1AJ: 0, case1BJ: 0, perContribYTD: 0, dividends: 0, capitalGains: 0, rentalIncome: 0, parts: 1 })
    expect(result.averageRate).toBe(0)
    expect(result.totalIR).toBe(0)
  })

  it('uses salary abatement minimum of 495€ for very small salaries', () => {
    // salary 1000, 10% = 100 < min 495, so net = 1000 - 495 = 505
    const result = computeIRSimulation({ ...baseParams, case1AJ: 1_000 })
    expect(result.taxableIncome).toBeCloseTo(505, 2)
  })

  it('caps salary abatement at 12829€ for high salaries', () => {
    // salary 200000, 10% = 20000 > max 12829, so net = 200000 - 12829
    const result = computeIRSimulation({ ...baseParams, case1AJ: 200_000 })
    expect(result.taxableIncome).toBeCloseTo(200_000 - 12_829, 2)
  })

  it('breakdown filters out zero-amount entries', () => {
    const result = computeIRSimulation(baseParams)
    const labels = result.breakdown.map((b) => b.label)
    expect(labels).not.toContain('Salaires D2 (abattement 10 %)')
    expect(labels).not.toContain('Revenus fonciers')
  })

  it('includes case1AJ entry when salary is non-zero', () => {
    const result = computeIRSimulation(baseParams)
    const entry = result.breakdown.find((b) => b.label === 'Salaires D1 (abattement 10 %)')
    expect(entry).toBeDefined()
    expect(entry!.amount).toBeGreaterThan(0)
  })

  it('returns correct parts in result', () => {
    const result = computeIRSimulation({ ...baseParams, parts: 2.5 })
    expect(result.parts).toBe(2.5)
  })
})

// ─── IR_BRACKETS_2024 sanity ──────────────────────────────────────────────────

describe('IR_BRACKETS_2024', () => {
  it('starts at 0% and ends at 45%', () => {
    expect(IR_BRACKETS_2024[0].rate).toBe(0)
    expect(IR_BRACKETS_2024[IR_BRACKETS_2024.length - 1].rate).toBe(0.45)
  })

  it('finite brackets are in ascending order of max', () => {
    // Exclude the last entry (Infinity) from the comparison loop
    const finiteBrackets = IR_BRACKETS_2024.filter((b) => isFinite(b.max))
    for (let i = 1; i < finiteBrackets.length; i++) {
      expect(finiteBrackets[i].max).toBeGreaterThan(finiteBrackets[i - 1].max)
    }
  })
})
