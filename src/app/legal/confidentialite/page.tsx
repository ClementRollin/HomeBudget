/* eslint-disable react/no-unescaped-entities */
export const metadata = { title: "Politique de confidentialité — HomeBudget" };

export default function ConfidentialitePage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">Politique de confidentialité</h1>
      <p className="text-slate-400 text-sm">Dernière mise à jour : août 2025</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Responsable du traitement</h2>
        <p className="text-slate-300">
          Le responsable du traitement des données à caractère personnel est [NOM / RAISON SOCIALE],
          joignable à l'adresse contact@[DOMAINE].
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Données collectées</h2>
        <p className="text-slate-300">Dans le cadre de l'utilisation de HomeBudget, nous collectons :</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>Adresse e-mail et mot de passe haché (création de compte)</li>
          <li>Données financières saisies : revenus, charges, actifs, dettes, objectifs</li>
          <li>Documents fiscaux téléversés (PDF/image) traités par IA et supprimés après extraction</li>
          <li>Données de paiement gérées exclusivement par Stripe (non stockées sur nos serveurs)</li>
          <li>Données techniques : adresse IP, logs de connexion, horodatages</li>
        </ul>
        <p className="text-slate-300 mt-2">
          Les données financières sensibles (montants, libellés) sont chiffrées au repos avec
          AES-256-GCM avant stockage en base de données.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Finalités et bases légales</h2>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>Fourniture du service (exécution du contrat) — art. 6.1.b RGPD</li>
          <li>Gestion de l'abonnement et facturation (exécution du contrat) — art. 6.1.b RGPD</li>
          <li>Sécurité et prévention de la fraude (intérêt légitime) — art. 6.1.f RGPD</li>
          <li>Obligations légales comptables et fiscales (obligation légale) — art. 6.1.c RGPD</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Partage des données</h2>
        <p className="text-slate-300">Nous ne vendons pas vos données. Elles peuvent être partagées avec :</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li><strong>Stripe Inc.</strong> — traitement des paiements (DPA en place, transferts encadrés)</li>
          <li><strong>Supabase Inc.</strong> — hébergement base de données (données stockées en UE)</li>
          <li><strong>Vercel Inc.</strong> — hébergement application (CDN, logs anonymisés)</li>
          <li><strong>Prestataire IA</strong> — extraction des documents fiscaux uniquement, sans conservation</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Durée de conservation</h2>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>Données de compte : jusqu'à suppression du compte ou 3 ans après dernière activité</li>
          <li>Documents fiscaux : supprimés après extraction, non conservés</li>
          <li>Données de facturation : 10 ans (obligation légale comptable)</li>
          <li>Logs techniques : 12 mois</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Vos droits</h2>
        <p className="text-slate-300">
          Conformément au RGPD (UE) 2016/679, vous disposez des droits suivants :
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>Droit d'accès à vos données (art. 15)</li>
          <li>Droit de rectification (art. 16)</li>
          <li>Droit à l'effacement (« droit à l'oubli ») (art. 17)</li>
          <li>Droit à la limitation du traitement (art. 18)</li>
          <li>Droit à la portabilité (art. 20)</li>
          <li>Droit d'opposition (art. 21)</li>
        </ul>
        <p className="text-slate-300 mt-2">
          Pour exercer ces droits, contactez-nous à contact@[DOMAINE]. Nous répondrons dans un
          délai d'un mois. Vous pouvez également introduire une réclamation auprès de la{" "}
          <strong>CNIL</strong> (cnil.fr).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Cookies</h2>
        <p className="text-slate-300">
          HomeBudget utilise uniquement des cookies techniques nécessaires au fonctionnement du
          service (session d'authentification). Aucun cookie publicitaire ou de tracking tiers
          n'est utilisé.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Sécurité</h2>
        <p className="text-slate-300">
          Vos données sont protégées par chiffrement TLS en transit et AES-256-GCM au repos.
          L'accès aux données est restreint par famille via des contrôles d'accès stricts.
          Les mots de passe sont hachés avec bcrypt (facteur 12).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Modifications</h2>
        <p className="text-slate-300">
          Nous nous réservons le droit de modifier cette politique. Les utilisateurs seront
          informés par e-mail de tout changement substantiel. La date de dernière mise à jour
          figure en haut de cette page.
        </p>
      </section>
    </>
  );
}
