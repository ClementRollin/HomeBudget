/* eslint-disable react/no-unescaped-entities */
export const metadata = { title: "Conditions Générales d'Utilisation — HomeBudget" };

export default function CguPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">{"Conditions Générales d'Utilisation"}</h1>
      <p className="text-slate-400 text-sm">Dernière mise à jour : août 2025</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">1. Objet</h2>
        <p className="text-slate-300">
          Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et
          l'utilisation de l'application web HomeBudget (ci-après « le Service »), éditée par
          [NOM / RAISON SOCIALE]. En créant un compte, l'utilisateur accepte sans réserve les
          présentes CGU.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">2. Description du Service</h2>
        <p className="text-slate-300">
          HomeBudget est un outil de gestion budgétaire et patrimoniale personnelle permettant
          de suivre les revenus, dépenses, actifs, dettes et objectifs financiers d'un foyer.
          Le Service propose deux niveaux d'accès : un plan gratuit (FREE) et un plan payant (PRO).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">3. Accès au Service</h2>
        <p className="text-slate-300">
          L'accès au Service requiert la création d'un compte. L'utilisateur s'engage à fournir
          des informations exactes et à maintenir la confidentialité de ses identifiants. Tout
          accès non autorisé doit être signalé immédiatement à contact@[DOMAINE].
        </p>
        <p className="text-slate-300">
          Chaque compte est rattaché à un « foyer » (famille). Un foyer peut comporter plusieurs
          membres invités via un code d'invitation. Les membres d'un même foyer partagent
          l'accès aux données du foyer.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">4. Obligations de l'utilisateur</h2>
        <p className="text-slate-300">L'utilisateur s'engage à :</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>Ne pas utiliser le Service à des fins illicites ou frauduleuses</li>
          <li>Ne pas tenter d'accéder aux données d'autres foyers</li>
          <li>Ne pas automatiser l'accès au Service sans autorisation préalable</li>
          <li>Ne pas partager son code d'invitation publiquement</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">5. Disponibilité et maintenance</h2>
        <p className="text-slate-300">
          L'éditeur s'efforce d'assurer une disponibilité du Service 24h/24, 7j/7, sans toutefois
          s'y engager contractuellement. Des interruptions pour maintenance peuvent survenir sans
          préavis. L'éditeur ne saurait être tenu responsable des pertes liées à une indisponibilité.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">6. Données et confidentialité</h2>
        <p className="text-slate-300">
          Le traitement des données personnelles est décrit dans notre{" "}
          <a href="/legal/confidentialite" className="text-amber-400 hover:underline">
            Politique de confidentialité
          </a>
          , qui fait partie intégrante des présentes CGU.
        </p>
        <p className="text-slate-300">
          Les données financières saisies par l'utilisateur lui appartiennent. L'éditeur ne les
          exploite à aucune fin commerciale ou publicitaire.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">7. Limitation de responsabilité</h2>
        <p className="text-slate-300">
          HomeBudget est un outil d'aide à la gestion personnelle. Les informations, calculs et
          simulations fournis n'ont pas valeur de conseil financier, fiscal ou juridique
          professionnel. L'éditeur ne saurait être tenu responsable des décisions financières
          prises par l'utilisateur.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">8. Propriété intellectuelle</h2>
        <p className="text-slate-300">
          L'ensemble des éléments constituant le Service (code source, interface, marques,
          textes) sont la propriété exclusive de l'éditeur et sont protégés par le droit
          de la propriété intellectuelle. Toute reproduction est interdite sans autorisation.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">9. Modification et résiliation</h2>
        <p className="text-slate-300">
          L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les
          utilisateurs seront notifiés par e-mail des changements substantiels. L'utilisateur
          peut supprimer son compte à tout moment depuis les paramètres.
        </p>
        <p className="text-slate-300">
          L'éditeur peut suspendre ou supprimer un compte en cas de violation des présentes CGU,
          après mise en demeure restée sans effet.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">10. Droit applicable</h2>
        <p className="text-slate-300">
          Les présentes CGU sont soumises au droit français. En cas de litige, les parties
          s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut,
          les tribunaux compétents seront ceux du ressort du siège de l'éditeur.
        </p>
      </section>
    </>
  );
}
