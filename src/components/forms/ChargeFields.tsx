import { useEffect, useMemo } from "react";
import {
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";

import {
  CHARGE_CATEGORIES,
  CHARGE_TYPES,
  DEFAULT_CHARGE_CATEGORY,
  type SheetFormValues,
} from "@/lib/validations/sheet";

interface SalaryStats {
  totals: Map<string, number>;
  global: number;
}

interface ChargeFieldsProps {
  fields: FieldArrayWithId<SheetFormValues, "charges", "id">[];
  register: UseFormRegister<SheetFormValues>;
  append: UseFieldArrayAppend<SheetFormValues, "charges">;
  remove: UseFieldArrayRemove;
  people: string[];
  watchedCharges: SheetFormValues["charges"];
  salaryStats: SalaryStats;
  setValue: UseFormSetValue<SheetFormValues>;
}

type ChargeType = (typeof CHARGE_TYPES)[number];

const CHARGE_TYPE_LABELS: Record<ChargeType, string> = {
  FIXE_COMMUN: "Charges fixes communes",
  FIXE_INDIVIDUEL: "Charges fixes individuelles",
  EXCEPTIONNEL_COMMUN: "Charges exceptionnelles communes",
  EXCEPTIONNEL_INDIVIDUEL: "Charges exceptionnelles individuelles",
};

const INDIVIDUAL_TYPES: ChargeType[] = ["FIXE_INDIVIDUEL", "EXCEPTIONNEL_INDIVIDUEL"];

interface ChargeItem {
  id: string;
  index: number;
  type: ChargeType;
  person?: string | null;
}

const ChargeFields = ({
  fields,
  register,
  append,
  remove,
  people,
  watchedCharges,
  salaryStats,
  setValue,
}: ChargeFieldsProps) => {
  useEffect(() => {
    watchedCharges?.forEach((charge, index) => {
      if (!charge) return;
      if (!INDIVIDUAL_TYPES.includes(charge.type) && charge.person) {
        setValue(`charges.${index}.person`, "");
      }
    });
  }, [watchedCharges, setValue]);

  const groups = useMemo(() => {
    const result = {
      FIXE_COMMUN: [] as ChargeItem[],
      EXCEPTIONNEL_COMMUN: [] as ChargeItem[],
      FIXE_INDIVIDUEL: new Map<string, ChargeItem[]>(),
      EXCEPTIONNEL_INDIVIDUEL: new Map<string, ChargeItem[]>(),
    };

    fields.forEach((field, index) => {
      const value = watchedCharges?.[index];
      const type = (value?.type as ChargeType) ?? CHARGE_TYPES[0];
      const item: ChargeItem = { id: field.id, index, type, person: value?.person };

      if (type === "FIXE_COMMUN" || type === "EXCEPTIONNEL_COMMUN") {
        result[type].push(item);
      } else {
        const owner = value?.person || "Sans personne";
        const map = result[type];
        if (!map.has(owner)) map.set(owner, []);
        map.get(owner)!.push(item);
      }
    });

    return result;
  }, [fields, watchedCharges]);

  const renderChargeLine = (item: ChargeItem) => {
    const current = watchedCharges?.[item.index];
    const type = current?.type as ChargeType;
    const isIndividual = INDIVIDUAL_TYPES.includes(type);
    const member = current?.person;
    const contribution =
      isIndividual && member && salaryStats.global > 0
        ? ((salaryStats.totals.get(member) ?? 0) / salaryStats.global) * 100
        : null;

    return (
      <div key={item.id} className="grid gap-4 rounded-2xl border border-white/5 p-4 md:grid-cols-6">
        <select
          {...register(`charges.${item.index}.type` as const)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm uppercase tracking-wide text-white"
        >
          {CHARGE_TYPES.map((chargeType) => (
            <option key={chargeType} value={chargeType}>
              {chargeType.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          {...register(`charges.${item.index}.person` as const)}
          disabled={!isIndividual}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{isIndividual ? "S‚lectionner" : "Charge commune"}</option>
          {people.map((person) => (
            <option key={person} value={person}>
              {person}
            </option>
          ))}
        </select>
        <input
          list="charge-category-options"
          placeholder="Categorie"
          {...register(`charges.${item.index}.category` as const)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
        />
        <input
          placeholder="Libell‚"
          {...register(`charges.${item.index}.label` as const)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Montant"
          {...register(`charges.${item.index}.amount` as const, { valueAsNumber: true })}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
        />
        <div className="flex flex-col justify-between text-sm">
          {contribution !== null && (
            <p className="text-xs text-slate-400">
              {member}: {contribution.toFixed(0)}% du foyer
            </p>
          )}
          <button type="button" className="text-left text-sm text-rose-400" onClick={() => remove(item.index)}>
            Supprimer
          </button>
        </div>
      </div>
    );
  };

  const renderIndividualGroups = (type: "FIXE_INDIVIDUEL" | "EXCEPTIONNEL_INDIVIDUEL") => {
    const map = groups[type];
    const orderedKeys = [
      ...people.filter((person) => map.has(person)),
      ...Array.from(map.keys()).filter((key) => !people.includes(key)),
    ];

    return orderedKeys.map((person) => (
      <div key={`${type}-${person}`} className="space-y-3 rounded-2xl border border-white/5 p-4">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>{person}</span>
          {salaryStats.global > 0 && person && salaryStats.totals.has(person) ? (
            <span>{(((salaryStats.totals.get(person) ?? 0) / salaryStats.global) * 100).toFixed(0)}% des revenus</span>
          ) : null}
        </div>
        <div className="space-y-3">{map.get(person)?.map((item) => renderChargeLine(item))}</div>
      </div>
    ));
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-white">Charges</h3>
        <p className="text-sm text-slate-400">D‚clarez toutes les d‚penses pr‚vues</p>
      </div>
      <div className="space-y-6">
        {(["FIXE_COMMUN", "EXCEPTIONNEL_COMMUN"] as const).map((type) => (
          <div key={type} className="space-y-3 rounded-3xl border border-white/5 p-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              {CHARGE_TYPE_LABELS[type]}
            </h4>
            {groups[type].length === 0 ? (
              <p className="text-sm text-slate-400">Aucune charge pour le moment</p>
            ) : (
              <div className="space-y-3">{groups[type].map((item) => renderChargeLine(item))}</div>
            )}
          </div>
        ))}
        {(["FIXE_INDIVIDUEL", "EXCEPTIONNEL_INDIVIDUEL"] as const).map((type) => (
          <div key={type} className="space-y-3 rounded-3xl border border-white/5 p-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              {CHARGE_TYPE_LABELS[type]}
            </h4>
            {groups[type].size === 0 ? (
              <p className="text-sm text-slate-400">Aucune charge individuelle</p>
            ) : (
              <div className="space-y-4">{renderIndividualGroups(type)}</div>
            )}
          </div>
        ))}
      </div>
      <datalist id="charge-category-options">
        {CHARGE_CATEGORIES.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
      <button
        type="button"
        onClick={() =>
          append({
            type: CHARGE_TYPES[0],
            person: "",
            category: DEFAULT_CHARGE_CATEGORY,
            label: "",
            amount: 0,
          })
        }
        className="rounded-2xl border border-dashed border-white/10 px-4 py-2 text-sm text-slate-300"
      >
        Ajouter une charge
      </button>
    </section>
  );
};

export default ChargeFields;
