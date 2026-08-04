export type AmortizationRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remaining: number;
};

export type SimulationResult = {
  standardMonths: number;
  withExtraMonths: number;
  monthsSaved: number;
  standardTotalInterest: number;
  withExtraTotalInterest: number;
  interestSaved: number;
};

/**
 * Construit le tableau d'amortissement complet.
 * Si rate === 0 : remboursement linéaire (pas d'intérêts).
 * S'arrête quand remaining <= 0.01 ou maxMonths atteint.
 */
export const buildAmortizationSchedule = (
  balance: number,
  annualRate: number,
  monthlyPayment: number,
  maxMonths = 480,
): AmortizationRow[] => {
  if (balance <= 0 || monthlyPayment <= 0) return [];

  const monthlyRate = annualRate / 12 / 100;
  const rows: AmortizationRow[] = [];
  let remaining = balance;

  for (let i = 1; i <= maxMonths && remaining > 0.01; i++) {
    const interest = remaining * monthlyRate;
    const principal = Math.min(monthlyPayment - interest, remaining);
    // Mensualité insuffisante pour couvrir les intérêts
    if (principal <= 0) break;
    remaining = Math.max(0, remaining - principal);
    rows.push({ month: i, payment: monthlyPayment, principal, interest, remaining });
  }

  return rows;
};

/**
 * Simule l'impact d'un versement anticipé unique.
 * Retourne null si les données sont invalides (balance <= 0 ou extraPayment >= balance).
 */
export const simulateEarlyRepayment = (
  balance: number,
  annualRate: number,
  monthlyPayment: number,
  extraPayment: number,
): SimulationResult | null => {
  if (balance <= 0 || monthlyPayment <= 0 || extraPayment <= 0 || extraPayment >= balance) {
    return null;
  }

  const standard = buildAmortizationSchedule(balance, annualRate, monthlyPayment);
  const withExtra = buildAmortizationSchedule(balance - extraPayment, annualRate, monthlyPayment);

  const standardTotalInterest = standard.reduce((sum, r) => sum + r.interest, 0);
  const withExtraTotalInterest = withExtra.reduce((sum, r) => sum + r.interest, 0);

  return {
    standardMonths: standard.length,
    withExtraMonths: withExtra.length,
    monthsSaved: standard.length - withExtra.length,
    standardTotalInterest,
    withExtraTotalInterest,
    interestSaved: standardTotalInterest - withExtraTotalInterest,
  };
};
