/* eslint-disable react/no-unescaped-entities */
export const metadata = { title: "Politique de confidentialité — HomeBudget" };

export default function ConfidentialitePage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">Politique de confidentialité</h1>
      <p className="text-slate-400 text-sm">Dernière mise à jour : août 2025</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">1. Responsable du traitement</h2>
        <p className="text-slate-300">
          Le responsable du traitement des données à caractère personnel est l'éditeur de
          l'application HomeBudget (homebudget.app), joignable à l'adresse :{" "}
          <a href="mailto:contact@homebudget.app" className="text-amber-400 hover:underline">
            contact@homebudget.app
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">2. Données collectées</h2>
        <p className="text-slate-300">
          Dans le cadre de l'utilisation de HomeBudget, nous collectons les données suivantes :
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>
            <strong>Données d'identification</strong> : adresse e-mail, prénom/nom (optionnel),
            mot de passe hashé (bcrypt) — collectés à l'inscription.
          </li>
          <li>
            <strong>Données budgétaires et patrimoniales</strong> : revenus, charges, actifs,
            dettes, objectifs financiers — saisies volontairement par l'utilisateur,
            chiffrées au repos (AES-256-GCM).
          </li>
          <li>
            <strong>Documents fiscaux</strong> : fichiers PDF ou images téléversés pour
            extraction automatique par IA — traités une seule fois et non conservés
            après extraction.
          </li>
          <li>
            <strong>Données de paiement</strong> : gérées exclusivement par Stripe Inc. —
            non stockées sur les serveurs de l'Éditeur.
          </li>
          <li>
            <strong>Données techniques</strong> : adresse IP, logs de connexion, horodatages
            — collectés automatiquement pour la sécurité et la prévention de la fraude.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">3. Finalités et bases légales</h2>
        <p className="text-slate-300">
          Vos données sont traitées pour les finalités et sur les bases légales suivantes
          (Règlement (UE) 2016/679 — RGPD) :
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>
            Fourniture et personnalisation du Service — base : exécution du contrat (art. 6.1.b)
          </li>
          <li>
            Gestion de l'abonnement, facturation et recouvrement — base : exécution du contrat (art. 6.1.b)
          </li>
          <li>
            Envoi des e-mails transactionnels liés au compte et à l'abonnement — base : exécution du contrat (art. 6.1.b)
          </li>
          <li>
            Sécurité du Service, prévention des fraudes et abus — base : intérêt légitime (art. 6.1.f)
          </li>
          <li>
            Conservation des pièces comptables et fiscales — base : obligation légale (art. 6.1.c)
          </li>
          <li>
            Extraction des données fiscales par IA — base : exécution du contrat, avec consentement implicite
            par l'acte de téléversement (art. 6.1.b)
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">4. Destinataires des données</h2>
        <p className="text-slate-300">
          Nous ne vendons pas vos données. Elles peuvent être communiquées aux sous-traitants
          suivants dans le cadre strict de la fourniture du Service :
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>
            <strong>Stripe Inc.</strong> (États-Unis) — traitement sécurisé des paiements.
            Accord de traitement des données (DPA) en place. Transferts encadrés par les
            clauses contractuelles types de la Commission européenne.
          </li>
          <li>
            <strong>Supabase Inc.</strong> — hébergement de la base de données. Données
            stockées dans la région EU-West (Union Européenne).
          </li>
          <li>
            <strong>Vercel Inc.</strong> (États-Unis) — hébergement de l'application. Logs
            anonymisés. Transferts encadrés par les clauses contractuelles types.
          </li>
          <li>
            <strong>Resend Inc.</strong> — envoi des e-mails transactionnels. Seule l'adresse
            e-mail du destinataire et le contenu de l'e-mail sont transmis.
          </li>
          <li>
            <strong>Google LLC</strong> — extraction des données fiscales par le modèle
            Gemini. Seul le document téléversé est transmis, sans conservation par Google
            au-delà du traitement (politique de rétention zéro configurée).
          </li>
        </ul>
        <p className="text-slate-300">
          Aucune donnée n'est transmise à des tiers à des fins publicitaires ou de marketing.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">5. Durées de conservation</h2>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>
            <strong>Données de compte et données budgétaires</strong> : conservées jusqu'à
            suppression du compte par l'utilisateur, ou pendant 3 ans à compter de la dernière
            activité du compte, puis supprimées.
          </li>
          <li>
            <strong>Documents fiscaux téléversés</strong> : transmis à l'IA pour extraction
            puis supprimés — non conservés au-delà du traitement.
          </li>
          <li>
            <strong>Données de facturation</strong> : conservées 10 ans conformément aux
            obligations comptables légales (art. L123-22 Code de commerce).
          </li>
          <li>
            <strong>Logs techniques (adresse IP, connexions)</strong> : 12 mois maximum.
          </li>
          <li>
            <strong>Données de la base chiffrée</strong> : supprimées dans un délai de 30 jours
            suivant la suppression du compte.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">6. Vos droits</h2>
        <p className="text-slate-300">
          Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés
          modifiée, vous disposez des droits suivants sur vos données personnelles :
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>Droit d'accès (art. 15 RGPD) — obtenir une copie de vos données</li>
          <li>Droit de rectification (art. 16) — corriger des données inexactes</li>
          <li>Droit à l'effacement / « droit à l'oubli » (art. 17) — supprimer vos données</li>
          <li>Droit à la limitation du traitement (art. 18)</li>
          <li>Droit à la portabilité (art. 20) — recevoir vos données dans un format structuré</li>
          <li>Droit d'opposition (art. 21) — notamment au traitement fondé sur l'intérêt légitime</li>
          <li>Droit de ne pas faire l'objet d'une décision automatisée (art. 22)</li>
        </ul>
        <p className="text-slate-300 mt-2">
          Pour exercer ces droits, adressez votre demande à{" "}
          <a href="mailto:contact@homebudget.app" className="text-amber-400 hover:underline">
            contact@homebudget.app
          </a>{" "}
          en indiquant votre adresse e-mail de compte. Nous nous engageons à y répondre dans
          un délai d'un mois (délai pouvant être prolongé à 3 mois pour les demandes complexes,
          avec information préalable).
        </p>
        <p className="text-slate-300">
          Vous pouvez également introduire une réclamation auprès de l'autorité de contrôle
          compétente : la{" "}
          <strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong>,
          3 Place de Fontenoy, 75007 Paris —{" "}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            cnil.fr
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">7. Cookies</h2>
        <p className="text-slate-300">
          HomeBudget utilise uniquement un cookie de session technique strictement nécessaire
          à l'authentification de l'utilisateur. Ce cookie est supprimé à la déconnexion ou
          à l'expiration de la session. Aucun cookie publicitaire, de mesure d'audience ou de
          pistage tiers n'est utilisé. Conformément à la délibération CNIL n° 2020-091,
          aucun bandeau de consentement n'est requis pour ce seul cookie essentiel.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">8. Sécurité des données</h2>
        <p className="text-slate-300">
          L'Éditeur met en œuvre les mesures techniques et organisationnelles suivantes pour
          protéger vos données :
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>Chiffrement des données en transit : TLS 1.2+ (HTTPS)</li>
          <li>Chiffrement des données financières au repos : AES-256-GCM</li>
          <li>Hachage des mots de passe : bcrypt (facteur de coût 12)</li>
          <li>Isolation stricte des données par foyer (architecture multi-tenant)</li>
          <li>Protection contre les attaques par force brute : rate limiting par IP</li>
          <li>Protection CSRF sur toutes les routes de mutation</li>
          <li>Accès à la base de données restreint aux services applicatifs</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">9. Transferts hors UE</h2>
        <p className="text-slate-300">
          Certains de nos sous-traitants (Vercel, Stripe, Resend, Google) sont établis aux
          États-Unis. Ces transferts sont encadrés par les mécanismes suivants : clauses
          contractuelles types (CCT) approuvées par la Commission européenne, et/ou adhésion
          au cadre transatlantique de protection des données (Data Privacy Framework). Vous
          pouvez obtenir copie des garanties mises en place en écrivant à{" "}
          <a href="mailto:contact@homebudget.app" className="text-amber-400 hover:underline">
            contact@homebudget.app
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">10. Modification de la politique</h2>
        <p className="text-slate-300">
          L'Éditeur se réserve le droit de modifier la présente politique à tout moment.
          Les utilisateurs sont informés par e-mail de tout changement substantiel au moins
          30 jours avant son entrée en vigueur. La date de dernière mise à jour figure en
          haut de cette page. La version en vigueur est toujours accessible à l'adresse{" "}
          <strong>homebudget.app/legal/confidentialite</strong>.
        </p>
      </section>
    </>
  );
}
