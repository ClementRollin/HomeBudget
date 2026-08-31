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
          Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès
          et l'utilisation de l'application web HomeBudget accessible à l'adresse{" "}
          <strong>homebudget.app</strong> (ci-après « le Service »), éditée par son éditeur
          (ci-après « l'Éditeur »). En créant un compte, l'utilisateur accepte sans réserve
          l'intégralité des présentes CGU.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">2. Description du Service</h2>
        <p className="text-slate-300">
          HomeBudget est un outil de gestion budgétaire et patrimoniale personnelle permettant
          de suivre les revenus, dépenses, actifs, dettes et objectifs financiers d'un foyer.
          Il propose des fonctionnalités de simulation fiscale et d'extraction automatisée de
          données fiscales par intelligence artificielle.
        </p>
        <p className="text-slate-300">
          Le Service propose deux niveaux d'accès :
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>
            <strong>Plan FREE</strong> : accès gratuit avec fonctionnalités et volumes limités.
          </li>
          <li>
            <strong>Plan PRO</strong> : accès payant avec fonctionnalités étendues et volumes
            illimités, soumis aux Conditions Générales de Vente.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">3. Accès au Service</h2>
        <p className="text-slate-300">
          L'accès au Service requiert la création d'un compte avec une adresse e-mail valide et
          un mot de passe. L'utilisateur s'engage à fournir des informations exactes et à
          maintenir la confidentialité de ses identifiants. Tout accès non autorisé à un compte
          tiers doit être signalé immédiatement à{" "}
          <a href="mailto:contact@homebudget.app" className="text-amber-400 hover:underline">
            contact@homebudget.app
          </a>
          .
        </p>
        <p className="text-slate-300">
          Chaque compte est rattaché à un « foyer ». Un foyer peut comporter plusieurs membres
          invités via un code d'invitation personnel. Les membres d'un même foyer partagent
          l'accès à l'intégralité des données du foyer.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">4. Obligations de l'utilisateur</h2>
        <p className="text-slate-300">L'utilisateur s'engage à :</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>Ne pas utiliser le Service à des fins illicites ou frauduleuses</li>
          <li>Ne pas tenter d'accéder aux données d'autres foyers</li>
          <li>Ne pas automatiser l'accès au Service sans autorisation écrite préalable de l'Éditeur</li>
          <li>Ne pas partager son code d'invitation publiquement ou à des tiers non autorisés</li>
          <li>Ne pas introduire de virus, maliciels ou codes nuisibles dans le Service</li>
          <li>Respecter les droits de propriété intellectuelle de l'Éditeur</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">5. Disponibilité et maintenance</h2>
        <p className="text-slate-300">
          L'Éditeur s'efforce d'assurer une disponibilité du Service 24h/24, 7j/7, sans
          toutefois s'y engager contractuellement. Des interruptions pour maintenance peuvent
          survenir avec ou sans préavis. L'Éditeur ne saurait être tenu responsable des pertes
          ou préjudices liés à une indisponibilité du Service.
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
          Les données financières saisies par l'utilisateur lui appartiennent exclusivement.
          L'Éditeur ne les exploite à aucune fin commerciale ou publicitaire et ne les cède
          jamais à des tiers à cette fin.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">7. Limitation de responsabilité</h2>
        <p className="text-slate-300">
          HomeBudget est un outil d'aide à la gestion budgétaire et patrimoniale personnelle.
          Les informations, calculs et simulations fournis n'ont pas valeur de conseil financier,
          fiscal ou juridique professionnel. L'Éditeur ne saurait être tenu responsable des
          décisions financières ou fiscales prises par l'utilisateur sur la base des informations
          affichées.
        </p>
        <p className="text-slate-300">
          La responsabilité de l'Éditeur ne pourra être engagée en cas de force majeure, de
          fait d'un tiers ou de comportement fautif de l'utilisateur.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">8. Propriété intellectuelle</h2>
        <p className="text-slate-300">
          L'ensemble des éléments constituant le Service (code source, interface, marques,
          textes, graphismes, logotypes) sont la propriété exclusive de l'Éditeur ou font
          l'objet d'une autorisation d'utilisation, et sont protégés par le droit de la
          propriété intellectuelle français et communautaire. Toute reproduction, représentation,
          diffusion ou adaptation, en tout ou partie, sans autorisation préalable écrite de
          l'Éditeur, est interdite et constituerait une contrefaçon sanctionnée pénalement.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">9. Modification des CGU</h2>
        <p className="text-slate-300">
          L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les
          utilisateurs seront informés par e-mail de tout changement substantiel au moins 30 jours
          avant son entrée en vigueur. La poursuite de l'utilisation du Service après cette
          période vaut acceptation des nouvelles CGU.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">10. Résiliation</h2>
        <p className="text-slate-300">
          L'utilisateur peut supprimer son compte à tout moment depuis la page Paramètres.
          Cette suppression entraîne la suppression définitive de l'ensemble des données du
          foyer dans un délai de 30 jours, sous réserve des obligations légales de conservation.
        </p>
        <p className="text-slate-300">
          L'Éditeur peut suspendre ou supprimer un compte en cas de violation caractérisée des
          présentes CGU, après mise en demeure restée sans effet pendant 48 heures, ou sans
          délai en cas de violation grave.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">11. Droit applicable et juridiction</h2>
        <p className="text-slate-300">
          Les présentes CGU sont soumises au droit français. En cas de litige, les parties
          s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut
          de résolution amiable dans un délai de 30 jours, les tribunaux compétents seront ceux
          du ressort du siège de l'Éditeur.
        </p>
        <p className="text-slate-300">
          Conformément à l'article L612-1 du Code de la consommation, tout consommateur peut
          recourir gratuitement à la médiation de la consommation en cas de litige non résolu.
        </p>
      </section>
    </>
  );
}
