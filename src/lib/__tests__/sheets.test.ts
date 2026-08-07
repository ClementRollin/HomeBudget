import { describe, it, expect } from 'vitest'
import {
  computeSheetMetrics,
  aggregateSheetMetrics,
  computeIncomeDistribution,
} from '@/lib/sheets'
import type { SheetWithRelations, DecryptedSalary, DecryptedCharge, DecryptedBudget } from '@/lib/sheets'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeSalary = (person: string, amount: number): DecryptedSalary => ({
  id: `sal-${Math.random()}`,
  memberId: null,
  person,
  label: 'Salaire',
  amount,
})

const makeCharge = (type: DecryptedCharge['type'], amount: number, person = 'Commun'): DecryptedCharge => ({
  id: `chg-${Math.random()}`,
  memberId: null,
  person,
  type,
  label: 'Charge',
  amount,
})

const makeBudget = (amount: number): DecryptedBudget => ({
  id: `bud-${Math.random()}`,
  label: 'Budget',
  amount,
})

const makeSheet = (
  salaries: DecryptedSalary[] = [],
  charges: DecryptedCharge[] = [],
  budgets: DecryptedBudget[] = [],
): SheetWithRelations =>
  ({
    id: 'sheet-1',
    familyId: 'family-1',
    year: 2024,
    month: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    salaries,
    charges,
    budgets,
  }) as unknown as SheetWithRelations

// ─── computeSheetMetrics ──────────────────────────────────────────────────────

describe('computeSheetMetrics', () => {
  it('returns zeros for an empty sheet', () => {
    const metrics = computeSheetMetrics(makeSheet())
    expect(metrics).toEqual({ income: 0, expenses: 0, budgets: 0, balance: 0 })
  })

  it('sums salaries as income', () => {
    const sheet = makeSheet([makeSalary('Alice', 2000), makeSalary('Bob', 1500)])
    const metrics = computeSheetMetrics(sheet)
    expect(metrics.income).toBe(3500)
  })

  it('sums charges as expenses', () => {
    const sheet = makeSheet([], [makeCharge('FIXE_COMMUN', 800), makeCharge('FIXE_INDIVIDUEL', 200)])
    const metrics = computeSheetMetrics(sheet)
    expect(metrics.expenses).toBe(1000)
  })

  it('sums budgets', () => {
    const sheet = makeSheet([], [], [makeBudget(500), makeBudget(300)])
    const metrics = computeSheetMetrics(sheet)
    expect(metrics.budgets).toBe(800)
  })

  it('computes balance as income minus expenses', () => {
    const sheet = makeSheet(
      [makeSalary('Alice', 3000)],
      [makeCharge('FIXE_COMMUN', 1200)],
    )
    const metrics = computeSheetMetrics(sheet)
    expect(metrics.balance).toBe(1800)
  })

  it('balance is negative when expenses exceed income', () => {
    const sheet = makeSheet(
      [makeSalary('Alice', 500)],
      [makeCharge('FIXE_COMMUN', 1000)],
    )
    expect(computeSheetMetrics(sheet).balance).toBe(-500)
  })
})

// ─── aggregateSheetMetrics ────────────────────────────────────────────────────

describe('aggregateSheetMetrics', () => {
  it('returns zeros for empty array', () => {
    const result = aggregateSheetMetrics([])
    expect(result).toEqual({ income: 0, expenses: 0, budgets: 0, balance: 0 })
  })

  it('aggregates multiple sheets correctly', () => {
    const sheet1 = makeSheet([makeSalary('Alice', 2000)], [makeCharge('FIXE_COMMUN', 500)])
    const sheet2 = makeSheet([makeSalary('Bob', 1000)], [makeCharge('FIXE_INDIVIDUEL', 300)])
    const result = aggregateSheetMetrics([sheet1, sheet2])
    expect(result.income).toBe(3000)
    expect(result.expenses).toBe(800)
    expect(result.balance).toBe(2200)
  })

  it('handles a single sheet', () => {
    const sheet = makeSheet([makeSalary('Alice', 1500)], [], [makeBudget(200)])
    const result = aggregateSheetMetrics([sheet])
    expect(result.income).toBe(1500)
    expect(result.budgets).toBe(200)
  })
})

// ─── computeIncomeDistribution ────────────────────────────────────────────────

describe('computeIncomeDistribution', () => {
  it('returns empty distribution with zero income for empty sheet', () => {
    const result = computeIncomeDistribution(makeSheet())
    expect(result.totalIncome).toBe(0)
    expect(result.fixedCommonCharges).toBe(0)
    expect(result.distribution).toHaveLength(0)
  })

  it('calculates percentage per person', () => {
    const sheet = makeSheet([
      makeSalary('Alice', 3000),
      makeSalary('Bob', 1000),
    ])
    const result = computeIncomeDistribution(sheet)
    expect(result.totalIncome).toBe(4000)
    const alice = result.distribution.find((d) => d.person === 'Alice')
    const bob = result.distribution.find((d) => d.person === 'Bob')
    expect(alice?.percentage).toBeCloseTo(0.75, 5)
    expect(bob?.percentage).toBeCloseTo(0.25, 5)
  })

  it('sums salaries from same person across multiple entries', () => {
    const sheet = makeSheet([
      makeSalary('Alice', 2000),
      makeSalary('Alice', 500),
    ])
    const result = computeIncomeDistribution(sheet)
    const alice = result.distribution.find((d) => d.person === 'Alice')
    expect(alice?.amount).toBe(2500)
  })

  it('only counts FIXE_COMMUN charges in fixedCommonCharges', () => {
    const sheet = makeSheet(
      [makeSalary('Alice', 3000)],
      [
        makeCharge('FIXE_COMMUN', 1000),
        makeCharge('FIXE_INDIVIDUEL', 500),
        makeCharge('EXCEPTIONNEL_COMMUN', 300),
      ],
    )
    const result = computeIncomeDistribution(sheet)
    expect(result.fixedCommonCharges).toBe(1000)
  })

  it('distributes fixed charges proportionally', () => {
    const sheet = makeSheet(
      [makeSalary('Alice', 3000), makeSalary('Bob', 1000)],
      [makeCharge('FIXE_COMMUN', 1000)],
    )
    const result = computeIncomeDistribution(sheet)
    const alice = result.distribution.find((d) => d.person === 'Alice')
    const bob = result.distribution.find((d) => d.person === 'Bob')
    // Alice has 75%, Bob has 25%
    expect(alice?.fixedChargeShare).toBeCloseTo(750, 2)
    expect(bob?.fixedChargeShare).toBeCloseTo(250, 2)
  })

  it('sorts distribution by amount descending', () => {
    const sheet = makeSheet([
      makeSalary('Charlie', 1000),
      makeSalary('Alice', 4000),
      makeSalary('Bob', 2000),
    ])
    const result = computeIncomeDistribution(sheet)
    const amounts = result.distribution.map((d) => d.amount)
    expect(amounts[0]).toBeGreaterThanOrEqual(amounts[1])
    expect(amounts[1]).toBeGreaterThanOrEqual(amounts[2])
  })

  it('normalizes ME to Moi and HER to Elle', () => {
    const sheet = makeSheet([
      makeSalary('ME', 2000),
      makeSalary('HER', 1000),
    ])
    const result = computeIncomeDistribution(sheet)
    const persons = result.distribution.map((d) => d.person)
    expect(persons).toContain('Moi')
    expect(persons).toContain('Elle')
    expect(persons).not.toContain('ME')
    expect(persons).not.toContain('HER')
  })

  it('sets fixedChargeShare to 0 when no fixed common charges', () => {
    const sheet = makeSheet([makeSalary('Alice', 1000)])
    const result = computeIncomeDistribution(sheet)
    expect(result.fixedCommonCharges).toBe(0)
    expect(result.distribution[0].fixedChargeShare).toBe(0)
  })

  it('falls back person label to Membre for empty string person', () => {
    const sheet = makeSheet([makeSalary('', 1000), makeSalary('', 500)])
    const result = computeIncomeDistribution(sheet)
    const membre = result.distribution.find((d) => d.person === 'Membre')
    expect(membre).toBeDefined()
    expect(membre!.amount).toBe(1500)
  })
})
