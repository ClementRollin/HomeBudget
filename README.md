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

```bash
cp .env.example .env
```

| Variable       | Description                                              |
| -------------- | -------------------------------------------------------- |
| `DATABASE_URL` | Chaîne de connexion Postgres (format supporté par Prisma) |
| `AUTH_SECRET`  | Secret utilisé par NextAuth pour signer les JWT          |

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

| Commande                | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Démarre Next.js en mode développement |
| `npm run build`         | Build production                     |
| `npm run start`         | Lance le build en local              |
| `npm run lint`          | ESLint (`--max-warnings=0`)          |
| `npm run typecheck`     | Vérifie les types TypeScript         |
| `npm run format`        | Formate avec Prettier                |
| `npm run prisma:migrate`| `prisma migrate dev`                 |
| `npm run prisma:generate` | Génère le client Prisma            |
| `npm run prisma:studio` | Ouvre Prisma Studio                  |

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

## Déploiement Vercel

1. Déclarez `DATABASE_URL` et `AUTH_SECRET` dans les variables de projet Vercel.
2. Lancez `npm run prisma:migrate` sur votre base distante (job manuel ou shell Vercel).
3. Déployez : Vercel exécutera `npm run build` puis `next start`.

## Qualité

- `npm run lint` et `npm run typecheck` avant chaque PR.
- Formulaire dynamique validé par Zod + React Hook Form côté client.
- Chaque endpoint API renvoie des statuts clairs (`401`, `400`, `404`) pour faciliter le debugging.

Bon budget à vous !
