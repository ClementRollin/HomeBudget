# Workflow de revue — HomeBudget

Ce document définit les skills Claude Code à invoquer à chaque étape du cycle de développement.
L'objectif est de garantir la qualité, la sécurité et la cohérence avant chaque commit ou déploiement.

---

## 1. Avant chaque commit (`feature/*`, `fix/*`)

### Étape 1 — Scan de sécurité pré-commit
```
/opsera-devsecops:pre-commit-scan
```
Couvre : gitleaks (secrets), semgrep (SAST), npm audit (dépendances), checkov (IaC).
**Seuil bloquant** : tout finding `CRITICAL` ou `HIGH` non justifié interdit le commit.
Les rapports sont archivés dans `.claude/scan-reports/` (ignoré par git).

### Étape 2 — Revue de code
```
/code-review
```
Focus : logique métier, typage TypeScript strict, sécurité applicative (XSS, CSRF, injection),
respect des conventions du projet (Conventional Commits, architecture lib/components).

### Étape 3 — Vérification avant finalisation de branche
```
/superpowers:finishing-a-development-branch
```
Checklist : typecheck (`npm run typecheck`), lint (`npm run lint`), tests (`npm run test`),
migrations Prisma valides (`npx prisma validate`), pas de fichier `.env` stagé.

---

## 2. Avant chaque PR vers `develop`

### Étape 4 — Analyse d'architecture
```
/opsera-devsecops:architecture-analyze
```
Valide : pas de régression sur les flux critiques (auth, chiffrement AES-256-GCM, Stripe webhooks).
Vérifie la cohérence des nouveaux composants avec l'arborescence définie.

---

## 3. Avant chaque déploiement (`develop` → `main`)

### Étape 5 — Vérification Vercel
```
/vercel:verification
```
Valide : toutes les variables d'environnement sont présentes, build preview propre,
migration Prisma appliquée, webhook Stripe enregistré.

### Étape 6 — Analyse DevSecOps complète
```
/opsera-devsecops:security-scan
```
Scan complet (grype, hadolint, package-leakage) avant mise en production.

---

## Cadence recommandée

| Déclencheur | Skills à invoquer |
|---|---|
| Nouveau commit sur `feature/*` | étapes 1, 2 |
| Avant `git push` | étape 3 |
| Avant PR → `develop` | étapes 1, 2, 3, 4 |
| Avant merge PR → `main` | étapes 1, 2, 3, 4, 5, 6 |

---

## Références skills disponibles

| Skill | Rôle |
|---|---|
| `opsera-devsecops:pre-commit-scan` | Secrets, SAST, dépendances |
| `opsera-devsecops:security-scan` | Scan complet (grype, hadolint) |
| `opsera-devsecops:architecture-analyze` | Conformité architecture |
| `code-review` | Revue qualité et sécurité |
| `superpowers:finishing-a-development-branch` | Checklist fin de branche |
| `superpowers:verification-before-completion` | Vérification avant livraison |
| `vercel:verification` | Déploiement Vercel |
| `vercel:env` | Gestion des variables d'environnement |
