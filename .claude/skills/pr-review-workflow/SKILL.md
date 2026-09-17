---
name: pr-review-workflow
description: Traiter de bout en bout une pull request HomeBudget (GitHub) à partir de son URL — analyse le contexte (PR + retours de review déjà traités), analyse le code réel sur la branche locale, génère un plan de dev actionnable, implémente directement les corrections qui ont une direction claire, relance la review pre-commit et traite ses retours, puis prépare (sans jamais l'exécuter) le commit et le push en attendant la validation de l'utilisateur. Utilise ce skill dès que l'utilisateur donne une URL de PR à reviewer ou à corriger.
---

# PR Review Workflow — HomeBudget

## Contexte projet

- **Repo** : `ClementRollin1/HomeBudget` (GitHub)
- **CLI Git** : `gh`
- **Tickets** : GitHub Issues (`#123`)
- **Branches** : `feature/`, `fix/`, `chore/`, `refactor/`, `docs/` → vers `develop` → vers `main`
- **Stack** : Next.js 15 App Router, React 19, TypeScript strict, Prisma 6, Supabase PostgreSQL, NextAuth 5, Stripe, Tailwind CSS, Vitest
- **Checklists** : `references/backend-checklist.md` et `references/frontend-checklist.md`

## Entrée attendue

URL complète d'une PR GitHub. Si l'utilisateur donne seulement un numéro, confirmer qu'il s'agit bien de `ClementRollin1/HomeBudget`.

## Méthode

### Phase 1 — Analyser le contexte de la PR

1. **Parser l'URL** : extraire le numéro de PR.
2. **Récupérer les métadonnées** :
   ```bash
   gh pr view <numéro> --repo ClementRollin1/HomeBudget
   ```
3. **Récupérer les discussions de review** :
   ```bash
   gh pr view <numéro> --repo ClementRollin1/HomeBudget --comments
   ```
   Classifier chaque discussion :
   - **Déjà traité** : le code sur la branche applique déjà ce que le reviewer demandait.
   - **Direction claire, pas encore appliquée** : le reviewer a dit quoi faire → dev à faire.
   - **Question réellement ouverte** : le reviewer pose une question sans trancher → mise en attente.
4. **Chercher un ticket lié** dans le titre, la description ou le nom de branche (`#123`).
5. **Vérifier l'état CI** :
   ```bash
   gh pr checks <numéro> --repo ClementRollin1/HomeBudget
   ```

### Phase 2 — Analyser le code sur la branche locale

6. **Se mettre sur la bonne branche** :
   ```bash
   git status  # vérifier l'état avant
   git fetch origin
   git checkout <branche-source>
   ```
7. **Lire `CLAUDE.md`** et `src/` pour les conventions.
8. **Appliquer les checklists** (`references/backend-checklist.md` et `references/frontend-checklist.md`).
9. **Restituer un rapport de contexte**.

### Phase 3 — Générer le plan de dev

10. **Plan fusionnant** points de checklist et discussions "direction claire" :
    - **Déjà traité** : pas de tâche.
    - **Dev à faire** : à exécuter en phase 4.
    - **À arbitrer** : uniquement les questions vraiment ouvertes.

### Phase 4 — Exécuter les corrections

11. **Implémenter** chaque tâche "Dev à faire".
12. **Ne pas toucher** aux tâches "À arbitrer".
13. Lancer `npm run typecheck && npm run lint && npm run test` pour vérifier.

### Phase 5 — Review pre-commit

14. Vérifier le diff des corrections :
    ```bash
    git diff HEAD
    ```
15. Appliquer `references/backend-checklist.md` et `references/frontend-checklist.md` sur le diff.
16. Corriger les points bloquants et non bloquants identifiés.

### Phase 6 — Préparer commit et push (jamais exécuté sans validation)

17. **Préparer le message de commit** (Conventional Commits, anglais) :
    - `fix(<scope>): ...` / `feat(<scope>): ...` / `refactor(<scope>): ...`
18. **Préparer les commandes exactes** :
    ```bash
    git add <fichiers spécifiques>
    git commit -m "..."
    git push origin <branche>
    ```
19. **Présenter à l'utilisateur et attendre validation explicite**.
20. Une fois validé, proposer de marquer résolus les fils traités :
    ```bash
    gh pr comment <numéro> --repo ClementRollin1/HomeBudget --body "..."
    ```

## Sortie attendue (rapport de contexte)

- **PR** : numéro, titre, branche source → cible, auteur, lien.
- **Ticket lié** : `#123` + résumé, ou "aucun ticket identifiable".
- **État CI** : vert / rouge / en cours.
- **Discussions** : nombre par catégorie, résumé d'une ligne chacune.
- **Résumé** : ce que fait le changement, en 2-3 phrases.
- **Points bloquants** (avec `fichier:ligne`).
- **Points non bloquants**.
- **Risques**.
