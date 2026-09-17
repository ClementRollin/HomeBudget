"use client";

import { useState } from "react";
import {
  FormProvider,
  useForm,
  useFieldArray,
  type SubmitHandler,
  type Resolver,
} from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  defaultSheetFormValues,
  sheetFormSchema,
  type SheetFormValues,
} from "@/lib/validations/sheet";
import { SalarySection } from "./SalarySection";
import { ChargesSection } from "./ChargesSection";
import { BudgetSection } from "./BudgetSection";
import { FormActions } from "./FormActions";

interface SheetFormProps {
  sheetId?: string;
  initialValues?: SheetFormValues;
  peopleOptions?: string[];
}

const SheetForm = ({ sheetId, initialValues, peopleOptions }: SheetFormProps) => {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const resolver = zodResolver(sheetFormSchema) as Resolver<SheetFormValues>;

  const providedPeople = peopleOptions ?? [];
  const initialPeople = (initialValues?.salaries ?? [])
    .map((s) => s.person)
    .filter(Boolean);
  const mergedPeople = Array.from(new Set([...providedPeople, ...initialPeople]));
  const people = mergedPeople.length > 0 ? mergedPeople : ["Moi", "Partenaire"];
  const defaultPerson = people[0] ?? "";

  const form = useForm<SheetFormValues>({
    resolver,
    defaultValues: initialValues ?? defaultSheetFormValues(),
  });

  const { fields: salaryFields, append: appendSalary, remove: removeSalary } =
    useFieldArray({ control: form.control, name: "salaries" });
  const { fields: chargeFields, append: appendCharge, remove: removeCharge } =
    useFieldArray({ control: form.control, name: "charges" });
  const { fields: budgetFields, append: appendBudget, remove: removeBudget } =
    useFieldArray({ control: form.control, name: "budgets" });

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
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10 rounded-3xl border border-white/5 bg-muted/30 p-8"
      >
        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="year" className="text-sm text-slate-400">
              Année
            </label>
            <input
              id="year"
              type="number"
              min={2000}
              max={2100}
              {...form.register("year")}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-accent focus:outline-none"
            />
            {errors.year && (
              <p className="mt-1 text-xs text-rose-400">{errors.year.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="month" className="text-sm text-slate-400">
              Mois
            </label>
            <input
              id="month"
              type="number"
              min={1}
              max={12}
              {...form.register("month")}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-accent focus:outline-none"
            />
            {errors.month && (
              <p className="mt-1 text-xs text-rose-400">{errors.month.message}</p>
            )}
          </div>
        </section>

        <SalarySection
          fields={salaryFields}
          onAppend={appendSalary}
          onRemove={removeSalary}
          people={people}
          defaultPerson={defaultPerson}
        />

        <ChargesSection
          fields={chargeFields}
          onAppend={appendCharge}
          onRemove={removeCharge}
        />

        <BudgetSection
          fields={budgetFields}
          onAppend={appendBudget}
          onRemove={removeBudget}
        />

        <FormActions
          isNew={!sheetId}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          serverMessage={serverMessage}
          onDelete={handleDelete}
        />
      </form>
    </FormProvider>
  );
};

export default SheetForm;
