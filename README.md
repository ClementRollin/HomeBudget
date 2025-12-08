<div align="center">

![HomeBudget](./public/vercel.svg)

# HomeBudget

Application Next.js (App Router) pour gérer les comptes budgétaires mensuelles d’un foyer.  
Stack : Next.js 16 · TypeScript · Tailwind CSS 4 · Prisma · Auth.js · PostgreSQL.

</div>

## Fonctionnalités

- Authentification email/mot de passe avec création de famille et code d’invitation.
- Isolation stricte des données par famille (multi-tenant) : seule votre famille voit ses fiches de compte.
- Dashboard du mois courant, liste historique, création/édition avec salaires, charges et budgets.
- Layout sécurisé avec sidebar fixe, header personnalisé (prénom + code famille) et dark mode.
- API Routes Next.js protégées par middleware + Prisma pour le CRUD.
- Tooling : ESLint strict, Prettier, scripts Prisma, configuration prête pour Vercel.

## Prérequis

- Node.js 20+
- PostgreSQL (local ou managé)
- npm (ou pnpm/yarn/bun)

## Installation

```bash
git clone <repo>
cd homebudget
npm install
```

### Variables d’environnement

Deux fichiers sont fournis :

| Fichier              | Utilisation                            | Contenu                                                                            |
| -------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| `.env.development`   | Développement local                    | Connexion Postgres locale + `AUTH_SECRET` de test                                  |
| `.env.production`    | Préproduction / Supabase               | Modèle de chaîne Supabase (avec `pgbouncer=true&connection_limit=1`) + secret prod |

Modifiez les valeurs selon votre environnement puis lancez les scripts via `dotenv-cli` (inclus dans les dépendances) :

```bash
# exemple : démarrer en dev avec la base locale
npm run dev

# exemple : lancer Prisma Migrate sur Supabase
npm run prisma:migrate:prod
```

### Migrations Prisma

```bash
npm run prisma:migrate      # applique toutes les migrations (dont familles)
npm run prisma:generate     # régénère le client Prisma
```

> ⚠️ Si `prisma generate` échoue à cause du fichier `query_engine`, fermez les processus Node/VS Code puis relancez la commande.

## Comptes & familles

- Rendez-vous sur `http://localhost:3000/` : la page permet de créer une famille ou de rejoindre une famille existante via son code.
- Le premier utilisateur qui crée la famille reçoit un code d’invitation (visible dans le header et à partager avec le deuxième utilisateur).
- Chaque utilisateur d’une même famille partage le même dashboard et ne peut voir les fiches d’une autre famille.

## Scripts npm

| Commande                    | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `npm run dev`               | Next.js en dev avec `.env.development`                   |
| `npm run dev:prod`          | Next.js en dev connecté à `.env.production`              |
| `npm run build`             | Build production (utilise les variables de l’environnement d’exécution) |
| `npm run build:prod-local`  | Build local en chargeant `.env.production`               |
| `npm run start`             | Lance le build en local                                  |
| `npm run lint`              | ESLint (`--max-warnings=0`)                              |
| `npm run typecheck`         | Vérifie les types TypeScript                             |
| `npm run format`            | Formate avec Prettier                                    |
| `npm run prisma:migrate`    | `prisma migrate dev` avec `.env.development`             |
| `npm run prisma:migrate:prod` | `prisma migrate deploy` sur `.env.production`         |
| `npm run prisma:generate`   | Génère le client Prisma (base locale)                    |
| `npm run prisma:studio`     | Prisma Studio connecté à la base locale                  |

## Lancer l’application

```bash
npm run dev
# http://localhost:3000
```

Les routes `/dashboard`, `/sheets`, `/sheets/*` sont protégées côté middleware **et** côté serveur : impossible d’y accéder sans session, même vide.

## Structure

```
src/
 ├─ app/
 │   ├─ (auth)/auth/login    → page inscription/connexion
 │   ├─ (app)/dashboard      → dashboard mensuel
 │   ├─ (app)/sheets         → historique des fiches
 │   ├─ (app)/sheets/new     → création de fiche
 │   └─ (app)/sheets/[id]    → détail/édition
 ├─ components/              → UI réutilisable (forms, layout…)
 ├─ lib/                     → Prisma client, helpers, validations
 └─ app/api/                 → Routes sécurisées (Auth, Sheets)
```

## Déploiement Vercel + Supabase

### 1. Préparer la base Supabase

1. Créez un projet Supabase (PostgreSQL 15+).
2. Dans `Project Settings → Database → Connection string`, copiez la chaîne `postgresql://...` et ajoutez `?pgbouncer=true&connection_limit=1` si vous utilisez PgBouncer.
3. Depuis votre machine :
   ```bash
   # exportez temporairement la chaîne (ou éditez .env.production)
   export DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/postgres?schema=public"
   npm run prisma:migrate:prod   # applique les migrations sur Supabase
   npm run prisma:generate       # régénère le client pour la prod
   ```

### 2. Variables d’environnement Vercel

Dans `Vercel → Project Settings → Environment Variables` :

| Nom            | Valeur                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL` | Chaîne Supabase/Postgres copiée ci-dessus                             |
| `AUTH_SECRET`  | `openssl rand -base64 32` ou `node -e "console.log(...)"`              |
| `NEXTAUTH_URL` | `https://votre-domaine.vercel.app` (optionnel mais recommandé)        |

Définissez-les dans les trois environnements (`Production`, `Preview`, `Development`) pour que les pre-deploys Vercel puissent exécuter Prisma.

### 3. Build & start

Le projet est configuré avec `next.config.ts → output: "standalone"` : le build est regroupé dans `.next/` (notamment `.next/standalone`). Vercel utilise automatiquement ce bundle unique, évitant les doublons JS. Aucune étape supplémentaire n’est requise.

En local :
```bash
npm run build   # génère .next/standalone
npm run start   # vérifie le build
```

Sur Vercel, gardez les commandes par défaut :
- **Build Command** : `npm run build`
- **Install Command** : `npm install`
- **Output Directory** : laissé vide (Next.js gère `.next`)

### 4. Étapes manuelles post-déploiement

1. Vérifier que la variable `DATABASE_URL` pointe vers le même projet Supabase pour toutes les branches.
2. Après chaque modification Prisma, lancer `npx prisma migrate deploy --schema prisma/schema.prisma` depuis un terminal connecté à Supabase (ou via la nouvelle fonctionnalité “Migrations” de Supabase Studio).
3. (Optionnel) Configurer un `Cron Job` Supabase si vous avez besoin de tâches planifiées (ex. archivage).

## Qualité

- `npm run lint` et `npm run typecheck` avant chaque PR.
- Formulaire dynamique validé par Zod + React Hook Form côté client.
- Chaque endpoint API renvoie des statuts clairs (`401`, `400`, `404`) pour faciliter le debugging.

Bon budget à vous !
