# Checklist review PR — frontend HomeBudget

Stack : Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS, React Hook Form + Zod, Vitest.

## Base (sécurité / non-régression / maintenabilité)

- Le besoin (issue ou description de PR) est-il réellement résolu ?
- Le changement est-il minimal, ou élargit-il le scope sans raison ?
- Y a-t-il des effets de bord sur d'autres pages ou composants ?
- Les erreurs serveur sont-elles affichées à l'utilisateur de façon exploitable ?
- Le typage TypeScript est-il strict (props typées, pas de `any`) ?
- Les tests couvrent-ils le changement (Vitest pour logique de hook/composant) ?

## Server Components vs Client Components

- Un composant est `"use client"` uniquement si nécessaire (état local, event handlers, hooks React).
- Les Server Components fetchent les données directement (pas de `useEffect` + `fetch` côté client pour du SSR).
- Pas d'import de librairies browser-only dans un Server Component.
- Le découpage Server/Client respecte la frontière : passer des données sérialisables en props, jamais des fonctions non-sérialisables cross-boundary.

## React Hook Form

- Toujours utiliser `FormProvider` + `useFormContext` si le formulaire est décomposé en sous-composants.
- Les sous-composants de formulaire utilisent `useFormContext<FormValues>()` pour accéder au `register`, `control`, etc.
- `useFieldArray` pour les champs dynamiques — ne jamais manipuler un tableau de champs manuellement.
- La validation Zod est attachée via `zodResolver` dans `useForm()`.

## Routing App Router

- Les routes sont organisées dans `src/app/` avec les groupes `(app)`, `(auth)`, `(setup)`, `(admin)`, `legal`.
- Les `page.tsx` sont des Server Components par défaut — ne pas les rendre client sans raison.
- Les layouts (`layout.tsx`) ne doivent pas contenir de logique métier — uniquement du shell/nav.
- `redirect()` de `next/navigation` pour les redirections côté serveur, `router.push()` côté client.

## Composants & réutilisabilité

- Avant un nouveau composant : vérifier `src/components/ui/` pour les primitives existantes.
- Avant une nouvelle logique de formatage (montant, date...) : vérifier `src/lib/` pour les helpers.
- Les god components (> 200 lignes) sont décomposés en sous-composants avec responsabilités claires.
- Les hooks custom sont dans `src/hooks/` avec le préfixe `use`.

## Tailwind CSS

- Pas de classes inline `style={}` — utiliser Tailwind.
- Couleurs et espacements via les tokens du projet (pas de valeurs arbitraires `[#abc123]` sauf exception justifiée).
- Les composants responsives utilisent les breakpoints Tailwind (`sm:`, `md:`, `lg:`).
- Pas de z-index arbitraires — utiliser l'échelle Tailwind.

## TypeScript

- Props de composant définies avec une interface explicite (pas de types inférés depuis defaultProps).
- Préférer une prop optionnelle `foo?` à une union `foo: T | undefined`.
- Utiliser les types partagés depuis `src/types/` plutôt que de redéfinir un type existant.
- `as const` pour les ensembles de valeurs fixes (ex: `CHARGE_TYPES`), pas d'enum TypeScript.

## Nommage

- Composants : PascalCase. Hooks : `useXxx`. Utilitaires : camelCase.
- Pas d'abréviations non standards dans les noms de props/variables.

## Tests

- Mettre à jour les tests existants quand le comportement testé change.
- Pour les hooks avec side-effects (fetch), mocker `fetch` dans Vitest — ne pas faire de requêtes réseau réelles.
- Tester les états de loading, error et success si le composant les affiche.
