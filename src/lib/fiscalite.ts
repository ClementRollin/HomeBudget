// Constantes fiscales 2024
export const PASS_2024 = 46_368;
export const PER_CEILING_RATE = 0.10;
export const PER_CEILING_MIN = 4_637;
export const PER_CEILING_MAX = 37_094;

export const computePERCeiling = (annualIncome: number): number => {
  return Math.max(PER_CEILING_MIN, Math.min(annualIncome * PER_CEILING_RATE, PER_CEILING_MAX));
};

export const computeAVAbatement = (isCoupled: boolean): number =>
  isCoupled ? 9_200 : 4_600;

export const estimateAnnualIncome = (sheetMetrics: Array<{ income: number }>): number =>
  sheetMetrics.reduce((sum, m) => sum + m.income, 0);

export type FiscalSummary = {
  estimatedAnnualIncome: number;
  perCeiling: number;
  perContribYTD: number;
  perRemaining: number;
  perUsagePercent: number;
  avAbatement: number;
  avTotalValue: number;
  avTotalGains: number;
  avGainsVsAbatement: number;
  alerts: string[];
};

export const computeFiscalSummary = (params: {
  sheetMetrics: Array<{ income: number }>;
  perContribYTD: number;
  isCoupled: boolean;
  avAssets: Array<{ currentValue: number; plusValue: number }>;
}): FiscalSummary => {
  const estimatedAnnualIncome = estimateAnnualIncome(params.sheetMetrics);
  const perCeiling = computePERCeiling(estimatedAnnualIncome);
  const perRemaining = Math.max(0, perCeiling - params.perContribYTD);
  const perUsagePercent = perCeiling > 0 ? (params.perContribYTD / perCeiling) * 100 : 0;
  const avAbatement = computeAVAbatement(params.isCoupled);
  const avTotalValue = params.avAssets.reduce((s, a) => s + a.currentValue, 0);
  const avTotalGains = params.avAssets.reduce((s, a) => s + a.plusValue, 0);
  const avGainsVsAbatement = avTotalGains - avAbatement;

  const alerts: string[] = [];
  const currentMonth = new Date().getMonth() + 1;
  if (currentMonth >= 10 && perRemaining > 0) {
    alerts.push(`Il vous reste ${perRemaining.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })} de plafond PER à utiliser avant le 31 décembre.`);
  }
  if (avGainsVsAbatement > 0) {
    alerts.push(`Vos gains sur AV (${avTotalGains.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}) dépassent l'abattement annuel de ${avAbatement.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}. Anticipez les rachats partiels.`);
  }
  if (params.perContribYTD > perCeiling) {
    alerts.push(`Vos versements PER (${params.perContribYTD.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}) dépassent votre plafond déductible. L'excédent n'est pas déductible fiscalement.`);
  }

  return {
    estimatedAnnualIncome,
    perCeiling,
    perContribYTD: params.perContribYTD,
    perRemaining,
    perUsagePercent,
    avAbatement,
    avTotalValue,
    avTotalGains,
    avGainsVsAbatement,
    alerts,
  };
};
