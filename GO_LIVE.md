# HomeBudget — Go-Live Checklist

Ce document liste toutes les actions à effectuer avant la mise en production.
Les sections sont ordonnées par priorité : comptes tiers → infrastructure → config app → validation.

---

## 1. Comptes tiers à créer / configurer

### Stripe
- [ ] Créer un compte Stripe (https://dashboard.stripe.com)
- [ ] Activer le compte (vérification identité + IBAN)
- [ ] Créer un produit "HomeBudget PRO"
  - [ ] Prix mensuel : 9,90 € / mois — noter l'ID `price_...`
  - [ ] Prix annuel (optionnel) — noter l'ID `price_...`
- [ ] Configurer le Customer Portal (Billing > Customer Portal)
  - [ ] Activer la résiliation en self-service
  - [ ] Activer la mise à jour du moyen de paiement
- [ ] Créer un webhook Stripe pointant vers `https://[DOMAINE]/api/stripe/webhooks`
  - [ ] Événements à écouter : `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`
  - [ ] Noter le `whsec_...`
- [ ] Activer le mode Live (désactiver le mode Test)
- [ ] Configurer les e-mails de facturation (Stripe > Settings > Emails)

### Google Cloud (Gemini AI)
- [ ] Créer un projet Google Cloud (https://console.cloud.google.com)
- [ ] Activer l'API "Generative Language API" (Gemini)
- [ ] Créer une clé API avec restriction par IP ou referer
- [ ] Définir un quota max mensuel pour éviter les surprises de coût

### Vercel
- [ ] Créer un projet Vercel lié au repository GitHub
- [ ] Configurer le domaine personnalisé
- [ ] Activer le Blob Store (Storage > Blob) — noter le `BLOB_READ_WRITE_TOKEN`
- [ ] Définir toutes les variables d'environnement (voir section 3)

### Supabase (base de données)
- [ ] Créer un projet Supabase (region : EU West pour RGPD)
- [ ] Récupérer la `DATABASE_URL` poolée (Settings > Database > Connection Pooling)
- [ ] Activer les backups automatiques quotidiens
- [ ] Configurer les règles RLS si nécessaire

---

## 2. Génération des secrets

Générer les secrets cryptographiques suivants (commandes openssl) :

```bash
# AUTH_SECRET (Auth.js)
openssl rand -base64 32

# ENCRYPTION_KEY (AES-256-GCM chiffrement données)
openssl rand -base64 32

# INVITE_PEPPER (hachage codes d'invitation)
openssl rand -base64 32
```

> **CRITIQUE** : Stocker ces valeurs dans un gestionnaire de secrets (Bitwarden, 1Password)
> et les documenter dans le vault de l'équipe. La perte de `ENCRYPTION_KEY`
> entraîne la perte définitive de toutes les données chiffrées en base.

---

## 3. Variables d'environnement Vercel

Configurer dans Vercel (Settings > Environment Variables) pour l'environnement Production :

| Variable | Source | Obligatoire |
|---|---|---|
| `DATABASE_URL` | Supabase > Connection Pooling | ✅ |
| `AUTH_SECRET` | `openssl rand -base64 32` | ✅ |
| `NEXTAUTH_URL` | `https://[votre-domaine]` | ✅ |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` | ✅ |
| `INVITE_PEPPER` | `openssl rand -base64 32` | ✅ |
| `INVITE_EXPIRATION_DAYS` | `7` | ✅ |
| `STRIPE_SECRET_KEY` | Stripe Dashboard > API Keys | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Webhooks | ✅ |
| `STRIPE_PRICE_ID_PRO_MONTHLY` | Stripe Dashboard > Products | ✅ |
| `STRIPE_PRICE_ID_PRO_ANNUAL` | Stripe Dashboard > Products | optionnel |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY` | = `STRIPE_PRICE_ID_PRO_MONTHLY` | ✅ |
| `GEMINI_API_KEY` | Google Cloud Console | ✅ |
| `BLOB_READ_WRITE_TOKEN` | Vercel > Storage > Blob | ✅ |

---

## 4. Migrations base de données

Appliquer les migrations Prisma en production :

```bash
# Via Vercel CLI (déclenché automatiquement au deploy si configuré)
npx prisma migrate deploy

# Ou manuellement via DATABASE_URL de production
DATABASE_URL="..." npx prisma migrate deploy
```

Vérifier que toutes les migrations sont appliquées :

```bash
npx prisma migrate status
```

---

## 5. Vérifications avant déploiement

### Code
- [ ] `npm run typecheck` passe sans erreur
- [ ] `npm run lint` passe avec `--max-warnings=0`
- [ ] `npm run test:unit` — 99/99 tests passent
- [ ] `npm run build` passe sans erreur (build Next.js)

### Légal (à compléter avant mise en ligne)
- [ ] Renseigner les informations société dans les pages légales (`[NOM / RAISON SOCIALE]`, `[SIRET]`, `[ADRESSE]`, `contact@[DOMAINE]`)
- [ ] Vérifier que les CGU, CGV et politique de confidentialité sont à jour
- [ ] Faire relire les documents légaux par un juriste (recommandé)
- [ ] Enregistrer le traitement auprès de la CNIL si nécessaire (registro)

### Stripe (test end-to-end)
- [ ] Tester un paiement complet en mode Test (carte `4242 4242 4242 4242`)
- [ ] Vérifier que le webhook est bien reçu et traité
- [ ] Vérifier que le plan passe à PRO après paiement
- [ ] Tester la résiliation depuis le Customer Portal
- [ ] Vérifier que le plan repasse à FREE après résiliation

### Application
- [ ] Tester l'inscription (mode `create` et mode `join`)
- [ ] Tester l'onboarding wizard
- [ ] Tester la création d'une fiche mensuelle
- [ ] Tester l'upload d'un document fiscal et l'extraction IA
- [ ] Vérifier les limites du plan FREE (3 fiches, 5 actifs, etc.)
- [ ] Tester les pages légales depuis `/legal/cgu`, `/legal/cgv`, etc.

### Infrastructure
- [ ] Vérifier que les headers HTTPS sont bien configurés (HSTS, CSP)
- [ ] Configurer un domaine personnalisé avec SSL
- [ ] Configurer les redirections www → non-www (ou l'inverse)
- [ ] Tester les redirections HTTP → HTTPS

---

## 6. Post-déploiement

- [ ] Monitorer les logs Vercel les premières 24h
- [ ] Configurer des alertes d'erreur (Vercel > Notifications ou Sentry)
- [ ] Vérifier les métriques Stripe (no erreurs webhook)
- [ ] Valider que les backups Supabase sont actifs
- [ ] Documenter les accès dans le vault de l'équipe

---

## 7. Rollback plan

En cas de problème critique après déploiement :

1. **Vercel** : Revenir au déploiement précédent depuis le dashboard (Deployments > Promote)
2. **Base de données** : La dernière migration Prisma est réversible via `prisma migrate resolve`
   — vérifier le fichier `migration.sql` correspondant pour la requête `DROP`/`ALTER` inverse
3. **Stripe** : Désactiver le produit PRO dans le dashboard pour bloquer les nouveaux abonnements

---

*Dernière mise à jour : août 2025*
