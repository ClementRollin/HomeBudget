/* eslint-disable react/no-unescaped-entities */
export const metadata = { title: "Mentions légales — HomeBudget" };

// ⚠️  SECTIONS MARQUÉES [À COMPLÉTER] : informations légalement obligatoires
//     (art. 6 LCEN) à renseigner avant la mise en ligne.

export default function MentionsLegalesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">Mentions légales</h1>
      <p className="text-slate-400 text-sm">Dernière mise à jour : août 2025</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Éditeur du site</h2>
        <p className="text-slate-300">
          Le site <strong>homebudget.app</strong> est édité par :<br />
          <strong>[NOM / RAISON SOCIALE]</strong><br />
          [FORME JURIDIQUE] — Capital : [MONTANT] €<br />
          Siège social : [ADRESSE COMPLÈTE]<br />
          SIRET : [NUMÉRO SIRET]<br />
          RCS : [VILLE D'IMMATRICULATION] — [NUMÉRO RCS]<br />
          Directeur de la publication : [NOM DU RESPONSABLE]<br />
          Contact :{" "}
          <a href="mailto:contact@homebudget.app" className="text-amber-400 hover:underline">
            contact@homebudget.app
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Hébergement</h2>
        <p className="text-slate-300">
          Le site est hébergé par :<br />
          <strong>Vercel Inc.</strong><br />
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
          Site web :{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            vercel.com
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Base de données</h2>
        <p className="text-slate-300">
          Les données des utilisateurs sont stockées sur des serveurs PostgreSQL hébergés par{" "}
          <strong>Supabase Inc.</strong> dans la région EU-West (Union Européenne), garantissant
          la conformité au règlement RGPD.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Paiements</h2>
        <p className="text-slate-300">
          Les paiements sont traités par <strong>Stripe Inc.</strong>, 510 Townsend Street,
          San Francisco, CA 94103, États-Unis. Aucune donnée bancaire n'est stockée sur les
          serveurs de l'Éditeur.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Propriété intellectuelle</h2>
        <p className="text-slate-300">
          L'ensemble du contenu de ce site (textes, images, logotype, interface graphique,
          code source) est la propriété exclusive de l'Éditeur ou fait l'objet d'une
          autorisation d'utilisation accordée par leurs titulaires respectifs. Toute
          reproduction, représentation, modification ou diffusion, en tout ou partie, sans
          autorisation préalable écrite de l'Éditeur, est interdite et constitue une
          contrefaçon sanctionnée aux articles L335-2 et suivants du Code de la propriété
          intellectuelle.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Limitation de responsabilité</h2>
        <p className="text-slate-300">
          Les informations fournies par HomeBudget ont un caractère informatif et général.
          Elles ne constituent pas un conseil financier, fiscal ou juridique professionnel et
          ne sauraient engager la responsabilité de l'Éditeur. Les simulations et calculs
          présentés sont fournis à titre indicatif. L'Éditeur ne garantit pas l'exactitude,
          l'exhaustivité ou l'actualité des informations affichées.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Données personnelles</h2>
        <p className="text-slate-300">
          Pour toute information relative au traitement de vos données personnelles, consultez
          notre{" "}
          <a href="/legal/confidentialite" className="text-amber-400 hover:underline">
            Politique de confidentialité
          </a>
          . Pour exercer vos droits, contactez-nous à{" "}
          <a href="mailto:contact@homebudget.app" className="text-amber-400 hover:underline">
            contact@homebudget.app
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Cookies</h2>
        <p className="text-slate-300">
          Ce site utilise uniquement des cookies techniques strictement nécessaires au
          fonctionnement du Service (cookie de session d'authentification). Aucun cookie
          publicitaire, de tracking ou analytique tiers n'est utilisé. Aucun consentement
          n'est requis pour ces cookies conformément à la délibération CNIL n° 2020-091.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Droit applicable</h2>
        <p className="text-slate-300">
          Les présentes mentions légales sont soumises au droit français. En cas de litige
          portant sur leur interprétation ou leur exécution, et à défaut de résolution amiable,
          les tribunaux français seront seuls compétents.
        </p>
      </section>
    </>
  );
}
