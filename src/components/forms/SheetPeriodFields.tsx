import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { SheetFormValues } from "@/lib/validations/sheet";

const MONTH_OPTIONS = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, index) => {
  const value = CURRENT_YEAR - 4 + index;
  return { value, label: `${value}` };
});

interface SheetPeriodFieldsProps {
  register: UseFormRegister<SheetFormValues>;
  errors: FieldErrors<SheetFormValues>;
}

const SheetPeriodFields = ({ register, errors }: SheetPeriodFieldsProps) => (
  <section className="grid gap-6 md:grid-cols-2">
    <div>
      <label htmlFor="year" className="text-sm text-slate-400">
        Année
      </label>
      <select
        id="year"
        {...register("year", { valueAsNumber: true })}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-accent focus:outline-none"
      >
        {YEAR_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {errors.year && <p className="mt-1 text-xs text-rose-400">{errors.year.message}</p>}
    </div>
    <div>
      <label htmlFor="month" className="text-sm text-slate-400">
        Mois
      </label>
      <select
        id="month"
        {...register("month", { valueAsNumber: true })}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-accent focus:outline-none"
      >
        {MONTH_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {errors.month && <p className="mt-1 text-xs text-rose-400">{errors.month.message}</p>}
    </div>
  </section>
);

export default SheetPeriodFields;
