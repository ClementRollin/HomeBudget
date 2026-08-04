import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { decryptAsset } from "@/lib/patrimoine";
import { decryptSheet, computeSheetMetrics, type SecureSheet } from "@/lib/sheets";
import { computeFiscalSummary } from "@/lib/fiscalite";
import { decryptNumber } from "@/lib/crypto";
import { formatCurrency } from "@/lib/format";
import FiscalConfigEditor from "@/components/fiscalite/FiscalConfigEditor";

const includeConfig = {
  salaries: { include: { member: true } },
  charges: { include: { member: true } },
  budgets: true,
};

const FiscalitePage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/");

  const currentYear = new Date().getFullYear();

  const [yearSheets, rawFiscalConfig, avRawAssets] = await Promise.all([
    prisma.sheet.findMany({
      where: { familyId: session.user.familyId, year: currentYear },
      include: includeConfig,
    }) as Promise<SecureSheet[]>,
    prisma.fiscalConfig.findUnique({ where: { familyId: session.user.familyId } }),
    prisma.asset.findMany({
      where: { familyId: session.user.familyId, type: "ASSURANCE_VIE" },
    }),
  ]);

  const decryptedSheets = yearSheets.map(decryptSheet);
  const sheetMetrics = decryptedSheets.map(computeSheetMetrics);

  const perContribYTD = rawFiscalConfig?.encryptedPerContribYTD
    ? decryptNumber(rawFiscalConfig.encryptedPerContribYTD)
    : 0;
  const isCoupled = rawFiscalConfig?.isCoupled ?? false;
  const avAssets = avRawAssets.map(decryptAsset);

  const summary = computeFiscalSummary({
    sheetMetrics,
    perContribYTD,
    isCoupled,
    avAssets,
  });

  return (
    <div className="space-y-10">
      {/* En-tête */}
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/60 p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35rem] text-slate-500">Fiscalité</p>
          <h1 className="text-3xl font-semibold text-white">Optimisation fiscale</h1>
          <p className="mt-1 text-sm text-slate-400">
            Plafonds PER, abattements AV et alertes pour l&apos;année {currentYear}.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Revenu estimé",
              value: formatCurrency(summary.estimatedAnnualIncome),
              helper: `Cumul ${currentYear}`,
            },
            {
              label: "Plafond PER",
              value: formatCurrency(summary.perCeiling),
              helper: "Déductible annuel",
            },
            {
              label: "Versements PER",
              value: formatCurrency(summary.perContribYTD),
              helper: "Année en cours",
            },
            {
              label: "AV total",
              value: formatCurrency(summary.avTotalValue),
              helper: `${avAssets.length} contrat${avAssets.length !== 1 ? "s" : ""}`,
            },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
              <p className="mt-1 text-xs text-slate-400">{card.helper}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plafond PER */}
      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <h2 className="text-xl font-semibold text-white">Plafond PER</h2>
        <p className="mt-1 text-sm text-slate-400">
          Utilisation de votre enveloppe déductible pour {currentYear}.
        </p>
        <div className="mt-6 space-y-3">
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className={`h-2 rounded-full transition-all ${
                summary.perUsagePercent >= 100 ? "bg-rose-400" : "bg-emerald-400"
              }`}
              style={{ width: `${Math.min(100, summary.perUsagePercent).toFixed(1)}%` }}
            />
          </div>
          <div className="flex flex-wrap justify-between gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Versé</p>
              <p className="mt-1 font-semibold text-white">{formatCurrency(summary.perContribYTD)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Restant</p>
              <p className={`mt-1 font-semibold ${summary.perRemaining > 0 ? "text-emerald-300" : "text-slate-400"}`}>
                {formatCurrency(summary.perRemaining)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Plafond</p>
              <p className="mt-1 font-semibold text-white">{formatCurrency(summary.perCeiling)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Utilisation</p>
              <p className={`mt-1 font-semibold ${summary.perUsagePercent >= 100 ? "text-rose-300" : "text-white"}`}>
                {summary.perUsagePercent.toFixed(1)} %
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Assurance-vie */}
      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <h2 className="text-xl font-semibold text-white">Assurance-vie</h2>
        <p className="mt-1 text-sm text-slate-400">
          Analyse gains vs abattement annuel.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Gains latents</p>
            <p className={`mt-3 text-2xl font-semibold ${summary.avTotalGains >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {formatCurrency(summary.avTotalGains)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Plus-values sur AV</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Abattement</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {formatCurrency(summary.avAbatement)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {isCoupled ? "Couple" : "Célibataire"} — rachats après 8 ans
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Marge / dépassement</p>
            <p
              className={`mt-3 text-2xl font-semibold ${
                summary.avGainsVsAbatement <= 0 ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {summary.avGainsVsAbatement <= 0
                ? `− ${formatCurrency(Math.abs(summary.avGainsVsAbatement))}`
                : `+ ${formatCurrency(summary.avGainsVsAbatement)}`}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {summary.avGainsVsAbatement <= 0 ? "Marge disponible" : "Dépassement taxable"}
            </p>
          </div>
        </div>
      </section>

      {/* Alertes */}
      {summary.alerts.length > 0 && (
        <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Alertes</h2>
          <div className="space-y-3">
            {summary.alerts.map((alert, i) => (
              <div
                key={i}
                className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-400"
              >
                {alert}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Configuration */}
      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Configuration</h2>
        <FiscalConfigEditor
          initialIsCoupled={isCoupled}
          initialPerContribYTD={perContribYTD}
        />
      </section>
    </div>
  );
};

export default FiscalitePage;
