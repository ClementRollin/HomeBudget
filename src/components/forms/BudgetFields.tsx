import {
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFormRegister,
} from "react-hook-form";

import type { SheetFormValues } from "@/lib/validations/sheet";

interface BudgetFieldsProps {
  fields: FieldArrayWithId<SheetFormValues, "budgets", "id">[];
  register: UseFormRegister<SheetFormValues>;
  append: UseFieldArrayAppend<SheetFormValues, "budgets">;
  remove: UseFieldArrayRemove;
}

const BudgetFields = ({ fields, register, append, remove }: BudgetFieldsProps) => (
  <section className="space-y-4">
    <div>
      <h3 className="text-xl font-semibold text-white">Budgets</h3>
      <p className="text-sm text-slate-400">Répartissez les enveloppes mensuelles</p>
    </div>
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid gap-4 rounded-2xl border border-white/5 p-4 md:grid-cols-[2fr_1fr_auto]"
        >
          <input
            placeholder="Libellé"
            {...register(`budgets.${index}.label` as const)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Montant"
            {...register(`budgets.${index}.amount` as const, { valueAsNumber: true })}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
          />
          <button type="button" className="text-left text-sm text-rose-400" onClick={() => remove(index)}>
            Supprimer
          </button>
        </div>
      ))}
    </div>
    <button
      type="button"
      onClick={() => append({ label: "", amount: 0 })}
      className="rounded-2xl border border-dashed border-white/10 px-4 py-2 text-sm text-slate-300"
    >
      Ajouter un budget
    </button>
  </section>
);

export default BudgetFields;
