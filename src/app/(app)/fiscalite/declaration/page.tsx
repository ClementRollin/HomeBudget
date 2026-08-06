import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";
import { decryptNumber, decryptValue } from "@/lib/crypto";
import {
  buildDeclaration2042,
  computeIncomeByDeclarant,
  computeQuotientFamilial,
  type FamilyMemberFiscal,
  type FamilyMemberFiscalWithId,
  type SheetWithSalaries,
} from "@/lib/fiscalite";
import { prisma } from "@/lib/prisma";
import { getFamilySubscription, getActivePlan } from "@/lib/subscription";
import TaxDocumentUploader from "@/components/fiscalite/TaxDocumentUploader";
import ExtractedCasesEditor from "@/components/fiscalite/ExtractedCasesEditor";
import Declaration2042Table from "@/components/fiscalite/Declaration2042Table";
import UpgradeGate from "@/components/subscription/UpgradeGate";

type TaxDocumentRow = {
  id: string;
  taxYear: number;
  documentType: string;
  blobUrl: string;
  extractionStatus: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  extractionConfidence: number | null;
  validatedAt: Date | null;
  createdAt: Date;
  cases: Record<string, number> | null;
};

const DeclarationPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/");

  const taxYear = new Date().getFullYear();
  const familyId = session.user.familyId;

  // Récupérer toutes les données en parallèle
  const [rawDocuments, rawSheets, rawMembers, fiscalConfig, previousDocs, sub] = await Promise.all([
    // Documents fiscaux de l'année courante
    prisma.taxDocument.findMany({
      where: { familyId, taxYear },
      orderBy: { createdAt: "desc" },
    }),
    // Fiches de compte de l'année
    prisma.sheet.findMany({
      where: { familyId, year: taxYear },
      include: {
        salaries: { include: { member: true } },
      },
    }),
    // Membres de la famille
    prisma.familyMember.findMany({
      where: { familyId },
      select: {
        id: true,
        displayName: true,
        fiscalRole: true,
        isAlternateGuard: true,
        isDisabled: true,
      },
    }),
    // Configuration fiscale
    prisma.fiscalConfig.findUnique({ where: { familyId } }),
    // Documents N-1 validés (pour les deltas)
    prisma.taxDocument.findMany({
      where: { familyId, taxYear: taxYear - 1, validatedAt: { not: null } },
      orderBy: { validatedAt: "desc" },
      take: 1,
    }),
    getFamilySubscription(familyId),
  ]);

  const plan = getActivePlan(sub.subscriptionStatus, sub.subscriptionEndsAt);
  const hasN1Data = previousDocs.length > 0 && !!previousDocs[0].encryptedExtractedCases;

  // Décrypter et mapper les documents fiscaux
  const documents: TaxDocumentRow[] = rawDocuments.map((doc) => ({
    id: doc.id,
    taxYear: doc.taxYear,
    documentType: doc.documentType,
    blobUrl: doc.blobUrl,
    extractionStatus: doc.extractionStatus as TaxDocumentRow["extractionStatus"],
    extractionConfidence: doc.extractionConfidence,
    validatedAt: doc.validatedAt,
    createdAt: doc.createdAt,
    cases:
      doc.encryptedExtractedCases
        ? (() => {
            try {
              return JSON.parse(decryptValue(doc.encryptedExtractedCases)) as Record<string, number>;
            } catch {
              return null;
            }
          })()
        : null,
  }));

  // Construire les fiches avec salaires décryptés
  const sheets: SheetWithSalaries[] = rawSheets.map((sheet) => ({
    year: sheet.year,
    month: sheet.month,
    salaries: sheet.salaries.map((s) => ({
      memberId: s.memberId,
      amount: decryptNumber(s.encryptedAmount),
    })),
  }));

  // Membres avec rôle fiscal
  const members: FamilyMemberFiscalWithId[] = rawMembers.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    fiscalRole: m.fiscalRole as FamilyMemberFiscal["fiscalRole"],
    isAlternateGuard: m.isAlternateGuard,
    isDisabled: m.isDisabled,
  }));

  // Calcul des cases 1AJ / 1BJ
  const { case1AJ, case1BJ } = computeIncomeByDeclarant(sheets, members);

  // Données fiscales depuis config
  const perContribYTD = fiscalConfig?.encryptedPerContribYTD
    ? decryptNumber(fiscalConfig.encryptedPerContribYTD)
    : 0;
  const dividends = fiscalConfig?.encryptedDividends
    ? decryptNumber(fiscalConfig.encryptedDividends)
    : 0;
  const capitalGains = fiscalConfig?.encryptedCapitalGains
    ? decryptNumber(fiscalConfig.encryptedCapitalGains)
    : 0;
  const rentalIncome = fiscalConfig?.encryptedRentalIncome
    ? decryptNumber(fiscalConfig.encryptedRentalIncome)
    : 0;

  // Cases de l'année N-1 (PRO uniquement)
  let previousYearCases: Record<string, number> | undefined;
  if (plan === "PRO" && previousDocs.length > 0 && previousDocs[0].encryptedExtractedCases) {
    try {
      previousYearCases = JSON.parse(
        decryptValue(previousDocs[0].encryptedExtractedCases)
      ) as Record<string, number>;
    } catch {
      previousYearCases = undefined;
    }
  }

  // Construire la déclaration 2042
  const declarationResult = buildDeclaration2042({
    case1AJ,
    case1BJ,
    perContribYTD,
    dividends,
    capitalGains,
    rentalIncome,
    previousYearCases,
  });

  // Quotient familial
  const fiscalMembers: FamilyMemberFiscal[] = members.map((m) => ({
    fiscalRole: m.fiscalRole,
    isAlternateGuard: m.isAlternateGuard,
    isDisabled: m.isDisabled,
  }));
  const quotientFamilial = computeQuotientFamilial(fiscalMembers);

  const statusLabel: Record<TaxDocumentRow["extractionStatus"], string> = {
    PENDING: "En attente",
    PROCESSING: "Extraction en cours",
    DONE: "Extraction terminée",
    FAILED: "Échec extraction",
  };

  const statusColor: Record<TaxDocumentRow["extractionStatus"], string> = {
    PENDING: "text-amber-400",
    PROCESSING: "text-blue-400",
    DONE: "text-emerald-400",
    FAILED: "text-rose-400",
  };

  return (
    <div className="space-y-10">
      {/* En-tête */}
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/60 p-8">
        <p className="text-xs uppercase tracking-[0.35rem] text-slate-500">Fiscalité</p>
        <h1 className="text-3xl font-semibold text-white">Déclaration 2042</h1>
        <p className="mt-1 text-sm text-slate-400">
          Aide à la saisie de votre déclaration de revenus {taxYear}.{" "}
          Quotient familial :{" "}
          <span className="font-semibold text-white">{quotientFamilial.parts} parts</span>.
        </p>
      </section>

      {/* Upload */}
      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <h2 className="mb-2 text-xl font-semibold text-white">Importer un document</h2>
        <p className="mb-6 text-sm text-slate-400">
          Téléversez votre déclaration 2042 ou avis d&apos;imposition.
          L&apos;IA extraira automatiquement les cases.
        </p>
        <TaxDocumentUploader taxYear={taxYear} />
      </section>

      {/* Liste des documents */}
      {documents.length > 0 && (
        <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Documents importés</h2>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {doc.documentType === "DECLARATION_2042"
                        ? "Déclaration 2042"
                        : "Avis d'imposition"}{" "}
                      <span className="text-slate-500">— {doc.taxYear}</span>
                    </p>
                    <p
                      className={`mt-1 text-xs font-medium ${statusColor[doc.extractionStatus]}`}
                    >
                      {statusLabel[doc.extractionStatus]}
                      {doc.extractionConfidence !== null &&
                        ` — confiance ${((doc.extractionConfidence ?? 0) * 100).toFixed(0)} %`}
                    </p>
                    {doc.validatedAt && (
                      <p className="mt-1 text-xs text-slate-600">
                        Validé le{" "}
                        {new Date(doc.validatedAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                  <a
                    href={doc.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    Voir le fichier
                  </a>
                </div>

                {/* Éditeur des cases extraites */}
                {doc.cases && Object.keys(doc.cases).length > 0 && (
                  <div className="mt-5 border-t border-white/5 pt-5">
                    <h3 className="mb-4 text-sm font-medium text-slate-300">
                      Cases extraites
                    </h3>
                    <ExtractedCasesEditor
                      documentId={doc.id}
                      cases={doc.cases}
                      confidence={doc.extractionConfidence}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comparaison N-1 — gate PRO */}
      {plan === "FREE" && hasN1Data && (
        <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
          <UpgradeGate plan={plan} feature="Comparaison N-1 sur votre déclaration">
            {null}
          </UpgradeGate>
        </section>
      )}

      {/* Tableau de déclaration 2042 */}
      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <h2 className="mb-2 text-xl font-semibold text-white">Cases à reporter</h2>
        <p className="mb-6 text-sm text-slate-400">
          Cases calculées à partir de vos fiches de compte et de votre configuration
          fiscale. Cliquez sur &quot;Copier&quot; pour coller dans le formulaire Cerfa.
        </p>
        <Declaration2042Table result={declarationResult} />
      </section>
    </div>
  );
};

export default DeclarationPage;
