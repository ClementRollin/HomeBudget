import { describe, it, expect } from 'vitest'
import {
  computeCFOMetrics,
  computeGoalProgress,
  computeCFOAlerts,
  type CFOMetrics,
  type GoalProgress,
} from '@/lib/cfo'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseMetrics: CFOMetrics = {
  totalAssets: 100_000,
  totalDebt: 20_000,
  netWorth: 80_000,
  debtRatio: 0.2,
  avgMonthlyIncome: 3_000,
  avgSavingsRate: 0.25,
  totalMonthlyDebt: 400,
  monthsOfData: 6,
}

const noAlertGoals: GoalProgress[] = []

// ─── computeCFOMetrics ────────────────────────────────────────────────────────

describe('computeCFOMetrics', () => {
  it('returns correct netWorth', () => {
    const result = computeCFOMetrics({
      assets: [{ currentValue: 50_000 }, { currentValue: 30_000 }],
      debts: [{ balance: 10_000, monthlyPayment: 200 }],
      sheetMetrics: [],
    })
    expect(result.netWorth).toBe(70_000)
    expect(result.totalAssets).toBe(80_000)
    expect(result.totalDebt).toBe(10_000)
  })

  it('computes debtRatio as totalDebt / totalAssets', () => {
    const result = computeCFOMetrics({
      assets: [{ currentValue: 100_000 }],
      debts: [{ balance: 40_000, monthlyPayment: 0 }],
      sheetMetrics: [],
    })
    expect(result.debtRatio).toBeCloseTo(0.4, 5)
  })

  it('returns debtRatio 0 when no assets', () => {
    const result = computeCFOMetrics({
      assets: [],
      debts: [{ balance: 5_000, monthlyPayment: 100 }],
      sheetMetrics: [],
    })
    expect(result.debtRatio).toBe(0)
  })

  it('computes avgSavingsRate from sheet metrics', () => {
    const result = computeCFOMetrics({
      assets: [],
      debts: [],
      sheetMetrics: [
        { income: 2_000, expenses: 1_200, budgets: 200 },
        { income: 2_000, expenses: 1_400, budgets: 0  },
      ],
    })
    // month1 rate = (2000-1200-200)/2000 = 0.3
    // month2 rate = (2000-1400-0)/2000   = 0.3
    expect(result.avgSavingsRate).toBeCloseTo(0.3, 5)
  })

  it('returns avgSavingsRate 0 when no sheets with income', () => {
    const result = computeCFOMetrics({
      assets: [],
      debts: [],
      sheetMetrics: [{ income: 0, expenses: 0, budgets: 0 }],
    })
    expect(result.avgSavingsRate).toBe(0)
  })
})

// ─── computeGoalProgress ──────────────────────────────────────────────────────

describe('computeGoalProgress', () => {
  it('returns 100% progress when netWorth >= target', () => {
    const goals = [{ id: '1', label: 'Retraite', target: 50_000, horizon: 2050 }]
    const result = computeGoalProgress(goals, 60_000, 2026)
    expect(result[0].progress).toBe(100)
  })

  it('marks goal as atRisk when ≤ 5 years and < 50% progress', () => {
    const goals = [{ id: '1', label: 'Voiture', target: 20_000, horizon: 2028 }]
    const result = computeGoalProgress(goals, 5_000, 2026)
    expect(result[0].yearsLeft).toBe(2)
    expect(result[0].progress).toBeCloseTo(25, 1)
    expect(result[0].atRisk).toBe(true)
  })

  it('does not mark goal as atRisk when progress >= 50%', () => {
    const goals = [{ id: '1', label: 'Projet', target: 10_000, horizon: 2028 }]
    const result = computeGoalProgress(goals, 6_000, 2026)
    expect(result[0].atRisk).toBe(false)
  })

  it('does not mark goal as atRisk when more than 5 years left', () => {
    const goals = [{ id: '1', label: 'Retraite', target: 100_000, horizon: 2040 }]
    const result = computeGoalProgress(goals, 10_000, 2026)
    expect(result[0].yearsLeft).toBe(14)
    expect(result[0].atRisk).toBe(false)
  })
})

// ─── computeCFOAlerts ────────────────────────────────────────────────────────

describe('computeCFOAlerts — no data', () => {
  it('returns a single info alert and nothing else when monthsOfData is 0', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, monthsOfData: 0 },
      [],
      [],
    )
    expect(alerts).toHaveLength(1)
    expect(alerts[0].type).toBe('info')
  })
})

describe('computeCFOAlerts — danger alerts', () => {
  it('alerts danger when netWorth is negative', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, netWorth: -1_000 },
      noAlertGoals,
      [],
    )
    const danger = alerts.filter((a) => a.type === 'danger')
    expect(danger.length).toBeGreaterThanOrEqual(1)
    expect(danger.some((a) => a.message.includes('patrimoine net'))).toBe(true)
  })

  it('alerts danger when avgSavingsRate is negative', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, avgSavingsRate: -0.05 },
      noAlertGoals,
      [],
    )
    const danger = alerts.filter((a) => a.type === 'danger')
    expect(danger.some((a) => a.message.includes("négatif"))).toBe(true)
  })

  it('does NOT fire negative-savings danger when avgMonthlyIncome is 0', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, avgSavingsRate: -0.5, avgMonthlyIncome: 0 },
      noAlertGoals,
      [],
    )
    expect(alerts.every((a) => !a.message.includes("négatif") || a.type !== 'danger')).toBe(true)
  })

  it('alerts danger when effort rate exceeds 50%', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, totalMonthlyDebt: 2_000, avgMonthlyIncome: 3_000 },
      noAlertGoals,
      [],
    )
    const danger = alerts.filter((a) => a.type === 'danger')
    expect(danger.some((a) => a.message.includes("effort"))).toBe(true)
  })
})

describe('computeCFOAlerts — warning alerts', () => {
  it('alerts warning when debtRatio exceeds 50%', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, debtRatio: 0.6 },
      noAlertGoals,
      [],
    )
    const warnings = alerts.filter((a) => a.type === 'warning')
    expect(warnings.some((a) => a.message.includes("endettement"))).toBe(true)
  })

  it('alerts warning when avgSavingsRate is between 0 and 10%', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, avgSavingsRate: 0.05 },
      noAlertGoals,
      [],
    )
    const warnings = alerts.filter((a) => a.type === 'warning')
    expect(warnings.some((a) => a.message.includes("épargne"))).toBe(true)
  })

  it('does NOT fire low-savings warning when avgSavingsRate is 0 and income is 0', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, avgSavingsRate: 0.05, avgMonthlyIncome: 0 },
      noAlertGoals,
      [],
    )
    expect(alerts.every((a) => !a.message.includes("épargne"))).toBe(true)
  })

  it('does NOT fire low-savings warning when rate >= 10%', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, avgSavingsRate: 0.15 },
      noAlertGoals,
      [],
    )
    expect(alerts.every((a) => !a.message.includes("épargne"))).toBe(true)
  })

  it('alerts warning when effort rate is between 35% and 50%', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, totalMonthlyDebt: 1_200, avgMonthlyIncome: 3_000 },
      noAlertGoals,
      [],
    )
    const warnings = alerts.filter((a) => a.type === 'warning')
    expect(warnings.some((a) => a.message.includes("effort"))).toBe(true)
  })

  it('does NOT fire effort warning when no income', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, totalMonthlyDebt: 2_000, avgMonthlyIncome: 0 },
      noAlertGoals,
      [],
    )
    expect(alerts.every((a) => !a.message.includes("effort"))).toBe(true)
  })

  it('fires a warning per at-risk goal', () => {
    const riskyGoals: GoalProgress[] = [
      { id: '1', label: 'Voiture', target: 20_000, horizon: 2028, progress: 10, gap: 18_000, yearsLeft: 2, atRisk: true },
      { id: '2', label: 'Apport', target: 50_000, horizon: 2029, progress: 20, gap: 40_000, yearsLeft: 3, atRisk: true },
    ]
    const alerts = computeCFOAlerts(baseMetrics, riskyGoals, [])
    const goalWarnings = alerts.filter((a) => a.type === 'warning' && a.message.includes('risque'))
    expect(goalWarnings).toHaveLength(2)
  })
})

describe('computeCFOAlerts — info alerts', () => {
  it('alerts info when no assets but income exists', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, totalAssets: 0, totalDebt: 0, netWorth: 0, debtRatio: 0 },
      noAlertGoals,
      [],
    )
    const infos = alerts.filter((a) => a.type === 'info')
    expect(infos.some((a) => a.message.includes("actif"))).toBe(true)
  })

  it('does NOT fire no-assets info when avgMonthlyIncome is 0', () => {
    const alerts = computeCFOAlerts(
      { ...baseMetrics, totalAssets: 0, avgMonthlyIncome: 0 },
      noAlertGoals,
      [],
    )
    expect(alerts.every((a) => a.type !== 'info' || !a.message.includes("actif"))).toBe(true)
  })

  it('propagates fiscal alerts as info', () => {
    const alerts = computeCFOAlerts(baseMetrics, noAlertGoals, ['Alerte fiscale A', 'Alerte fiscale B'])
    const infos = alerts.filter((a) => a.type === 'info')
    expect(infos.some((a) => a.message === 'Alerte fiscale A')).toBe(true)
    expect(infos.some((a) => a.message === 'Alerte fiscale B')).toBe(true)
  })
})

describe('computeCFOAlerts — no false positives on healthy profile', () => {
  it('returns no alerts for a perfectly healthy financial profile', () => {
    const healthyMetrics: CFOMetrics = {
      totalAssets: 200_000,
      totalDebt: 30_000,
      netWorth: 170_000,
      debtRatio: 0.15,
      avgMonthlyIncome: 5_000,
      avgSavingsRate: 0.3,
      totalMonthlyDebt: 800,
      monthsOfData: 12,
    }
    const alerts = computeCFOAlerts(healthyMetrics, noAlertGoals, [])
    expect(alerts).toHaveLength(0)
  })
})
