"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { fiscalConfigSchema, type FiscalConfigValues } from "@/lib/validations/fiscalite";

type Props = {
  initialIsCoupled: boolean;
  initialPerContribYTD: number;
};

const FiscalConfigEditor = ({ initialIsCoupled, initialPerContribYTD }: Props) => {
  const router = useRouter();
  const [saved, setSaved] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FiscalConfigValues>({
    resolver: zodResolver(fiscalConfigSchema),
    defaultValues: {
      isCoupled: initialIsCoupled,
      perContribYTD: initialPerContribYTD,
    },
  });

  const onSubmit = async (data: FiscalConfigValues) => {
    setSaved(null);
    const res = await fetch("/api/fiscal-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setSaved(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
      <p className="text-sm font-semibold text-white">Configuration fiscale</p>
      <p className="mt-1 text-xs text-slate-400">Paramètres pour le calcul de vos plafonds.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isCoupled"
            {...register("isCoupled")}
            className="h-4 w-4 rounded border-white/20 bg-white/10 accent-emerald-400"
          />
          <label htmlFor="isCoupled" className="text-sm text-slate-300">
            Foyer fiscal couple (PACS/mariage)
          </label>
        </div>

        <div className="space-y-1">
          <label htmlFor="perContribYTD" className="text-xs uppercase tracking-[0.2rem] text-slate-500">
            Versements PER cette année (€)
          </label>
          <input
            id="perContribYTD"
            type="number"
            step="0.01"
            min="0"
            {...register("perContribYTD", { valueAsNumber: true })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-accent focus:outline-none"
            placeholder="0"
          />
          {errors.perContribYTD && (
            <p className="text-xs text-rose-400">{errors.perContribYTD.message}</p>
          )}
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
            <p className="text-xs text-emerald-400">Configuration enregistrée.</p>
          )}
          {saved === false && (
            <p className="text-xs text-rose-400">Erreur lors de l&apos;enregistrement.</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default FiscalConfigEditor;
