# Checklist review PR — backend HomeBudget

Stack : Next.js 15 App Router, TypeScript strict, Prisma 6, Supabase PostgreSQL, NextAuth 5, Stripe, AES-256-GCM encryption, Zod, Vitest.

## Base (sécurité / non-régression / maintenabilité)

- Le besoin (issue ou description de PR) est-il réellement résolu ?
- Le changement est-il minimal, ou élargit-il le scope sans raison ?
- Y a-t-il des effets de bord sur d'autres API routes ou domaines ?
- Les erreurs sont-elles gérées correctement (HTTP status cohérents, pas de 500 silencieux) ?
- Le typage TypeScript est-il strict (pas de `any`, interfaces définies) ?
- Les tests couvrent-ils le changement (unitaires dans `src/lib/__tests__/`, intégration si API) ?
- Les données sensibles sont-elles chiffrées via `encryptValue`/`encryptNumber` de `src/lib/crypto.ts` ?
- Le contrat API (types, statuts) est-il préservé ou son évolution documentée ?

## Layering / architecture App Router

- **Route handlers** dans `src/app/api/` : logique minimale, délèguent aux libs.
- **Logique métier** dans `src/lib/` : `cfo.ts`, `fiscalite.ts`, `crypto.ts`, etc.
- **Validation** : Zod dans `src/lib/validations/` — toujours valider les inputs à la frontière (API route).
- **Auth** : toujours vérifier la session via `auth()` de NextAuth en tête de route handler, avant toute logique.
- **Plans/limites** : appeler `checkLimit()` de `src/lib/plans.ts` avant toute création de ressource soumise aux quotas FREE.
- Jamais de logique métier directement dans un composant Server — passer par une Server Action ou une API route.

## Encryption des données sensibles

- Toute valeur financière stockée en BDD (montant, solde, revenu...) passe par `encryptNumber`/`decryptNumber`.
- Toute chaîne sensible (nom complet, IBAN...) passe par `encryptValue`/`decryptValue`.
- Ne jamais stocker de valeur en clair dans un champ `String` ou `Float` Prisma destiné à une donnée personnelle.
- Vérifier que `ENCRYPTION_KEY` est toujours vérifiée via `getKey()` — ne jamais la lire directement.

## Prisma / base de données

- Toute nouvelle colonne de données financières doit être de type `String` (pour stocker la valeur chiffrée), pas `Float`.
- Toute migration est dans `prisma/migrations/` avec un timestamp explicite.
- Vérifier les relations Prisma (cascade delete, contraintes) sur les modèles touchés.
- Pas de requête `$queryRaw` sauf si absolument nécessaire — utiliser l'ORM.
- Chaque famille (`familyId`) est isolée : toujours filtrer par `familyId` dans les queries — jamais exposer des données inter-familles.

## Auth & autorisation

- Toute route handler vérifie `const session = await auth()` + `if (!session) return 401`.
- Les opérations sensibles vérifient que `session.user.familyId` correspond à la ressource ciblée.
- Pas de `role === 'admin'` inline — les vérifications de rôle sont centralisées.

## Stripe & abonnements

- Toute logique dépendant du plan (`PRO`/`FREE`) passe par `checkLimit()` ou vérifie `session.user.plan`.
- Les webhooks Stripe valident la signature via `stripe.webhooks.constructEvent()` avant tout traitement.

## Duplication / réinvention

- Avant une nouvelle fonction utilitaire : vérifier `src/lib/` pour les helpers existants.
- Toute logique de calcul financier (CFO, fiscalité) est dans `src/lib/`, pas dans un composant.
- Groupement de données : utiliser les `include` Prisma plutôt que plusieurs requêtes séparées.

## Tests

- Un test qui vérifie un statut HTTP sans vérifier le payload n'est pas suffisant.
- Isolation par famille (`familyId`) testée explicitement.
- Les fonctions `src/lib/` sont testées indépendamment des routes.
- `encryptValue`/`decryptValue` : toujours tester le round-trip, jamais la valeur chiffrée directement.
