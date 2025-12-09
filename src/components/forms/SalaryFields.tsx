import {
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFormRegister,
} from "react-hook-form";

import type { SheetFormValues } from "@/lib/validations/sheet";

interface SalaryFieldsProps {
  fields: FieldArrayWithId<SheetFormValues, "salaries", "id">[];
  append: UseFieldArrayAppend<SheetFormValues, "salaries">;
  remove: UseFieldArrayRemove;
  register: UseFormRegister<SheetFormValues>;
  people: string[];
  defaultPerson: string;
}

const SalaryFields = ({ fields, append, remove, register, people, defaultPerson }: SalaryFieldsProps) => (
  <section className="space-y-4">
    <div>
      <h3 className="text-xl font-semibold text-white">Salaires</h3>
      <p className="text-sm text-slate-400">Enregistrez les revenus du mois pour chacun</p>
    </div>
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-4 rounded-2xl border border-white/5 p-4 md:grid-cols-4">
          <select
            {...register(`salaries.${index}.person` as const)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
          >
            {people.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
          <input
            placeholder="Libellé"
            {...register(`salaries.${index}.label` as const)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Montant"
            {...register(`salaries.${index}.amount` as const, { valueAsNumber: true })}
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
      onClick={() => append({ person: defaultPerson || people[0] || "", label: "", amount: 0 })}
      className="rounded-2xl border border-dashed border-white/10 px-4 py-2 text-sm text-slate-300"
    >
      Ajouter un salaire
    </button>
  </section>
);

export default SalaryFields;
