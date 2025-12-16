"use client";

import { useMemo, useState } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  type SubmitHandler,
  type Resolver,
} from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  PEOPLE,
  defaultSheetFormValues,
  sheetFormSchema,
  type SheetFormValues,
} from "@/lib/validations/sheet";
import SheetPeriodFields from "./SheetPeriodFields";
import SalaryFields from "./SalaryFields";
import ChargeFields from "./ChargeFields";
import BudgetFields from "./BudgetFields";

interface SheetFormProps {
  sheetId?: string;
  initialValues?: SheetFormValues;
  peopleOptions?: string[];
  lockPeriod?: boolean;
}

const SheetForm = ({ sheetId, initialValues, peopleOptions, lockPeriod }: SheetFormProps) => {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const resolver = zodResolver(sheetFormSchema) as Resolver<SheetFormValues>;

  const people = useMemo(() => {
    if (peopleOptions && peopleOptions.length > 0) {
      return peopleOptions;
    }
    const initial = (initialValues?.salaries ?? [])
      .map((salary) => salary.person)
      .filter(Boolean);
    return initial.length > 0 ? Array.from(new Set(initial)) : [...PEOPLE];
  }, [peopleOptions, initialValues]);

  const defaultPerson = people[0] ?? "";

  const form = useForm<SheetFormValues>({
    resolver,
    defaultValues: initialValues ?? defaultSheetFormValues(),
  });

  const {
    fields: salaryFields,
    append: appendSalary,
    remove: removeSalary,
  } = useFieldArray({ control: form.control, name: "salaries" });

  const {
    fields: chargeFields,
    append: appendCharge,
    remove: removeCharge,
  } = useFieldArray({ control: form.control, name: "charges" });

  const {
    fields: budgetFields,
    append: appendBudget,
    remove: removeBudget,
  } = useFieldArray({ control: form.control, name: "budgets" });

  const watchedCharges = useWatch({ control: form.control, name: "charges" });
  const watchedSalaries = useWatch({ control: form.control, name: "salaries" });
  const watchedYear = useWatch({ control: form.control, name: "year" });
  const watchedMonth = useWatch({ control: form.control, name: "month" });

  const salaryStats = useMemo(() => {
    const totals = new Map<string, number>();
    watchedSalaries?.forEach((salary) => {
      if (!salary?.person) return;
      totals.set(salary.person, (totals.get(salary.person) ?? 0) + (salary.amount ?? 0));
    });
    const global = Array.from(totals.values()).reduce((acc, value) => acc + value, 0);
    return { totals, global };
  }, [watchedSalaries]);

  const onSubmit: SubmitHandler<SheetFormValues> = async (values) => {
    setServerMessage(null);
    const response = await fetch(sheetId ? `/api/sheets/${sheetId}` : "/api/sheets", {
      method: sheetId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      setServerMessage(error?.message ?? "Une erreur est survenue.");
      return;
    }

    const payload = await response.json();
    router.push(`/sheets/${payload.id}`);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!sheetId) return;

    setIsDeleting(true);
    setServerMessage(null);

    const response = await fetch(`/api/sheets/${sheetId}`, { method: "DELETE" });

    setIsDeleting(false);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      setServerMessage(error?.message ?? "Impossible de supprimer la fiche.");
      return;
    }

    router.push("/sheets");
    router.refresh();
  };

  const { errors, isSubmitting } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 rounded-3xl border border-white/5 bg-muted/30 p-8">
      <SheetPeriodFields
        register={form.register}
        errors={errors}
        lockPeriod={lockPeriod}
        currentYear={watchedYear}
        currentMonth={watchedMonth}
      />
      <SalaryFields
        fields={salaryFields}
        append={appendSalary}
        remove={removeSalary}
        register={form.register}
        people={people}
        defaultPerson={defaultPerson}
      />
      <ChargeFields
        fields={chargeFields}
        append={appendCharge}
        remove={removeCharge}
        register={form.register}
        people={people}
        watchedCharges={watchedCharges}
        salaryStats={salaryStats}
        setValue={form.setValue}
      />
      <BudgetFields
        fields={budgetFields}
        append={appendBudget}
        remove={removeBudget}
        register={form.register}
      />

      {serverMessage && <p className="text-sm text-rose-400">{serverMessage}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-widest text-slate-900 transition hover:bg-teal-300 disabled:opacity-50"
        >
          {sheetId ? "Mettre à jour" : "Créer la fiche"}
        </button>
        {sheetId ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-2xl border border-rose-500/50 px-4 py-2 text-sm text-rose-300"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default SheetForm;
