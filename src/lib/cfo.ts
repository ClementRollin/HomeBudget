import { computeFiscalSummary } from "@/lib/fiscalite";

export type CFOMetrics = {
  totalAssets: number;
  totalDebt: number;
  netWorth: number;
  debtRatio: number;
  avgMonthlyIncome: number;
  avgSavingsRate: number;
  totalMonthlyDebt: number;
  monthsOfData: number;
};

export const computeCFOMetrics = (params: {
  assets: Array<{ currentValue: number }>;
  debts: Array<{ balance: number; monthlyPayment: number }>;
  sheetMetrics: Array<{ income: number; expenses: number; budgets: number }>;
}): CFOMetrics => {
  const totalAssets = params.assets.reduce((s, a) => s + a.currentValue, 0);
  const totalDebt = params.debts.reduce((s, d) => s + d.balance, 0);
  const netWorth = totalAssets - totalDebt;
  const debtRatio = totalAssets > 0 ? totalDebt / totalAssets : 0;
  const totalMonthlyDebt = params.debts.reduce((s, d) => s + d.monthlyPayment, 0);
  const monthsOfData = params.sheetMetrics.length;
  const avgMonthlyIncome =
    monthsOfData > 0
      ? params.sheetMetrics.reduce((s, m) => s + m.income, 0) / monthsOfData
      : 0;
  const rates = params.sheetMetrics
    .filter((m) => m.income > 0)
    .map((m) => (m.income - m.expenses - m.budgets) / m.income);
  const avgSavingsRate =
    rates.length > 0 ? rates.reduce((s, r) => s + r, 0) / rates.length : 0;

  return {
    totalAssets,
    totalDebt,
    netWorth,
    debtRatio,
    avgMonthlyIncome,
    avgSavingsRate,
    totalMonthlyDebt,
    monthsOfData,
  };
};

export type GoalProgress = {
  id: string;
  label: string;
  target: number;
  horizon: number;
  progress: number;
  gap: number;
  yearsLeft: number;
  atRisk: boolean;
};

export const computeGoalProgress = (
  goals: Array<{ id: string; label: string; target: number; horizon: number }>,
  netWorth: number,
  currentYear: number,
): GoalProgress[] =>
  goals.map((g) => {
    const progress = g.target > 0 ? Math.min(100, (netWorth / g.target) * 100) : 100;
    const gap = g.target - netWorth;
    const yearsLeft = g.horizon - currentYear;
    return {
      id: g.id,
      label: g.label,
      target: g.target,
      horizon: g.horizon,
      progress,
      gap,
      yearsLeft,
      atRisk: yearsLeft <= 5 && progress < 50,
    };
  });

export type CFOAlert = {
  type: "danger" | "warning" | "info";
  message: string;
};

export const computeCFOAlerts = (
  metrics: CFOMetrics,
  goalProgress: GoalProgress[],
  fiscalAlerts: string[],
): CFOAlert[] => {
  const alerts: CFOAlert[] = [];

  if (metrics.monthsOfData === 0) {
    alerts.push({
      type: "info",
      message:
        "Aucune fiche mensuelle enregistrée. Créez votre première fiche pour obtenir une analyse budgétaire.",
    });
    return alerts;
  }

  if (metrics.netWorth < 0) {
    alerts.push({
      type: "danger",
      message:
        "Votre patrimoine net est négatif. Vos dettes dépassent la valeur de vos actifs.",
    });
  }
  if (metrics.debtRatio > 0.5) {
    alerts.push({
      type: "warning",
      message: `Votre taux d'endettement est élevé (${(metrics.debtRatio * 100).toFixed(0)} % de vos actifs). Envisagez de réduire vos dettes en priorité.`,
    });
  }
  if (metrics.avgSavingsRate < 0.1 && metrics.avgMonthlyIncome > 0) {
    alerts.push({
      type: "warning",
      message: `Votre taux d'épargne moyen (${(metrics.avgSavingsRate * 100).toFixed(1)} %) est inférieur à 10 %. Cible recommandée : 20 %.`,
    });
  }
  goalProgress.filter((g) => g.atRisk).forEach((g) => {
    alerts.push({
      type: "warning",
      message: `Objectif "${g.label}" à risque : ${g.progress.toFixed(0)} % atteint pour une échéance dans ${g.yearsLeft} an${g.yearsLeft > 1 ? "s" : ""}.`,
    });
  });
  fiscalAlerts.forEach((msg) => alerts.push({ type: "info", message: msg }));

  return alerts;
};

// Re-export pour éviter un import supplémentaire côté page
export { computeFiscalSummary };
