"use client";

import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/format";
import { CHARGE_TYPES } from "@/lib/validations/sheet";

export type ChargeFilterItem = {
  id: string;
  type: (typeof CHARGE_TYPES)[number];
  person: string;
  label: string;
  amount: number;
};

const FILTERS = ["TOUTES", ...CHARGE_TYPES] as const;

const TYPE_LABELS: Record<(typeof CHARGE_TYPES)[number], string> = {
  FIXE_COMMUN: "Fixes communes",
  FIXE_INDIVIDUEL: "Fixes individuelles",
  EXCEPTIONNEL_COMMUN: "Exceptionnelles communes",
  EXCEPTIONNEL_INDIVIDUEL: "Exceptionnelles individuelles",
};

const FILTER_LABELS: Record<(typeof FILTERS)[number], string> = {
  TOUTES: "Toutes",
  ...TYPE_LABELS,
};

type Props = {
  charges: ChargeFilterItem[];
};

const ChargesOverview = ({ charges }: Props) => {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("TOUTES");

  const filteredCharges = useMemo(
    () =>
      activeFilter === "TOUTES"
        ? charges
        : charges.filter((charge) => charge.type === activeFilter),
    [activeFilter, charges],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${
              activeFilter === filter
                ? "border-accent bg-accent/10 text-accent"
                : "border-white/10 text-slate-400 hover:border-accent/40"
            }`}
          >
            {FILTER_LABELS[filter]}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filteredCharges.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aucune charge dans cette catégorie pour le moment.
          </p>
        ) : (
          filteredCharges.map((charge) => (
            <div
              key={charge.id}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-white">{charge.label}</p>
                <p className="text-xs text-slate-400">
                  {TYPE_LABELS[charge.type]} · {charge.person}
                </p>
              </div>
              <p className="text-sm font-semibold text-white">
                {formatCurrency(charge.amount)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChargesOverview;
