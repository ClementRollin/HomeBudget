"use client";

import { formatCurrency } from "@/lib/format";

type CategoryItem = {
  label: string;
  amount: number;
};

type Props = {
  title: string;
  subtitle?: string;
  emptyLabel: string;
  items: CategoryItem[];
  variant?: "positive" | "negative";
};

const CategoryBreakdown = ({
  title,
  subtitle,
  emptyLabel,
  items,
  variant = "positive",
}: Props) => {
  const filtered = items.filter((item) => item.amount > 0);
  const total = filtered.reduce((sum, item) => sum + item.amount, 0);
  const sorted = [...filtered].sort((a, b) => b.amount - a.amount);
  const barColor = variant === "negative" ? "bg-rose-400" : "bg-emerald-400";

  return (
    <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        <p className="text-sm font-semibold text-white">{formatCurrency(total)}</p>
      </div>
      <div className="mt-6 space-y-4">
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-400">{emptyLabel}</p>
        ) : (
          sorted.map((item) => {
            const percent = total > 0 ? Math.round((item.amount / total) * 100) : 0;
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="font-medium text-white">{item.label}</span>
                  <span>
                    {formatCurrency(item.amount)} · {percent}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5">
                  <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
