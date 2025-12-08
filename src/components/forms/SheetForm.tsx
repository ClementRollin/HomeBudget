"use client";

import type { ReactNode } from "react";
import { Children, useState } from "react";
import {
  useForm,
  useFieldArray,
  type SubmitHandler,
  type Resolver,
} from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  CHARGE_TYPES,
  PEOPLE,
  defaultSheetFormValues,
  sheetFormSchema,
  type SheetFormValues,
} from "@/lib/validations/sheet";

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
    .map((salary) => salary.person)
    .filter(Boolean);

  const mergedPeople = Array.from(new Set([...providedPeople, ...initialPeople]));

  const people = mergedPeople.length > 0 ? mergedPeople : [...PEOPLE];

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

    <form

      onSubmit={form.handleSubmit(onSubmit)}

      className="space-y-10 rounded-3xl border border-white/5 bg-muted/30 p-8"

    >

      <section className="grid gap-6 md:grid-cols-2">

        <div>

          <label htmlFor="year" className="text-sm text-slate-400">AnnÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©e</label>
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

          <label htmlFor="month" className="text-sm text-slate-400">Mois</label>

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

      <DynamicFieldSection

        title="Salaires"

        description="Enregistrez les revenus du mois pour chacun"

        emptyCta="Ajouter un salaire"

        onAdd={() => appendSalary({ person: defaultPerson, label: "", amount: 0 })}

      >

        {salaryFields.map((field, index) => (

          <div

            key={field.id}

            className="grid gap-4 rounded-2xl border border-white/5 p-4 md:grid-cols-4"

          >

            <select

              {...form.register(`salaries.${index}.person` as const)}

              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"

            >

              {people.map((person) => (

                <option key={person} value={person}>

                  {person}

                </option>

              ))}

            </select>

            <input

              placeholder="LibellÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©"

              {...form.register(`salaries.${index}.label` as const)}

              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"

            />

            <input

              type="number"

              step="0.01"

              placeholder="Montant"

              {...form.register(`salaries.${index}.amount` as const, { valueAsNumber: true })}

              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"

            />

            <button

              type="button"

              className="text-left text-sm text-rose-400"

              onClick={() => removeSalary(index)}

            >

              Supprimer

            </button>

          </div>

        ))}

      </DynamicFieldSection>

      <DynamicFieldSection

        title="Charges"

        description="DÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©clarez toutes les dÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©penses prÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©vues"

        emptyCta="Ajouter une charge"

        onAdd={() =>

          appendCharge({

            type: CHARGE_TYPES[0],

            person: "",

            label: "",

            amount: 0,

          })

        }

      >

        {chargeFields.map((field, index) => (

          <div

            key={field.id}

            className="grid gap-4 rounded-2xl border border-white/5 p-4 md:grid-cols-5"

          >

            <select

              {...form.register(`charges.${index}.type` as const)}

              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"

            >

              {CHARGE_TYPES.map((type) => (

                <option key={type} value={type}>

                  {type.replaceAll("_", " ")}

                </option>

              ))}

            </select>

            <input

              placeholder="Personne (optionnel)"

              {...form.register(`charges.${index}.person` as const)}

              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"

            />

            <input

              placeholder="LibellÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©"

              {...form.register(`charges.${index}.label` as const)}

              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"

            />

            <input

              type="number"

              step="0.01"

              placeholder="Montant"

              {...form.register(`charges.${index}.amount` as const, { valueAsNumber: true })}

              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"

            />

            <button

              type="button"

              className="text-left text-sm text-rose-400"

              onClick={() => removeCharge(index)}

            >

              Supprimer

            </button>

          </div>

        ))}

      </DynamicFieldSection>

      <DynamicFieldSection

        title="Budgets"

        description="RÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©partissez les enveloppes mensuelles"

        emptyCta="Ajouter un budget"

        onAdd={() => appendBudget({ label: "", amount: 0 })}

      >

        {budgetFields.map((field, index) => (

          <div

            key={field.id}

            className="grid gap-4 rounded-2xl border border-white/5 p-4 md:grid-cols-[2fr_1fr_auto]"

          >

            <input

              placeholder="LibellÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©"

              {...form.register(`budgets.${index}.label` as const)}

              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"

            />

            <input

              type="number"

              step="0.01"

              placeholder="Montant"

              {...form.register(`budgets.${index}.amount` as const, { valueAsNumber: true })}

              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"

            />

            <button

              type="button"

              className="text-left text-sm text-rose-400"

              onClick={() => removeBudget(index)}

            >

              Supprimer

            </button>

          </div>

        ))}

      </DynamicFieldSection>

      {serverMessage && <p className="text-sm text-rose-400">{serverMessage}</p>}

      <div className="flex flex-wrap items-center gap-4">

        <button

          type="submit"

          disabled={isSubmitting}

          className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-widest text-slate-900 transition hover:bg-teal-300 disabled:opacity-50"

        >

          {sheetId ? "Mettre ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â  jour" : "CrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©er la fiche"}
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

interface DynamicFieldSectionProps {

  title: string;

  description: string;

  emptyCta: string;

  children: ReactNode;

  onAdd: () => void;

}

const DynamicFieldSection = ({

  title,

  description,

  emptyCta,

  children,

  onAdd,

}: DynamicFieldSectionProps) => {

  const isEmpty = Children.count(children) === 0;

  return (

    <section className="space-y-4">

      <div>

        <h3 className="text-xl font-semibold text-white">{title}</h3>

        <p className="text-sm text-slate-400">{description}</p>

      </div>

      <div className="space-y-4">{children}</div>

      <button

        type="button"

        onClick={onAdd}

        className="rounded-2xl border border-dashed border-white/10 px-4 py-2 text-sm text-slate-300"

      >

        {isEmpty ? emptyCta : "Ajouter un ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©ment"}
      </button>

    </section>

  );

};

export default SheetForm;

