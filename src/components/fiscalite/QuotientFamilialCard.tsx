import { computeQuotientFamilial, computeIRTax, type FamilyMemberFiscal } from "@/lib/fiscalite";
import { formatCurrency } from "@/lib/format";

type Props = {
  members: FamilyMemberFiscal[];
  estimatedAnnualIncome: number;
};

const QuotientFamilialCard = ({ members, estimatedAnnualIncome }: Props) => {
  const { parts, breakdown, isParentIsole } = computeQuotientFamilial(members);
  const ir = computeIRTax(estimatedAnnualIncome, parts);

  const formatParts = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Parts fiscales</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatParts(parts)} parts</p>
          {isParentIsole && (
            <p className="mt-1 text-xs text-amber-400">+0,5 part parent isolé</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">IR estimé</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(ir.taxAmount)}</p>
          <p className="mt-1 text-xs text-slate-400">
            Taux moyen {(ir.averageRate * 100).toFixed(1)} % — Tranche marginale{" "}
            {(ir.marginalRate * 100).toFixed(0)} %
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Revenu de référence</p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {formatCurrency(estimatedAnnualIncome)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Estimation annuelle (cumul fiches)</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
        <p className="mb-3 text-xs uppercase tracking-[0.2rem] text-slate-500">Décomposition</p>
        <ul className="space-y-2">
          {breakdown.map((line, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{line.label}</span>
              <span className="font-semibold text-white">+{formatParts(line.parts)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between border-t border-white/10 pt-2 text-sm">
            <span className="font-semibold text-white">Total</span>
            <span className="font-semibold text-emerald-300">{formatParts(parts)} parts</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default QuotientFamilialCard;
