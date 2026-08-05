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

export type FamilyMemberFiscal = {
  fiscalRole: "DECLARANT_1" | "DECLARANT_2" | "DEPENDENT_CHILD" | "DEPENDENT_ADULT" | "ASCENDANT";
  isAlternateGuard: boolean;
  isDisabled: boolean;
};

export type QuotientResult = {
  parts: number;
  breakdown: Array<{ label: string; parts: number }>;
  isParentIsole: boolean;
};

export type IRResult = {
  taxAmount: number;
  marginalRate: number;
  averageRate: number;
};

export const IR_BRACKETS_2024 = [
  { max: 11_294,   rate: 0    },
  { max: 28_797,   rate: 0.11 },
  { max: 82_341,   rate: 0.30 },
  { max: 177_106,  rate: 0.41 },
  { max: Infinity, rate: 0.45 },
] as const;

export const QF_CAP_PER_HALF_PART = 1_759;

export const computeQuotientFamilial = (members: FamilyMemberFiscal[]): QuotientResult => {
  const hasDeclarant2 = members.some((m) => m.fiscalRole === "DECLARANT_2");
  const dependents = members.filter(
    (m) => m.fiscalRole === "DEPENDENT_CHILD" || m.fiscalRole === "DEPENDENT_ADULT",
  );
  const ascendants = members.filter((m) => m.fiscalRole === "ASCENDANT");

  const breakdown: Array<{ label: string; parts: number }> = [];

  // Parts de base
  const baseParts = hasDeclarant2 ? 2 : 1;
  breakdown.push({ label: hasDeclarant2 ? "Couple (déclarants 1 et 2)" : "Déclarant 1", parts: baseParts });

  let dependentParts = 0;
  dependents.forEach((dep, index) => {
    const rank = index + 1;
    const isAlternate = dep.isAlternateGuard;
    // 1er et 2e enfant : 0.5 part (0.25 en alternée), 3e+ : 1 part (0.5 en alternée)
    const basePart = rank <= 2 ? 0.5 : 1;
    const part = isAlternate ? basePart / 2 : basePart;
    const label =
      dep.fiscalRole === "DEPENDENT_ADULT"
        ? `Enfant majeur rattaché n°${rank}${isAlternate ? " (garde alternée)" : ""}`
        : `Enfant n°${rank}${isAlternate ? " (garde alternée)" : ""}`;
    breakdown.push({ label, parts: part });
    dependentParts += part;

    if (dep.isDisabled) {
      const disabledPart = isAlternate ? 0.25 : 0.5;
      breakdown.push({ label: `Handicap enfant n°${rank}`, parts: disabledPart });
      dependentParts += disabledPart;
    }
  });

  // Parts ascendants
  ascendants.forEach((_, index) => {
    breakdown.push({ label: `Ascendant à charge n°${index + 1}`, parts: 0.5 });
  });
  const ascendantParts = ascendants.length * 0.5;

  // Parent isolé : DECLARANT_1 sans DECLARANT_2, avec au moins un enfant à charge
  const isParentIsole = !hasDeclarant2 && dependents.length > 0;
  if (isParentIsole) {
    breakdown.push({ label: "Majoration parent isolé", parts: 0.5 });
  }

  const parts =
    baseParts +
    dependentParts +
    ascendantParts +
    (isParentIsole ? 0.5 : 0);

  return { parts, breakdown, isParentIsole };
};

const computeIRBase = (income: number): number => {
  let tax = 0;
  let previousMax = 0;
  for (const bracket of IR_BRACKETS_2024) {
    if (income <= previousMax) break;
    const taxableInBracket = Math.min(income, bracket.max) - previousMax;
    tax += taxableInBracket * bracket.rate;
    previousMax = bracket.max;
    if (bracket.max === Infinity) break;
  }
  return tax;
};

const getMarginalRate = (income: number): number => {
  for (const bracket of IR_BRACKETS_2024) {
    if (income <= bracket.max) return bracket.rate;
  }
  return 0.45;
};

export const computeIRTax = (annualIncome: number, parts: number): IRResult => {
  const quotient = annualIncome / parts;
  const taxOnQuotient = computeIRBase(quotient);
  let taxAmount = taxOnQuotient * parts;

  // Plafonnement du quotient familial : comparer avec IR d'un célibataire (1 part)
  // L'économie d'impôt liée aux demi-parts supplémentaires est plafonnée
  const extraHalfParts = (parts - 1) * 2;
  if (extraHalfParts > 0) {
    const taxSingle = computeIRBase(annualIncome);
    const maxSaving = QF_CAP_PER_HALF_PART * extraHalfParts;
    const actualSaving = taxSingle - taxAmount;
    if (actualSaving > maxSaving) {
      taxAmount = taxSingle - maxSaving;
    }
  }

  taxAmount = Math.max(0, taxAmount);
  const marginalRate = getMarginalRate(annualIncome / parts);
  const averageRate = annualIncome > 0 ? taxAmount / annualIncome : 0;

  return { taxAmount, marginalRate, averageRate };
};

// ─── Feature F1 : Aide à la déclaration 2042 ────────────────────────────────

export type SheetWithSalaries = {
  year: number;
  month: number;
  salaries: Array<{ memberId: string | null; amount: number }>;
};

export type FamilyMemberFiscalWithId = FamilyMemberFiscal & {
  id: string;
  displayName: string;
};

// Ventile les salaires par déclarant (1AJ / 1BJ)
export const computeIncomeByDeclarant = (
  sheets: SheetWithSalaries[],
  members: FamilyMemberFiscalWithId[]
): { case1AJ: number; case1BJ: number } => {
  const memberRoleMap = new Map<string, FamilyMemberFiscalWithId["fiscalRole"]>();
  for (const m of members) {
    memberRoleMap.set(m.id, m.fiscalRole);
  }

  let case1AJ = 0;
  let case1BJ = 0;

  for (const sheet of sheets) {
    for (const salary of sheet.salaries) {
      const role = salary.memberId ? memberRoleMap.get(salary.memberId) : undefined;
      if (role === "DECLARANT_2") {
        case1BJ += salary.amount;
      } else {
        // DECLARANT_1, ou rôle non assigné → case 1AJ par défaut
        case1AJ += salary.amount;
      }
    }
  }

  return { case1AJ, case1BJ };
};

export type Declaration2042Case = {
  code: string;          // ex. "1AJ"
  label: string;         // ex. "Salaires déclarant 1"
  amount: number;
  source: "computed" | "manual" | "ai_extracted";
  previousAmount?: number;
  delta?: number;        // (amount - previousAmount) / previousAmount * 100
  page: number;
  section: string;
};

export type Declaration2042Result = {
  cases: Declaration2042Case[];
  warnings: string[];
};

// Construit le mapping complet des cases 2042
export const buildDeclaration2042 = (params: {
  case1AJ: number;
  case1BJ: number;
  perContribYTD: number;    // → 6NS (déduction PER)
  dividends: number;         // → 2DC
  capitalGains: number;      // → 3VG
  rentalIncome: number;      // → 4BA
  previousYearCases?: Record<string, number>;
}): Declaration2042Result => {
  const { case1AJ, case1BJ, perContribYTD, dividends, capitalGains, rentalIncome, previousYearCases } = params;

  const buildCase = (
    code: string,
    label: string,
    amount: number,
    source: Declaration2042Case["source"],
    page: number,
    section: string,
  ): Declaration2042Case => {
    const prev = previousYearCases?.[code];
    const delta =
      prev !== undefined && prev !== 0
        ? ((amount - prev) / prev) * 100
        : undefined;
    return { code, label, amount, source, previousAmount: prev, delta, page, section };
  };

  const cases: Declaration2042Case[] = [
    buildCase("1AJ", "Salaires traitements D1", case1AJ, "computed", 3, "Traitements et salaires"),
    buildCase("1BJ", "Salaires traitements D2", case1BJ, "computed", 3, "Traitements et salaires"),
    buildCase("2DC", "Dividendes", dividends, dividends > 0 ? "manual" : "computed", 3, "Revenus de capitaux mobiliers"),
    buildCase("6NS", "Cotisations PER déductibles", perContribYTD, "computed", 4, "Charges déductibles"),
    buildCase("3VG", "Plus-values", capitalGains, capitalGains > 0 ? "manual" : "computed", 4, "Plus-values et gains divers"),
    buildCase("4BA", "Revenus fonciers", rentalIncome, rentalIncome > 0 ? "manual" : "computed", 4, "Revenus fonciers"),
  ];

  const warnings: string[] = [];
  for (const c of cases) {
    if (c.amount > 0 && c.source === "manual") {
      warnings.push(`Vérifiez la case ${c.code} (${c.label}) : montant saisi manuellement.`);
    }
  }

  return { cases, warnings };
};
