interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  variant?: "default" | "positive" | "negative";
}

const STAT_VARIANTS: Record<Exclude<StatCardProps["variant"], undefined>, string> = {
  default: "from-slate-900/60 via-slate-900/20 to-slate-900/5",
  positive: "from-emerald-900/60 via-emerald-900/20 to-emerald-900/5",
  negative: "from-rose-900/60 via-rose-900/20 to-rose-900/5",
};

const StatCard = ({ label, value, helper, variant = "default" }: StatCardProps) => {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-linear-to-br p-6 ${STAT_VARIANTS[variant]}`}
    >
      <p className="text-sm uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-2 text-xs text-slate-400">{helper}</p> : null}
    </div>
  );
};

export default StatCard;
