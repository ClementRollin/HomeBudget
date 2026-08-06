"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { memberUpdateSchema, type MemberUpdateInput } from "@/lib/validations/member";

const FISCAL_ROLE_LABELS: Record<string, string> = {
  DECLARANT_1: "Déclarant 1 (case 1AJ)",
  DECLARANT_2: "Déclarant 2 (case 1BJ)",
  DEPENDENT_CHILD: "Enfant mineur",
  DEPENDENT_ADULT: "Enfant majeur rattaché",
  ASCENDANT: "Ascendant à charge",
};

type MemberData = {
  id: string;
  displayName: string;
  birthDate: string | null;
  fiscalRole: string;
  isAlternateGuard: boolean;
  isDisabled: boolean;
};

type Props = {
  member: MemberData;
  onSuccess: () => void;
};

const MemberFiscalEditor = ({ member, onSuccess }: Props) => {
  const router = useRouter();
  const [saved, setSaved] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MemberUpdateInput>({
    resolver: zodResolver(memberUpdateSchema),
    defaultValues: {
      displayName: member.displayName,
      birthDate: member.birthDate ?? null,
      fiscalRole: member.fiscalRole as MemberUpdateInput["fiscalRole"],
      isAlternateGuard: member.isAlternateGuard,
      isDisabled: member.isDisabled,
    },
  });

  const fiscalRole = useWatch({ control, name: "fiscalRole" });
  const showAlternateGuard =
    fiscalRole === "DEPENDENT_CHILD" || fiscalRole === "DEPENDENT_ADULT";

  const onSubmit = async (data: MemberUpdateInput) => {
    setSaved(null);
    const res = await fetch(`/api/family/members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
      onSuccess();
    } else {
      setSaved(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
      <p className="text-sm font-semibold text-white">{member.displayName}</p>
      <p className="mt-1 text-xs text-slate-400">Rôle fiscal et informations du membre.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
        <div className="space-y-1">
          <label htmlFor={`displayName-${member.id}`} className="text-xs uppercase tracking-[0.2rem] text-slate-500">
            Prénom / nom affiché
          </label>
          <input
            id={`displayName-${member.id}`}
            type="text"
            {...register("displayName")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-accent focus:outline-none dark:bg-white/5"
          />
          {errors.displayName && (
            <p className="text-xs text-rose-400">{errors.displayName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor={`birthDate-${member.id}`} className="text-xs uppercase tracking-[0.2rem] text-slate-500">
            Date de naissance
          </label>
          <input
            id={`birthDate-${member.id}`}
            type="date"
            {...register("birthDate")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none dark:bg-white/5 dark:[color-scheme:dark]"
          />
          {errors.birthDate && (
            <p className="text-xs text-rose-400">{errors.birthDate.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor={`fiscalRole-${member.id}`} className="text-xs uppercase tracking-[0.2rem] text-slate-500">
            Rôle fiscal
          </label>
          <select
            id={`fiscalRole-${member.id}`}
            {...register("fiscalRole")}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none dark:bg-slate-900"
          >
            {Object.entries(FISCAL_ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.fiscalRole && (
            <p className="text-xs text-rose-400">{errors.fiscalRole.message}</p>
          )}
        </div>

        {showAlternateGuard && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`isAlternateGuard-${member.id}`}
              {...register("isAlternateGuard")}
              className="h-4 w-4 rounded border-white/20 bg-white/10 accent-emerald-400"
            />
            <label htmlFor={`isAlternateGuard-${member.id}`} className="text-sm text-slate-300">
              Garde alternée (divise les parts par 2)
            </label>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`isDisabled-${member.id}`}
            {...register("isDisabled")}
            className="h-4 w-4 rounded border-white/20 bg-white/10 accent-emerald-400"
          />
          <label htmlFor={`isDisabled-${member.id}`} className="text-sm text-slate-300">
            Situation de handicap (+0,5 part)
          </label>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-accent disabled:opacity-50"
          >
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </button>
          {saved === true && (
            <p className="text-xs text-emerald-400">Enregistré.</p>
          )}
          {saved === false && (
            <p className="text-xs text-rose-400">Erreur lors de l&apos;enregistrement.</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default MemberFiscalEditor;
