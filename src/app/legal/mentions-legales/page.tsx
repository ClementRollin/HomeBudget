/* eslint-disable react/no-unescaped-entities */
export const metadata = { title: "Mentions légales — HomeBudget" };

export default function MentionsLegalesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">Mentions légales</h1>
      <p className="text-slate-400 text-sm">Dernière mise à jour : août 2025</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Éditeur</h2>
        <p className="text-slate-300">
          Le site HomeBudget est édité par :<br />
          <strong>[NOM / RAISON SOCIALE]</strong><br />
          [FORME JURIDIQUE] au capital de [MONTANT] €<br />
          Siège social : [ADRESSE COMPLÈTE]<br />
          SIRET : [NUMÉRO SIRET]<br />
          RCS : [VILLE] [NUMÉRO RCS]<br />
          Directeur de la publication : [NOM DU RESPONSABLE]<br />
          Contact : contact@[DOMAINE]
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Hébergement</h2>
        <p className="text-slate-300">
          Le site est hébergé par :<br />
          <strong>Vercel Inc.</strong><br />
          440 N Barranca Ave #4133, Covina, CA 91723, USA<br />
          Site : vercel.com
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Base de données</h2>
        <p className="text-slate-300">
          Les données sont stockées sur des serveurs PostgreSQL hébergés par{" "}
          <strong>Supabase Inc.</strong> dans la région EU-West (Union Européenne).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Propriété intellectuelle</h2>
        <p className="text-slate-300">
          L'ensemble du contenu de ce site (textes, images, logotype, interface) est la propriété
          exclusive de l'éditeur ou fait l'objet d'une autorisation d'utilisation. Toute
          reproduction, représentation ou diffusion, en tout ou partie, est interdite sans
          autorisation préalable écrite.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Responsabilité</h2>
        <p className="text-slate-300">
          Les informations fournies par HomeBudget ont un caractère informatif. Elles ne
          constituent pas un conseil financier ou juridique. L'éditeur ne saurait être tenu
          responsable des décisions prises par les utilisateurs sur la base des informations
          affichées.
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
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Droit applicable</h2>
        <p className="text-slate-300">
          Les présentes mentions légales sont soumises au droit français. En cas de litige,
          et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
        </p>
      </section>
    </>
  );
}
