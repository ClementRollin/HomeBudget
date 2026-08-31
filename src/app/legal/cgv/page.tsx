/* eslint-disable react/no-unescaped-entities */
export const metadata = { title: "Conditions Générales de Vente — HomeBudget" };

// ⚠️  SECTIONS MARQUÉES [À COMPLÉTER] : informations légales obligatoires
//     à renseigner avant la mise en ligne (raison sociale, SIRET, adresse).

export default function CgvPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">Conditions Générales de Vente</h1>
      <p className="text-slate-400 text-sm">Dernière mise à jour : août 2025</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">1. Vendeur</h2>
        <p className="text-slate-300">
          Le présent Service est édité par :<br />
          <strong>[NOM / RAISON SOCIALE]</strong> — [FORME JURIDIQUE]<br />
          SIRET : [NUMÉRO SIRET]<br />
          Siège social : [ADRESSE COMPLÈTE]<br />
          Contact commercial :{" "}
          <a href="mailto:contact@homebudget.app" className="text-amber-400 hover:underline">
            contact@homebudget.app
          </a>
          <br />
          (ci-après « l'Éditeur »)
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">2. Champ d'application</h2>
        <p className="text-slate-300">
          Les présentes Conditions Générales de Vente (ci-après « CGV ») s'appliquent à toute
          souscription au plan payant HomeBudget PRO par un utilisateur consommateur ou
          professionnel (ci-après « le Client ») sur le site{" "}
          <strong>homebudget.app</strong>. Elles prévalent sur tout autre document, sauf accord
          dérogatoire exprès de l'Éditeur.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">3. Offres et tarifs</h2>
        <p className="text-slate-300">HomeBudget propose deux formules :</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li>
            <strong>Plan FREE</strong> : accès gratuit avec fonctionnalités et volumes limités
            (3 fiches mensuelles, 5 actifs, 3 dettes, 2 objectifs).
          </li>
          <li>
            <strong>Plan PRO</strong> : 9,90 € TTC / mois avec accès illimité à l'intégralité
            des fonctionnalités, dont la déclaration 2042 assistée par IA et le simulateur
            d'impôt sur le revenu.
          </li>
        </ul>
        <p className="text-slate-300">
          Les prix sont affichés toutes taxes comprises (TTC). L'Éditeur se réserve le droit
          de modifier ses tarifs. Tout abonné PRO sera informé par e-mail au moins 30 jours
          avant toute modification tarifaire. Le silence du Client vaut acceptation du nouveau
          tarif à compter de la prochaine échéance de facturation.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">4. Modalités de commande</h2>
        <p className="text-slate-300">
          La souscription au plan PRO s'effectue via la page Paramètres du Service. Le Client
          sélectionne son plan, est redirigé vers la plateforme de paiement sécurisé Stripe,
          renseigne ses informations de paiement et valide sa commande. La confirmation de
          souscription est transmise par e-mail.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">5. Paiement</h2>
        <p className="text-slate-300">
          Les paiements sont traités exclusivement par <strong>Stripe Inc.</strong> via carte
          bancaire (Visa, Mastercard, American Express). L'Éditeur ne stocke aucune donnée
          bancaire sur ses propres serveurs.
        </p>
        <p className="text-slate-300">
          L'abonnement PRO est à renouvellement automatique mensuel, prélevé à la date
          anniversaire de la souscription. Le Client reçoit un justificatif de paiement par
          e-mail à chaque renouvellement, téléchargeable depuis les Paramètres du Service.
        </p>
        <p className="text-slate-300">
          En cas d'échec de paiement, l'Éditeur notifie le Client par e-mail. L'accès PRO est
          maintenu pendant une période de grâce de 7 jours pour régularisation. À l'issue de
          ce délai sans régularisation, le compte est automatiquement rétrogradé au plan FREE.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">6. Droit de rétractation</h2>
        <p className="text-slate-300">
          Conformément à l'article L221-28 12° du Code de la consommation, le droit de
          rétractation de 14 jours ne s'applique pas aux contenus numériques non fournis sur
          un support matériel dont l'exécution a commencé avec l'accord préalable et exprès du
          consommateur, qui a renoncé à son droit de rétractation. En souscrivant au plan PRO,
          le Client reconnaît et accepte expressément que l'exécution du service commence
          immédiatement et renonce en conséquence à son droit de rétractation.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">7. Résiliation</h2>
        <p className="text-slate-300">
          Le Client peut résilier son abonnement à tout moment depuis le Portail Client Stripe
          accessible dans les Paramètres du Service. La résiliation prend effet à la fin de la
          période de facturation en cours. Aucun remboursement prorata temporis n'est accordé
          pour la période déjà facturée.
        </p>
        <p className="text-slate-300">
          Après résiliation, le compte est rétrogradé au plan FREE. Les données existantes
          sont conservées dans les limites du plan gratuit. Les données excédant ces limites
          restent accessibles en lecture pendant 30 jours, après quoi elles peuvent être
          archivées ou supprimées.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">8. Remboursements</h2>
        <p className="text-slate-300">
          En cas d'interruption totale du Service imputable à l'Éditeur excédant 72 heures
          consécutives, le Client PRO peut demander un avoir ou un remboursement prorata du
          mois en cours en contactant{" "}
          <a href="mailto:contact@homebudget.app" className="text-amber-400 hover:underline">
            contact@homebudget.app
          </a>{" "}
          dans les 30 jours suivant l'incident. Les demandes pour d'autres motifs sont
          examinées au cas par cas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">9. Facturation et TVA</h2>
        <p className="text-slate-300">
          Les factures sont émises au nom de l'Éditeur et accessibles depuis les Paramètres
          du Service (section « Historique des factures »). La TVA applicable est celle du
          pays de résidence du Client, conformément à la réglementation TVA sur les services
          numériques B2C (directive 2006/112/CE modifiée).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">10. Obligations de l'Éditeur</h2>
        <p className="text-slate-300">
          L'Éditeur s'engage à fournir le Service avec sérieux, à sécuriser les données du
          Client conformément à la Politique de confidentialité, et à maintenir la
          disponibilité du Service dans les conditions décrites aux CGU. L'obligation de
          l'Éditeur est une obligation de moyens.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">11. Médiation et litiges</h2>
        <p className="text-slate-300">
          Les présentes CGV sont soumises au droit français. En cas de litige, le Client et
          l'Éditeur s'efforceront de trouver une solution amiable. À défaut, le consommateur
          peut recourir gratuitement à la médiation de la consommation auprès du médiateur
          compétent conformément à l'article L612-1 du Code de la consommation.
        </p>
        <p className="text-slate-300">
          Plateforme européenne de règlement en ligne des litiges (UE) :{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            ec.europa.eu/consumers/odr
          </a>
        </p>
        <p className="text-slate-300">
          À défaut de résolution amiable, les tribunaux du ressort du siège de l'Éditeur seront
          seuls compétents pour les litiges entre professionnels. Pour les litiges avec des
          consommateurs, les règles légales de compétence s'appliquent.
        </p>
      </section>
    </>
  );
}
