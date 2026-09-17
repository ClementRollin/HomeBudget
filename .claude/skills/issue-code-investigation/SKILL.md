---
name: issue-code-investigation
description: Instruire une issue GitHub HomeBudget (numéro ou URL) en explorant le code, l'architecture et la BDD du repo, pour proposer des pistes de résolution dev ou la tâche concrète à réaliser si l'issue n'est pas du dev.
---

# Issue Code Investigation — HomeBudget

## Contexte projet

- **Repo** : `ClementRollin1/HomeBudget` (mono-repo, GitHub Issues)
- **Stack** : Next.js 15 App Router, React 19, TypeScript strict, Prisma 6, Supabase PostgreSQL, NextAuth 5, Stripe, Tailwind CSS
- **Récupération de ticket** : `gh issue view <numéro> --repo ClementRollin1/HomeBudget`

## Méthode

1. **Récupérer l'issue** :
   ```bash
   gh issue view <numéro> --repo ClementRollin1/HomeBudget
   ```
   Si l'utilisateur a collé le texte directement, travailler à partir de ce texte.

2. **Qualifier l'issue** :
   - **Dev** : bug applicatif, comportement à corriger, besoin de code ou de correction de données.
   - **Non-dev** : configuration Vercel/Supabase/Stripe, action support, paramétrage — rien qui nécessite de modifier du code.

3. **Déterminer le périmètre** : proposer une hypothèse sur les zones du repo concernées (API routes, composants, lib, prisma...) et **toujours demander confirmation** avant d'explorer. Ne pas explorer silencieusement.

4. **Si issue dev** : dispatcher l'agent `code-investigator` avec le contenu de l'issue et les zones confirmées. Laisser l'agent explorer (lecture seule) et remonter faits confirmés, hypothèses, pistes et fichiers concernés.

5. **Si issue non-dev** : rédiger la tâche concrète sous forme de mode opératoire (où intervenir, quoi faire, dans quel outil), sans exploration de code.

6. **Mettre en forme le résultat** avec le template ci-dessous.

## Règles strictes

- Ne jamais commenter l'issue sans validation explicite de l'utilisateur.
- Ne jamais exécuter de script SQL proposé.
- Toujours distinguer faits confirmés (avec `fichier:ligne`) et hypothèses.
- Toujours confirmer le périmètre avant d'explorer.

## Sortie recommandée

```md
## Résumé de l'issue

## Type (dev / non-dev)

## Zones concernées dans le repo

## Faits confirmés

## Hypothèses

## Pistes de résolution

## Fichiers/zones de code concernés

## Script SQL proposé
(si applicable — à valider et exécuter manuellement)

## Tâche à réaliser
(si non-dev — mode opératoire concret)

## Informations manquantes / questions
```
