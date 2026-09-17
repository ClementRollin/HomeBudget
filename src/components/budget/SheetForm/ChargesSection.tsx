"use client";

import type {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from "react-hook-form";
import { useFormContext } from "react-hook-form";
import {
  CHARGE_TYPES,
  CHARGE_TYPE_LABELS,
  type SheetFormValues,
} from "@/lib/validations/sheet";
import { DynamicFieldSection } from "./DynamicFieldSection";

interface ChargesSectionProps {
  fields: FieldArrayWithId<SheetFormValues, "charges">[];
  onAppend: UseFieldArrayAppend<SheetFormValues, "charges">;
  onRemove: UseFieldArrayRemove;
}

export const ChargesSection = ({ fields, onAppend, onRemove }: ChargesSectionProps) => {
  const { register } = useFormContext<SheetFormValues>();

  return (
    <DynamicFieldSection
      title="Charges"
      description="Déclarez toutes les dépenses prévues"
      emptyCta="Ajouter une charge"
      onAdd={() =>
        onAppend({
          type: CHARGE_TYPES[0],
          person: "",
          label: "",
          amount: 0,
        })
      }
    >
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="space-y-3 rounded-2xl border border-white/5 p-4 md:grid md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:items-center md:gap-4 md:space-y-0"
        >
          <div className="grid grid-cols-2 gap-3 md:contents">
            <div>
              <label
                htmlFor={`charges-${index}-type`}
                className="mb-1 block text-xs text-slate-500 md:sr-only"
              >
                Type
              </label>
              <select
                id={`charges-${index}-type`}
                {...register(`charges.${index}.type` as const)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              >
                {CHARGE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {CHARGE_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={`charges-${index}-person`}
                className="mb-1 block text-xs text-slate-500 md:sr-only"
              >
                Personne
              </label>
              <input
                id={`charges-${index}-person`}
                placeholder="Personne (optionnel)"
                {...register(`charges.${index}.person` as const)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:contents">
            <div>
              <label
                htmlFor={`charges-${index}-label`}
                className="mb-1 block text-xs text-slate-500 md:sr-only"
              >
                Libellé
              </label>
              <input
                id={`charges-${index}-label`}
                placeholder="Libellé"
                {...register(`charges.${index}.label` as const)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor={`charges-${index}-amount`}
                className="mb-1 block text-xs text-slate-500 md:sr-only"
              >
                Montant
              </label>
              <input
                id={`charges-${index}-amount`}
                type="number"
                step="0.01"
                placeholder="Montant"
                {...register(`charges.${index}.amount` as const, { valueAsNumber: true })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            className="text-sm text-rose-400 md:text-center"
            onClick={() => onRemove(index)}
          >
            Supprimer
          </button>
        </div>
      ))}
    </DynamicFieldSection>
  );
};
