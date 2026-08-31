# HomeBudget — Plan post-audit (S24–S26)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finaliser le go-live, compléter la gestion de compte/famille, ajouter les catégories custom et brancher le monitoring.

**Architecture:** Next.js 16 App Router · Prisma/PostgreSQL · Auth.js v5 · Stripe · Resend. Toute nouvelle donnée passe par une migration Prisma → API route protégée → composant client. Pattern constant : `encryptedX` en base, decrypt dans la server action/route.

**Tech Stack:** TypeScript strict, Zod, React Hook Form, Tailwind CSS 4, Vitest, `npm run typecheck && npm run lint && npm run test:unit` avant chaque commit.

---

## Phase 0 — Go-Live (actions externes + CI)

> Ces étapes ne nécessitent pas de code sauf les tâches marquées ⚙️.

### Task 0.1 : GitHub Actions secrets

**Fichiers :**
- Modify : `.github/workflows/ci-develop.yml`
- Modify : `.github/workflows/ci-main.yml`

- [ ] **Configurer les secrets GitHub**
  Dans le repo GitHub → Settings → Secrets and variables → Actions, créer :
  - `ENCRYPTION_KEY_TEST` : `openssl rand -base64 32` (valeur de test, différente de la prod)
  - `AUTH_SECRET_TEST` : `openssl rand -base64 32`

- [ ] ⚙️ **Activer le preview deploy Vercel dans ci-develop.yml**
  Décommenter le job `deploy-preview` et ajouter les secrets Vercel :
  - `VERCEL_TOKEN` : Vercel → Account Settings → Tokens
  - `VERCEL_ORG_ID` : Vercel → Project Settings → General
  - `VERCEL_PROJECT_ID` : Vercel → Project Settings → General

```yaml
# Dans .github/workflows/ci-develop.yml, décommenter :
deploy-preview:
  name: Deploy Preview
  needs: ci
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09
    - name: Deploy to Vercel Preview
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

- [ ] **Commit**
```bash
git add .github/workflows/ci-develop.yml
git commit -m "ci: activate vercel preview deploy on develop PRs"
```

---

### Task 0.2 : Stripe (Dashboard)

- [ ] Passer en mode Live (toggle haut à droite du Dashboard)
- [ ] Products → Create product "HomeBudget PRO" → Add price : 9,90 € / mois récurrent → copier `price_live_...`
- [ ] Billing → Customer portal → activer résiliation + update CB + URL de retour `https://homebudget.app/settings`
- [ ] Developers → Webhooks → Add endpoint `https://homebudget.app/api/stripe/webhooks`
  - Events : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`
  - Copier `whsec_live_...`
- [ ] Developers → API Keys → copier `sk_live_...`
- [ ] Vercel → Environment Variables (Production) :
  ```
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_live_...
  STRIPE_PRICE_ID_PRO_MONTHLY=price_live_...
  NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY=price_live_...
  ```

---

### Task 0.3 : Resend (emails)

- [ ] resend.com → API Keys → Create → copier `re_...`
- [ ] resend.com → Domains → Add domain `homebudget.app` → ajouter les records DNS (SPF, DKIM, DMARC)
- [ ] Vercel → Environment Variables (Production) :
  ```
  RESEND_API_KEY=re_...
  EMAIL_FROM=HomeBudget <no-reply@homebudget.app>
  SUPPORT_EMAIL=support@homebudget.app
  ```

---

### Task 0.4 : Vercel Blob + Gemini

- [ ] Vercel → Storage → Create Database → Blob → copier `BLOB_READ_WRITE_TOKEN`
- [ ] aistudio.google.com → Get API key → copier `AIza...`
- [ ] Vercel → Environment Variables (Production) :
  ```
  BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
  GEMINI_API_KEY=AIza...
  ```

---

### Task 0.5 : Supabase + déploiement initial

- [ ] Créer projet Supabase région EU-West → copier DATABASE_URL poolée (pgbouncer=true&connection_limit=1)
- [ ] `DATABASE_URL=... npx prisma migrate deploy` — vérifier que les 16 migrations passent
- [ ] Vercel → Environment Variables (Production) : `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL=https://homebudget.app`, `ENCRYPTION_KEY`, `INVITE_PEPPER`, `INVITE_EXPIRATION_DAYS=7`
- [ ] Vercel → Domains → ajouter `homebudget.app`
- [ ] Déclencher le premier déploiement production (push sur `main`)
- [ ] Test end-to-end : créer un compte, créer une fiche, payer avec `4242 4242 4242 4242`, vérifier webhook

---

## Phase 1 — Sprint S24 : Gestion de compte & famille

> Toutes les tâches suivantes sont du code.

### Task 1.1 : Changement de mot de passe

**Fichiers :**
- Create : `src/app/api/account/password/route.ts`
- Create : `src/components/account/ChangePasswordForm.tsx`
- Modify : `src/app/(app)/settings/page.tsx` (ajouter la section)
- Create : `src/lib/__tests__/account.test.ts`

- [ ] **Écrire le test**
```typescript
// src/lib/__tests__/account.test.ts
import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'

describe('password validation', () => {
  it('should reject passwords shorter than 8 characters', () => {
    const schema = z.string().min(8)
    expect(schema.safeParse('short').success).toBe(false)
  })

  it('should hash a password with bcrypt cost 12', async () => {
    const hash = await bcrypt.hash('password123', 12)
    expect(await bcrypt.compare('password123', hash)).toBe(true)
    expect(hash).toMatch(/^\$2[ab]\$12\$/)
  })
})
```

- [ ] **Lancer le test et vérifier qu'il passe**
```bash
npm run test:unit -- src/lib/__tests__/account.test.ts
```

- [ ] **Créer la route API**
```typescript
// src/app/api/account/password/route.ts
import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Créer le composant formulaire**
```typescript
// src/components/account/ChangePasswordForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/ToastProvider";

const schema = z.object({
  currentPassword: z.string().min(1, "Requis"),
  newPassword: z.string().min(8, "Minimum 8 caractères"),
  confirmPassword: z.string().min(1, "Requis"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function ChangePasswordForm() {
  const { addToast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    });
    const json = await res.json() as { ok?: boolean; error?: string };
    if (!res.ok) { addToast(json.error ?? "Erreur", "error"); return; }
    addToast("Mot de passe modifié avec succès", "success");
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <div className="space-y-1">
        <label className="text-sm text-slate-400">Mot de passe actuel</label>
        <input type="password" {...register("currentPassword")}
          className="w-full rounded-xl border border-border bg-white/5 px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
        {errors.currentPassword && <p className="text-xs text-red-400">{errors.currentPassword.message}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-sm text-slate-400">Nouveau mot de passe</label>
        <input type="password" {...register("newPassword")}
          className="w-full rounded-xl border border-border bg-white/5 px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
        {errors.newPassword && <p className="text-xs text-red-400">{errors.newPassword.message}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-sm text-slate-400">Confirmer le nouveau mot de passe</label>
        <input type="password" {...register("confirmPassword")}
          className="w-full rounded-xl border border-border bg-white/5 px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
        {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}
        className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
        {isSubmitting ? "Modification…" : "Modifier le mot de passe"}
      </button>
    </form>
  );
}
```

- [ ] **Brancher dans settings/page.tsx** — ajouter une section "Sécurité" avec `<ChangePasswordForm />` après la section compte existante.

- [ ] **Typecheck + lint**
```bash
npm run typecheck && npm run lint
```

- [ ] **Commit**
```bash
git add src/app/api/account/password/route.ts src/components/account/ChangePasswordForm.tsx src/app/(app)/settings/page.tsx src/lib/__tests__/account.test.ts
git commit -m "feat(s24): add change password in settings"
```

---

### Task 1.2 : Retirer un membre du foyer (par l'OWNER)

**Contexte :** `/api/family/members/[memberId]` existe déjà. Vérifier s'il gère le cas OWNER → retirer un MEMBER.

**Fichiers :**
- Read : `src/app/api/family/members/[memberId]/route.ts`
- Modify si nécessaire
- Read : `src/app/(app)/family/page.tsx` — ajouter bouton "Retirer"

- [ ] **Lire la route existante**
```bash
cat src/app/api/family/members/[memberId]/route.ts
```

- [ ] **Vérifier que DELETE vérifie que l'appelant est OWNER et ne peut pas se retirer lui-même**
  Si ce n'est pas le cas, ajouter les guards dans la route :
  - `session.user.familyRole === "OWNER"` requis
  - `memberId !== session.user.familyMemberId` (ne pas se supprimer soi-même)
  - Dissocier `user.id` du membre avant suppression (ne pas supprimer le compte user)

- [ ] **Ajouter le bouton "Retirer" dans la page /family** avec confirmation modale.

- [ ] **Typecheck + lint**
```bash
npm run typecheck && npm run lint
```

- [ ] **Commit**
```bash
git commit -m "feat(s24): owner can remove family members"
```

---

### Task 1.3 : Catégories de charges custom

> Feature demandée. Actuellement les 4 catégories sont des enums Prisma fixes.
> Décision architecture : ajouter un modèle `ChargeCategory` optionnel en base et conserver les 4 enums comme valeurs par défaut (rétrocompatibilité totale). Les catégories custom sont rattachées à la famille et chiffrées.

**Fichiers :**
- Create : `prisma/migrations/YYYYMMDD_custom_charge_categories/migration.sql`
- Modify : `prisma/schema.prisma` — ajouter modèle `CustomChargeCategory`
- Create : `src/app/api/charge-categories/route.ts`
- Create : `src/app/api/charge-categories/[id]/route.ts`
- Modify : `src/lib/validations/sheet.ts` — étendre `CHARGE_TYPES`
- Modify : `src/components/forms/SheetForm.tsx` — dropdown categories dynamique
- Modify : `src/components/sheets/ChargesOverview.tsx` — labels dynamiques
- Create : `src/components/family/ChargeCategoryManager.tsx`
- Modify : `src/app/(app)/family/page.tsx` — section gestion catégories

- [ ] **Ajouter le modèle Prisma**
```prisma
// Dans schema.prisma, ajouter après le modèle Debt :
model CustomChargeCategory {
  id             String   @id @default(cuid())
  family         Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
  familyId       String
  encryptedLabel String
  createdAt      DateTime @default(now())

  @@index([familyId])
}
```
Et sur `Family`, ajouter la relation : `customChargeCategories CustomChargeCategory[]`

- [ ] **Créer la migration**
```bash
npm run prisma:migrate -- --name custom_charge_categories
```

- [ ] **Créer la route CRUD**
```typescript
// src/app/api/charge-categories/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptValue, decryptValue } from "@/lib/crypto";

const createSchema = z.object({ label: z.string().min(1).max(60) });

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const categories = await prisma.customChargeCategory.findMany({
    where: { familyId: session.user.familyId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    categories.map((c) => ({ id: c.id, label: decryptValue(c.encryptedLabel) }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Label invalide" }, { status: 400 });

  const count = await prisma.customChargeCategory.count({ where: { familyId: session.user.familyId } });
  if (count >= 20) return NextResponse.json({ error: "Maximum 20 catégories custom" }, { status: 409 });

  const category = await prisma.customChargeCategory.create({
    data: {
      familyId: session.user.familyId,
      encryptedLabel: encryptValue(parsed.data.label),
    },
  });

  return NextResponse.json({ id: category.id, label: parsed.data.label }, { status: 201 });
}
```

```typescript
// src/app/api/charge-categories/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const cat = await prisma.customChargeCategory.findUnique({ where: { id } });
  if (!cat || cat.familyId !== session.user.familyId) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  await prisma.customChargeCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Modifier le SheetForm** pour charger les catégories custom via `useSWR` ou fetch au montage et les proposer dans le dropdown avec les 4 catégories système.

- [ ] **Créer ChargeCategoryManager** — composant CRUD simple : liste les catégories custom, bouton "Ajouter", bouton "Supprimer" par catégorie.

- [ ] **Ajouter la section dans /family** — section "Catégories de charges personnalisées" utilisant `ChargeCategoryManager`.

- [ ] **Typecheck + lint + tests**
```bash
npm run typecheck && npm run lint && npm run test:unit
```

- [ ] **Commit**
```bash
git commit -m "feat(s24): custom charge categories per family"
```

---

## Phase 2 — Sprint S25 : Monitoring & DX

### Task 2.1 : Sentry (error tracking)

**Fichiers :**
- Create : `sentry.client.config.ts`
- Create : `sentry.server.config.ts`
- Modify : `next.config.ts`
- Modify : `package.json`

- [ ] **Installer Sentry**
```bash
npm install @sentry/nextjs
```

- [ ] **Initialiser Sentry**
```bash
npx @sentry/wizard@latest -i nextjs
# Répondre : project name = homebudget, DSN depuis Sentry Dashboard
```

- [ ] **Ajouter `SENTRY_DSN` dans Vercel** (Environment Variables) et dans `.env.development`.

- [ ] **Vérifier que les erreurs remontent** : déclencher une erreur intentionnelle en dev, vérifier dans le dashboard Sentry.

- [ ] **Commit**
```bash
git commit -m "feat(s25): add Sentry error tracking"
```

---

### Task 2.2 : Vercel Speed Insights + Web Analytics

**Fichiers :**
- Modify : `src/app/layout.tsx`
- Modify : `package.json`

- [ ] **Installer**
```bash
npm install @vercel/speed-insights @vercel/analytics
```

- [ ] **Brancher dans le layout racine**
```typescript
// src/app/layout.tsx — dans le <body> :
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

// ...
<SpeedInsights />
<Analytics />
```

- [ ] **Activer dans le Dashboard Vercel** : Project → Analytics → Enable / Speed Insights → Enable.

- [ ] **Commit**
```bash
git commit -m "feat(s25): add Vercel Speed Insights and Analytics"
```

---

### Task 2.3 : Renseigner les informations légales de l'éditeur

> Non-code. À faire par le propriétaire du projet.

- [ ] Ouvrir les 4 fichiers :
  - `src/app/legal/cgu/page.tsx`
  - `src/app/legal/cgv/page.tsx`
  - `src/app/legal/mentions-legales/page.tsx`
  - `src/app/legal/confidentialite/page.tsx`
- [ ] Remplacer **tous** les marqueurs `[À COMPLÉTER]` par les vraies informations :
  - `[NOM / RAISON SOCIALE]`
  - `[FORME JURIDIQUE]` (ex : Entrepreneur individuel, SAS, SARL…)
  - `[MONTANT]` (capital social, ou supprimer si EI)
  - `[ADRESSE COMPLÈTE]`
  - `[NUMÉRO SIRET]`
  - `[VILLE D'IMMATRICULATION] — [NUMÉRO RCS]` (ou supprimer si non immatriculé)
  - `[NOM DU RESPONSABLE]`
- [ ] Obligatoire légalement (art. 6 LCEN) avant toute mise en ligne publique.
- [ ] Commit : `docs(legal): fill editor legal information`

---

## Phase 3 — Sprint S26 : Features analytics avancées

### Task 3.1 : Comparaison N vs N-1 dans Analytics

**Fichiers :**
- Modify : `src/app/(app)/analytics/page.tsx` — ajouter calcul N-1
- Modify : `src/components/analytics/BudgetChart.tsx` — second dataset en pointillé

- [ ] **Dans la page analytics**, récupérer aussi les fiches de l'année précédente et calculer les mêmes métriques.
- [ ] **Dans `BudgetChart`**, accepter un prop `previousData?: BudgetDataPoint[]` et l'afficher en ligne pointillée avec opacity 0.5.
- [ ] **Afficher les deltas** (+X% revenus, +X% épargne vs N-1) sous les KPI cards.
- [ ] Commit : `feat(s26): add year-over-year comparison in analytics`

---

### Task 3.2 : Export CSV fiches mensuelles

**Fichiers :**
- Modify : `src/app/api/account/route.ts` — ajouter `?format=csv` sur GET
- Modify : `src/components/account/AccountActions.tsx` — bouton "Exporter CSV"

- [ ] **Modifier `/api/account` GET** pour accepter `?format=csv` et retourner un fichier CSV avec les fiches (année, mois, revenus, charges, solde).
- [ ] **Ajouter le bouton** dans `AccountActions` avec téléchargement du `.csv`.
- [ ] Commit : `feat(s26): add CSV export for monthly sheets`

---

## Récapitulatif des priorités

| Sprint | Livrable | Effort estimé |
|--------|----------|---------------|
| S-GL | Go-live (Stripe, Resend, Vercel, Supabase) + CI preview | 2–3h |
| S24 | Changement mdp + gestion membres + catégories custom | 1 jour |
| S25 | Sentry + Analytics + légaux complétés | 2h |
| S26 | Analytics N-1 + Export CSV | 4h |

---

*Plan généré le 2026-08-31. À relire et ajuster selon les retours utilisateurs post-launch.*
