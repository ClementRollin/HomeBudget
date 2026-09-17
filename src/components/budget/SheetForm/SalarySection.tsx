"use client";

import type {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { SheetFormValues } from "@/lib/validations/sheet";
import { DynamicFieldSection } from "./DynamicFieldSection";

interface SalarySectionProps {
  fields: FieldArrayWithId<SheetFormValues, "salaries">[];
  onAppend: UseFieldArrayAppend<SheetFormValues, "salaries">;
  onRemove: UseFieldArrayRemove;
  people: string[];
  defaultPerson: string;
}

export const SalarySection = ({
  fields,
  onAppend,
  onRemove,
  people,
  defaultPerson,
}: SalarySectionProps) => {
  const { register } = useFormContext<SheetFormValues>();

  return (
    <DynamicFieldSection
      title="Salaires"
      description="Enregistrez les revenus du mois pour chacun"
      emptyCta="Ajouter un salaire"
      onAdd={() => onAppend({ person: defaultPerson, label: "", amount: 0 })}
    >
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="space-y-3 rounded-2xl border border-white/5 p-4 md:grid md:grid-cols-[1fr_1fr_1fr_auto] md:items-center md:gap-4 md:space-y-0"
        >
          <div className="grid grid-cols-2 gap-3 md:contents">
            <div>
              <label
                htmlFor={`salaries-${index}-person`}
                className="mb-1 block text-xs text-slate-500 md:sr-only"
              >
                Membre
              </label>
              <select
                id={`salaries-${index}-person`}
                {...register(`salaries.${index}.person` as const)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              >
                {people.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={`salaries-${index}-label`}
                className="mb-1 block text-xs text-slate-500 md:sr-only"
              >
                Libellé
              </label>
              <input
                id={`salaries-${index}-label`}
                placeholder="Libellé"
                {...register(`salaries.${index}.label` as const)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:contents">
            <div>
              <label
                htmlFor={`salaries-${index}-amount`}
                className="mb-1 block text-xs text-slate-500 md:sr-only"
              >
                Montant
              </label>
              <input
                id={`salaries-${index}-amount`}
                type="number"
                step="0.01"
                placeholder="Montant"
                {...register(`salaries.${index}.amount` as const, { valueAsNumber: true })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end md:contents">
              <button
                type="button"
                className="text-sm text-rose-400 md:text-center"
                onClick={() => onRemove(index)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ))}
    </DynamicFieldSection>
  );
};
