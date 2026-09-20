# Go-Live Action Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre HomeBudget en production sur Vercel avec Supabase, Stripe et Gemini opérationnels, sans CVE Critical, conformité LCEN et RGPD complète.

**Architecture:** Next.js 15 App Router déployé sur Vercel (Fluid Compute), PostgreSQL Supabase EU-West avec PgBouncer, paiements Stripe avec webhooks, encryption AES-256-GCM côté serveur, emails via Resend.

**Tech Stack:** Next.js 15, Prisma 6, Supabase (PostgreSQL), Stripe, Gemini Flash, Vercel Blob, Resend, NextAuth 5.

---

## Périmètre & dépendances

```
Phase 0 (code, 30 min)   → Phase 1 (légal, 1h)     → Phase 2 (infra, 3-4h)
      ↓                                                      ↓
Phase 3 (config, 30 min) ←————————————————————————————————————
      ↓
Phase 4 (tests, 2-4h) → Phase 5 (go-live, 30 min)
```

Phases 0 et 1 sont indépendantes — elles peuvent être faites en parallèle.

---

## Phase 0 — Fixes code bloquants

> Branche : `fix/pre-golive-deps` depuis `develop`

### Task 1 : Mettre à jour les dépendances vulnérables

**Files:**
- Modify: `package.json`, `package-lock.json` (générés par npm)

- [ ] **Créer la branche**

```bash
git checkout develop && git checkout -b fix/pre-golive-deps
```

- [ ] **Installer les versions corrigées**

```bash
npm install next@latest nanoid@latest sharp@latest
```

Vérifier que les versions installées satisfont les seuils :

```bash
npm list next nanoid sharp
# Attendu : next >= 16.3.3, nanoid >= 3.3.18, sharp >= 0.35.4
```

- [ ] **Vérifier la résolution de deepmerge-ts via prisma**

```bash
npm install @prisma/client@latest prisma@latest
npm list deepmerge-ts
# Attendu : deepmerge-ts >= 8.0.0
```

- [ ] **Confirmer que les CVE sont résolues**

```bash
npm audit --audit-level=high
# Attendu : 0 vulnerabilities (high ou critical)
```

- [ ] **Relancer la suite de tests**

```bash
npm run test
# Attendu : 138/138 tests passent (ou plus si next a des breaking changes)
```

Si des tests échouent à cause d'un breaking change Next.js, lire le CHANGELOG et adapter.

- [ ] **Relancer typecheck et lint**

```bash
npm run typecheck && npm run lint
# Attendu : 0 erreur, 0 warning
```

---

### Task 2 : Valider le build de production

**Files:** aucun fichier métier modifié — diagnostic uniquement.

- [ ] **Lancer le build**

```bash
npm run build 2>&1 | tee /tmp/build-output.txt
echo "Build exit: $?"
```

- [ ] **Si le build échoue : diagnostiquer**

```bash
# Chercher les erreurs dans la sortie
grep -E "Error|error TS|Failed" /tmp/build-output.txt | head -20
```

Catégories d'erreurs fréquentes post-mise à jour Next.js :
- Import de `headers()` / `cookies()` → doit être `await headers()` en Next 15
- `useSearchParams()` sans `<Suspense>` wrapper
- Métadonnées `viewport` à extraire depuis `metadata`

Corriger chaque erreur, relancer `npm run typecheck` après chaque correction.

- [ ] **Confirmer que le build passe**

```bash
npm run build
# Attendu : "✓ Compiled successfully" ou "Route (app)" sans erreur
```

- [ ] **Commiter**

```bash
git add package.json package-lock.json
# + tout fichier corrigé pour le build
git commit -m "fix(deps): update next, nanoid, sharp, prisma to resolve high/critical CVEs"
```

- [ ] **Ouvrir une PR vers develop et merger**

```bash
gh pr create --base develop --title "fix(deps): resolve critical CVEs and validate production build" \
  --body "Fixes GHSA-p293, GHSA-2xp9 (next RCE), GHSA-2v37 (nanoid), GHSA-rgj7 (sharp), GHSA-ggr8 (deepmerge-ts). Build production validé."
```

---

## Phase 1 — Légal (obligatoire LCEN art. 6 et 19)

> Aucune branche dédiée — modifications directes sur `develop` ou via PR légère.

**Information requise avant de commencer :**

| Champ | Valeur à fournir |
|---|---|
| Raison sociale | ex. `HomeBudget SAS` |
| Forme juridique | ex. `SAS`, `SARL`, `Auto-entrepreneur` |
| SIRET | ex. `123 456 789 00012` |
| Adresse du siège | ex. `12 rue de la Paix, 75001 Paris` |
| Directeur de publication | ex. `Prénom Nom` |
| Email de contact | ex. `contact@homebudget.app` |
| Email RGPD/DPO | ex. `rgpd@homebudget.app` |

### Task 3 : Remplir les placeholders CGV et Mentions légales

**Files:**
- Modify: `src/app/legal/cgv/page.tsx`
- Modify: `src/app/legal/mentions-legales/page.tsx`

- [ ] **Chercher tous les placeholders restants**

```bash
grep -rn "\[NOM\|RAISON SOCIALE\|SIRET\|ADRESSE\|DOMAINE\|DIRECTEUR\|À COMPLÉTER" \
  src/app/legal/ --include="*.tsx"
```

- [ ] **Remplacer dans `cgv/page.tsx`**

Ouvrir le fichier et remplacer chaque occurrence de :
- `[NOM / RAISON SOCIALE]` → valeur réelle
- `[FORME JURIDIQUE]` → valeur réelle
- `[SIRET]` → valeur réelle
- `[ADRESSE]` → valeur réelle
- `contact@[DOMAINE]` → email réel
- `[votre-domaine]` → domaine réel

- [ ] **Remplacer dans `mentions-legales/page.tsx`**

Mêmes remplacements + `[DIRECTEUR DE PUBLICATION]` → nom réel.

- [ ] **Vérifier qu'il ne reste aucun placeholder**

```bash
grep -rn "\[" src/app/legal/ --include="*.tsx"
# Attendu : 0 ligne avec un placeholder ouvert
```

- [ ] **Commiter**

```bash
git add src/app/legal/cgv/page.tsx src/app/legal/mentions-legales/page.tsx
git commit -m "feat(legal): fill in company information in CGV and legal notices"
```

---

## Phase 2 — Infrastructure (création des comptes tiers)

> Ces étapes se font dans les dashboards web des services concernés.
> Effectuer dans cet ordre : Supabase → Stripe → Google Cloud → Vercel.

### Task 4 : Supabase — Base de données

- [ ] **Créer un projet Supabase**
  - Aller sur https://supabase.com/dashboard → New project
  - Region : **EU West (Ireland)** — obligatoire RGPD
  - Choisir un mot de passe DB fort, le stocker dans le vault

- [ ] **Récupérer la DATABASE_URL poolée**
  - Settings > Database > Connection Pooling (mode Transaction)
  - Copier la chaîne avec `?pgbouncer=true`
  - Format : `postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

- [ ] **Activer les backups automatiques**
  - Settings > Database > Backups → Enable daily backups

---

### Task 5 : Stripe — Paiements

- [ ] **Créer le compte Stripe et activer**
  - https://dashboard.stripe.com → compléter vérification identité + IBAN

- [ ] **Créer le produit HomeBudget PRO**
  - Products > Add product → Nom : `HomeBudget PRO`
  - Ajouter un prix récurrent : `9,90 € / mois`
  - Noter l'ID `price_xxx` (mensuel)
  - Optionnel : ajouter prix annuel, noter `price_xxx` (annuel)

- [ ] **Configurer le Customer Portal**
  - Billing > Customer Portal → activer
  - Cocher : résiliation self-service, mise à jour moyen de paiement

- [ ] **Créer le webhook**
  - Developers > Webhooks → Add endpoint
  - URL : `https://[VOTRE-DOMAINE]/api/stripe/webhooks`
  - Événements : `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`
  - Copier le `whsec_...` → stocker dans le vault

- [ ] **Configurer les emails de facturation**
  - Settings > Emails → activer les reçus automatiques

---

### Task 6 : Google Cloud — Gemini AI

- [ ] **Créer un projet Google Cloud**
  - https://console.cloud.google.com → New Project → `homebudget-prod`

- [ ] **Activer l'API Gemini**
  - APIs & Services > Enable APIs → chercher "Generative Language API" → Enable

- [ ] **Créer une clé API restreinte**
  - APIs & Services > Credentials → Create Credentials → API Key
  - Restreindre par API : "Generative Language API" uniquement
  - Copier la clé → stocker dans le vault

- [ ] **Définir un quota mensuel**
  - APIs & Services > Generative Language API > Quotas
  - Définir un budget alerte dans Billing > Budgets (ex. 50 €/mois)

---

### Task 7 : Vercel — Déploiement

- [ ] **Créer le projet Vercel**
  - https://vercel.com/new → importer le repo GitHub `ClementRollin/HomeBudget`
  - Framework : Next.js (détecté automatiquement)
  - Branch de production : `main`

- [ ] **Configurer le domaine personnalisé**
  - Project Settings > Domains → ajouter votre domaine
  - Configurer les DNS chez votre registrar (CNAME ou A record)
  - Vercel provisionne le SSL automatiquement

- [ ] **Activer le Blob Store**
  - Project > Storage > Connect Store → Create Blob Store
  - Copier le `BLOB_READ_WRITE_TOKEN`

- [ ] **Configurer Resend pour les emails**
  - https://resend.com → ajouter et vérifier votre domaine
  - Créer une clé API → copier `re_xxx`
  - Vérifier que le domaine est validé (DNS SPF/DKIM configurés)

---

## Phase 3 — Configuration (secrets + variables d'env)

> À faire après la Phase 2. Toutes les valeurs collectées dans les phases précédentes.

### Task 8 : Générer les secrets cryptographiques

- [ ] **Générer les 3 secrets**

```bash
echo "AUTH_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)"
echo "INVITE_PEPPER=$(openssl rand -base64 32)"
```

- [ ] **Stocker dans le vault d'équipe** (Bitwarden, 1Password, etc.)

> ⚠️ CRITIQUE : `ENCRYPTION_KEY` ne peut jamais être régénérée après déploiement.
> La perte de cette clé rend toutes les données financières des utilisateurs illisibles.

---

### Task 9 : Configurer les variables d'environnement Vercel

- [ ] **Ouvrir** Project Settings > Environment Variables sur Vercel

- [ ] **Ajouter les 17 variables** (environnement : Production) :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL Supabase poolée (Task 4) |
| `AUTH_SECRET` | Secret généré (Task 8) |
| `NEXTAUTH_URL` | `https://[votre-domaine]` |
| `ENCRYPTION_KEY` | Secret généré (Task 8) |
| `INVITE_PEPPER` | Secret généré (Task 8) |
| `INVITE_EXPIRATION_DAYS` | `7` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe live (Task 5) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (Task 5) |
| `STRIPE_PRICE_ID_PRO_MONTHLY` | `price_...` mensuel (Task 5) |
| `STRIPE_PRICE_ID_PRO_ANNUAL` | `price_...` annuel (Task 5, optionnel) |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY` | = même valeur que ci-dessus |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL` | = même valeur que ci-dessus |
| `GEMINI_API_KEY` | Clé API Google (Task 6) |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob (Task 7) |
| `RESEND_API_KEY` | Clé Resend (Task 7) |
| `EMAIL_FROM` | `HomeBudget <no-reply@[votre-domaine]>` |
| `SUPPORT_EMAIL` | `support@[votre-domaine]` |

- [ ] **Vérifier qu'aucune variable n'est manquante**

```bash
# Avec Vercel CLI installé
vercel env ls --environment=production
# Comparer avec la liste ci-dessus
```

---

### Task 10 : Merger develop → main et appliquer les migrations

- [ ] **Ouvrir une PR develop → main**

```bash
gh pr create --base main --head develop \
  --title "chore(release): promote develop to production" \
  --body "Release go-live : recurring charges, refactoring arborescence, CFO alerts, RGPD, CVE fixes."
```

- [ ] **Merger la PR** (après validation CI)

- [ ] **Appliquer les migrations Prisma en production**

```bash
# Option A : via Vercel CLI (si configuré dans le build command)
# Le deploy Vercel déclenche automatiquement "prisma migrate deploy" si configuré dans package.json :
# "build": "prisma migrate deploy && next build"

# Option B : manuellement
DATABASE_URL="[URL_SUPABASE_PRODUCTION]" npx prisma migrate deploy
```

- [ ] **Vérifier le statut des migrations**

```bash
DATABASE_URL="[URL_SUPABASE_PRODUCTION]" npx prisma migrate status
# Attendu : toutes les migrations à "Applied"
# Inclut notamment : 20260907000000_add_recurring_charges
```

---

## Phase 4 — Tests & validation

> À faire après le premier déploiement réussi sur le domaine de production.

### Task 11 : Validation Stripe end-to-end

- [ ] **Test d'abonnement PRO**
  - Créer un compte sur le domaine de prod
  - Aller sur la page d'abonnement → Passer en PRO
  - Utiliser la carte de test Stripe : `4242 4242 4242 4242` exp. `12/34` CVV `123`
  - Vérifier que le plan passe à PRO dans l'application

- [ ] **Test de réception du webhook**
  - Dashboard Stripe > Developers > Webhooks > votre endpoint
  - Vérifier que l'événement `checkout.session.completed` apparaît avec statut `200`

- [ ] **Test de résiliation**
  - Aller dans les paramètres de compte → Gérer l'abonnement (Customer Portal)
  - Résilier l'abonnement
  - Vérifier que le plan repasse à FREE dans l'application

- [ ] **Test d'échec de paiement**
  - Utiliser la carte `4000 0000 0000 9995` (paiement refusé)
  - Vérifier que l'email d'échec de paiement est envoyé (inbox réelle)

---

### Task 12 : Tests application manuels

- [ ] **Inscription mode `create` (nouveau foyer)**
  - Créer un compte avec un email réel
  - Vérifier réception de l'email de bienvenue

- [ ] **Onboarding wizard**
  - Compléter les 5 étapes avec des données réelles
  - Vérifier que les données sont persistées (refresh page)
  - Tester le bouton "Passer" sur chaque étape

- [ ] **Inscription mode `join` (rejoindre un foyer)**
  - Depuis le premier compte, générer un code d'invitation (Settings > Famille)
  - Créer un second compte avec le code
  - Vérifier que les deux membres apparaissent dans le foyer

- [ ] **Budget mensuel**
  - Créer une fiche mensuelle
  - Ajouter des salaires, charges et enveloppes budget
  - Vérifier que les charges récurrentes configurées sont bien injectées automatiquement

- [ ] **Fiscalité / IA Gemini**
  - Téléverser un PDF de déclaration 2042 (ou un fichier test)
  - Vérifier que l'extraction IA retourne des données cohérentes
  - Vérifier que le simulateur IR produit un résultat

- [ ] **Limites plan FREE**
  - Créer 3 fiches (limite FREE)
  - Tenter d'en créer une 4ème → vérifier que le paywall s'affiche
  - Même test pour actifs (5 max) et objectifs (3 max)

- [ ] **Pages légales**
  - Vérifier `/legal/cgu`, `/legal/cgv`, `/legal/mentions-legales`, `/legal/confidentialite`
  - Vérifier qu'aucun placeholder `[...]` n'est visible

---

### Task 13 : Validation infrastructure HTTPS

- [ ] **Headers de sécurité**

```bash
curl -I https://[votre-domaine] | grep -E "strict-transport|content-security|x-frame|x-content-type"
# Attendu : HSTS, CSP, X-Frame-Options, X-Content-Type-Options présents
```

- [ ] **Redirection HTTP → HTTPS**

```bash
curl -I http://[votre-domaine]
# Attendu : 301 ou 308 vers https://
```

- [ ] **Redirection www → non-www (ou l'inverse)**

```bash
curl -I https://www.[votre-domaine]
# Attendu : 301 vers https://[votre-domaine]
```

- [ ] **Score SSL**
  - Tester sur https://www.ssllabs.com/ssltest/ → score A ou A+

---

## Phase 5 — Go-live & post-déploiement

### Task 14 : Monitoring post-déploiement (J+1 à J+7)

- [ ] **Configurer les alertes Vercel**
  - Project > Settings > Notifications → activer les alertes d'erreur par email

- [ ] **Surveiller les logs les premières 24h**
  - Vercel Dashboard > Project > Logs → filtrer par `error` et `warning`

- [ ] **Vérifier les métriques Stripe**
  - Dashboard Stripe > Developers > Webhooks → vérifier que tous les events ont statut `200`
  - Dashboard Stripe > Payments → vérifier les premiers paiements réels

- [ ] **Vérifier les backups Supabase**
  - Supabase > Settings > Database > Backups → confirmer que le premier backup quotidien est planifié

- [ ] **Documenter les accès dans le vault**
  - Clés Stripe live (secret + webhook)
  - ENCRYPTION_KEY (CRITIQUE — jamais régénérable)
  - AUTH_SECRET
  - Clé Gemini
  - Credentials Supabase (DB password + URL)
  - Token Vercel Blob

---

## Récapitulatif par priorité

| Priorité | Tâche | Effort | Bloquant |
|---|---|---|---|
| 🔴 P0 | Fix CVE Critical `next` (Task 1-2) | 30 min | Oui — sécurité |
| 🔴 P0 | Placeholders légaux (Task 3) | 15 min + info | Oui — LCEN |
| 🟠 P1 | Supabase DB (Task 4) | 20 min | Oui — infra |
| 🟠 P1 | Stripe compte + produit + webhook (Task 5) | 45 min | Oui — paiements |
| 🟠 P1 | Gemini API key (Task 6) | 15 min | Oui — IA |
| 🟠 P1 | Vercel projet + domaine + Blob (Task 7) | 30 min | Oui — déploiement |
| 🟡 P2 | Générer secrets + configurer env vars (Task 8-9) | 20 min | Oui — config |
| 🟡 P2 | Merge develop → main + migrations (Task 10) | 15 min | Oui — deploy |
| 🟢 P3 | Tests Stripe E2E (Task 11) | 45 min | Recommandé |
| 🟢 P3 | Tests application manuels (Task 12) | 2h | Recommandé |
| 🟢 P3 | Validation HTTPS (Task 13) | 15 min | Recommandé |
| 🔵 P4 | Monitoring J+1 à J+7 (Task 14) | continu | Post-deploy |

**Temps total estimé (hors ouverture de comptes) : 5 à 7 heures**
**Temps d'ouverture de comptes (Stripe vérification identité, DNS propagation) : variable (1-48h)**

---

*Plan créé le 2026-09-17 — branche `develop` au commit `677fa44`*
