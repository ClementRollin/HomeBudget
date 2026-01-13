"use client";

import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/format";
import { DEFAULT_CHARGE_CATEGORY } from "@/lib/validations/sheet";

export type ChargeFilterItem = {
  id: string;
  category: string;
  person: string;
  label: string;
  amount: number;
};

type FilterValue = "TOUTES" | string;

const ChargesOverview = ({ charges }: { charges: ChargeFilterItem[] }) => {
  const categories = useMemo(() => {
    const unique = new Set<string>();
    charges.forEach((charge) => {
      unique.add(charge.category || DEFAULT_CHARGE_CATEGORY);
    });
    return Array.from(unique);
  }, [charges]);

  const [activeFilter, setActiveFilter] = useState<FilterValue>("TOUTES");

  const filteredCharges = useMemo(
    () =>
      activeFilter === "TOUTES"
        ? charges
        : charges.filter((charge) => (charge.category || DEFAULT_CHARGE_CATEGORY) === activeFilter),
    [activeFilter, charges],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["TOUTES", ...categories].map((filter) => (
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
            {filter === "TOUTES" ? "Toutes" : filter}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filteredCharges.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aucune charge dans cette categorie pour le moment.
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
                  {(charge.category || DEFAULT_CHARGE_CATEGORY) + " · " + charge.person}
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
