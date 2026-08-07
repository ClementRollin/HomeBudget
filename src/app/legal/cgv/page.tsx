/* eslint-disable react/no-unescaped-entities */
export const metadata = { title: "Conditions Générales de Vente — HomeBudget" };

export default function CgvPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">Conditions Générales de Vente</h1>
      <p className="text-slate-400 text-sm">Dernière mise à jour : août 2025</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">1. Vendeur</h2>
        <p className="text-slate-300">
          [NOM / RAISON SOCIALE], [FORME JURIDIQUE], SIRET [NUMÉRO SIRET],
          dont le siège social est situé [ADRESSE COMPLÈTE] (ci-après « l'Éditeur »).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">2. Offres et tarifs</h2>
        <p className="text-slate-300">HomeBudget propose deux formules :</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>
            <strong>Plan FREE</strong> : accès gratuit avec fonctionnalités limitées
            (3 fiches mensuelles, 5 actifs, 3 dettes, 3 objectifs)
          </li>
          <li>
            <strong>Plan PRO</strong> : 9,90 € TTC / mois (TVA incluse au taux en vigueur)
            avec accès illimité à toutes les fonctionnalités
          </li>
        </ul>
        <p className="text-slate-300">
          Les prix sont affichés TTC. L'Éditeur se réserve le droit de modifier ses tarifs.
          Les utilisateurs abonnés seront informés par e-mail 30 jours avant toute modification.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">3. Modalités de paiement</h2>
        <p className="text-slate-300">
          Les paiements sont traités par <strong>Stripe Inc.</strong> via carte bancaire.
          L'abonnement PRO est renouvelé automatiquement chaque mois à la date anniversaire de
          la souscription. Le client reçoit une facture par e-mail à chaque renouvellement.
        </p>
        <p className="text-slate-300">
          En cas d'échec de paiement, l'accès PRO est maintenu pendant une période de grâce de
          7 jours, après quoi le compte est rétrogradé automatiquement au plan FREE.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">4. Rétractation</h2>
        <p className="text-slate-300">
          Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation
          de 14 jours ne s'applique pas aux services numériques dont l'exécution a commencé avec
          l'accord du consommateur. En souscrivant au plan PRO, l'utilisateur accepte expressément
          que le service commence immédiatement et renonce à son droit de rétractation.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">5. Résiliation</h2>
        <p className="text-slate-300">
          L'utilisateur peut résilier son abonnement à tout moment depuis le portail client Stripe
          accessible dans les paramètres de son compte. La résiliation prend effet à la fin de la
          période de facturation en cours. Aucun remboursement prorata temporis n'est accordé.
        </p>
        <p className="text-slate-300">
          Après résiliation, les données restent accessibles en lecture seule pendant 30 jours,
          puis le compte est rétrogradé au plan FREE avec conservation des données dans les
          limites du plan gratuit.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">6. Remboursements</h2>
        <p className="text-slate-300">
          En cas d'interruption de service imputable à l'Éditeur excédant 72 heures consécutives,
          l'utilisateur PRO peut demander un remboursement prorata du mois en cours en contactant
          contact@[DOMAINE]. Les demandes de remboursement pour d'autres motifs sont examinées
          au cas par cas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">7. Obligations de l'Éditeur</h2>
        <p className="text-slate-300">
          L'Éditeur s'engage à fournir le Service avec sérieux et à sécuriser les données
          conformément à la politique de confidentialité. L'obligation de l'Éditeur est une
          obligation de moyens.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">8. Facturation et TVA</h2>
        <p className="text-slate-300">
          Les factures sont émises par Stripe au nom de l'Éditeur et téléchargeables depuis
          les paramètres du compte (section « Historique des factures »). La TVA applicable
          est celle du pays de résidence du client conformément aux règles de TVA sur les
          services numériques B2C.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">9. Litiges</h2>
        <p className="text-slate-300">
          Les présentes CGV sont soumises au droit français. En cas de litige, le consommateur
          peut recourir gratuitement à la médiation de la consommation auprès du médiateur
          compétent. À défaut de résolution amiable, les tribunaux du ressort du siège de
          l'Éditeur seront compétents.
        </p>
        <p className="text-slate-300">
          Plateforme de règlement en ligne des litiges (UE) :{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            ec.europa.eu/consumers/odr
          </a>
        </p>
      </section>
    </>
  );
}
