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
  lockPeriod?: boolean;
  currentYear?: number;
  currentMonth?: number;
}

const SheetPeriodFields = ({
  register,
  errors,
  lockPeriod,
  currentYear,
  currentMonth,
}: SheetPeriodFieldsProps) => {
  const lockedYear = currentYear ?? CURRENT_YEAR;
  const lockedMonth = currentMonth ?? new Date().getMonth() + 1;

  const renderYearField = () =>
    lockPeriod ? (
      <>
        <input type="hidden" value={lockedYear} {...register("year", { valueAsNumber: true })} />
        <div className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-200 cursor-not-allowed">
          {lockedYear}
        </div>
      </>
    ) : (
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
    );

  const renderMonthField = () =>
    lockPeriod ? (
      <>
        <input type="hidden" value={lockedMonth} {...register("month", { valueAsNumber: true })} />
        <div className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-200 cursor-not-allowed">
          {MONTH_OPTIONS.find((option) => option.value === lockedMonth)?.label ?? lockedMonth}
        </div>
      </>
    ) : (
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
    );

  return (
    <section className="grid gap-6 md:grid-cols-2">
      {lockPeriod ? (
        <div className="md:col-span-2 -mb-2 text-xs text-slate-500">
          Période définie automatiquement (ajustée au mois courant ou suivant).
        </div>
      ) : null}
      <div>
        <label htmlFor="year" className="text-sm text-slate-400">
          Année
        </label>
        {renderYearField()}
        {errors.year && <p className="mt-1 text-xs text-rose-400">{errors.year.message}</p>}
      </div>
      <div>
        <label htmlFor="month" className="text-sm text-slate-400">
          Mois
        </label>
        {renderMonthField()}
        {errors.month && <p className="mt-1 text-xs text-rose-400">{errors.month.message}</p>}
      </div>
    </section>
  );
};

export default SheetPeriodFields;
