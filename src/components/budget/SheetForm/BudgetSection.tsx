"use client";

import type {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { SheetFormValues } from "@/lib/validations/sheet";
import { DynamicFieldSection } from "./DynamicFieldSection";

interface BudgetSectionProps {
  fields: FieldArrayWithId<SheetFormValues, "budgets">[];
  onAppend: UseFieldArrayAppend<SheetFormValues, "budgets">;
  onRemove: UseFieldArrayRemove;
}

export const BudgetSection = ({ fields, onAppend, onRemove }: BudgetSectionProps) => {
  const { register } = useFormContext<SheetFormValues>();

  return (
    <DynamicFieldSection
      title="Budgets"
      description="Répartissez les enveloppes mensuelles"
      emptyCta="Ajouter un budget"
      onAdd={() => onAppend({ label: "", amount: 0 })}
    >
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid gap-4 rounded-2xl border border-white/5 p-4 md:grid-cols-[2fr_1fr_auto]"
        >
          <div>
            <label htmlFor={`budgets-${index}-label`} className="sr-only">
              Libellé
            </label>
            <input
              id={`budgets-${index}-label`}
              placeholder="Libellé"
              {...register(`budgets.${index}.label` as const)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor={`budgets-${index}-amount`} className="sr-only">
              Montant
            </label>
            <input
              id={`budgets-${index}-amount`}
              type="number"
              step="0.01"
              placeholder="Montant"
              {...register(`budgets.${index}.amount` as const, { valueAsNumber: true })}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
            />
          </div>
          <button
            type="button"
            className="text-left text-sm text-rose-400"
            onClick={() => onRemove(index)}
          >
            Supprimer
          </button>
        </div>
      ))}
    </DynamicFieldSection>
  );
};
