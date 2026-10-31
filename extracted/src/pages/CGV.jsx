import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CGV() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary transition-colors mb-12 tracking-wider uppercase">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour
        </Link>

        <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-4">ARAK3D</p>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-2">
          Conditions Générales de Vente
        </h1>
        <p className="font-mono text-xs text-muted-foreground mb-12">
          Applicables dans le canton de Vaud, Suisse
        </p>

        <div className="space-y-10 font-body text-sm text-muted-foreground leading-relaxed">

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">1. Objet et champ d'application</h2>
            <p>
              Les présentes conditions générales de vente (CGV) régissent l'ensemble des relations contractuelles entre ARAK3D (ci-après « le Vendeur ») et toute personne physique ou morale souhaitant procéder à l'achat ou à la commande de produits issus de l'impression 3D (ci-après « le Client »). Tout achat ou demande de commande implique l'acceptation pleine et entière des présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">2. Identification du vendeur</h2>
            <p>
              ARAK3D est une activité de vente de produits imprimés en 3D exercée dans le canton de Vaud, Suisse. Pour toute question, le Client peut contacter ARAK3D via le formulaire de contact disponible sur le site ou par email.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">3. Produits</h2>
            <p>
              Les produits proposés sont des objets fabriqués par impression 3D (technologie FDM/FFF ou similaire), à partir de matériaux tels que le PLA, PETG ou autres filaments. Les caractéristiques essentielles de chaque produit (dimensions, matériau, couleur disponible, prix) sont décrites sur le site dans la mesure du possible. Les photographies et visuels 3D sont fournis à titre indicatif ; de légères variations de teinte ou de finition peuvent exister entre l'aperçu et le produit livré, inhérentes au procédé d'impression.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">4. Prix</h2>
            <p>
              Les prix sont indiqués en francs suisses (CHF), toutes taxes comprises. ARAK3D se réserve le droit de modifier ses prix à tout moment ; les produits sont facturés sur la base des tarifs en vigueur au moment de la validation de la commande. Pour les commandes personnalisées, un devis est établi au cas par cas avant toute facturation.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">5. Commandes</h2>
            <p>
              Toute demande de commande est soumise à validation par ARAK3D. Une demande n'est définitivement acceptée qu'après confirmation explicite (par email ou via le suivi de commande sur le site). ARAK3D se réserve le droit de refuser toute commande sans avoir à justifier sa décision, notamment en cas de stock indisponible, de demande non réalisable techniquement, ou de tout autre motif légitime.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">6. Paiement</h2>
            <p>
              Le paiement s'effectue via les moyens mis à disposition (lien de paiement SumUp ou autre solution indiquée lors de la confirmation de commande). La commande est lancée en production uniquement après réception du paiement intégral. En cas de non-paiement dans le délai convenu, ARAK3D se réserve le droit d'annuler la commande.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">7. Délais de fabrication et livraison</h2>
            <p>
              Les délais de fabrication sont indicatifs et dépendent de la charge de travail et de la complexité du produit. ARAK3D s'engage à informer le Client de tout retard significatif. La livraison peut être effectuée par remise en main propre ou par envoi postal selon les modalités convenues. Les frais d'envoi éventuels sont à la charge du Client et précisés lors de la confirmation de commande.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">8. Droit de rétractation</h2>
            <p>
              Conformément à la loi suisse (CO art. 40a et suivants), les produits fabriqués selon les spécifications personnalisées du Client sont exclus du droit de rétractation. Pour les produits standards (non personnalisés), le Client dispose d'un délai de 7 jours à compter de la réception pour signaler tout problème ou demander un retour, sous réserve que le produit soit retourné en parfait état, non utilisé et dans son emballage d'origine.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">9. Garanties et responsabilité</h2>
            <p>
              ARAK3D garantit la conformité des produits livrés avec la description figurant sur le site au moment de la commande. En cas de défaut avéré imputable à la fabrication, ARAK3D s'engage à remplacer ou rembourser le produit concerné. La garantie ne couvre pas les dommages résultant d'une utilisation incorrecte, d'une exposition à des conditions extrêmes (chaleur, humidité excessive) ou d'un choc mécanique post-livraison. La responsabilité de ARAK3D est en tout état de cause limitée au montant de la commande concernée.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">10. Protection des données (LPD)</h2>
            <p>
              Les données personnelles collectées (nom, adresse email, message) sont utilisées exclusivement dans le cadre du traitement des commandes et ne sont pas transmises à des tiers. Conformément à la Loi fédérale sur la protection des données (LPD, RS 235.1), le Client dispose d'un droit d'accès, de rectification et de suppression de ses données en contactant ARAK3D directement.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">11. Propriété intellectuelle</h2>
            <p>
              Les modèles 3D, designs et créations proposés sur le site sont la propriété exclusive de ARAK3D ou de leurs auteurs respectifs. Toute reproduction, diffusion ou utilisation commerciale sans autorisation préalable est strictement interdite. Les fichiers ou modèles fournis par le Client pour une impression personnalisée restent sa propriété ; le Client atteste être titulaire des droits nécessaires sur ces fichiers.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">12. Droit applicable et for juridique</h2>
            <p>
              Les présentes CGV sont soumises au droit suisse. En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire. À défaut d'accord, le for juridique exclusif est le tribunal compétent du canton de Vaud, Suisse.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-foreground text-base mb-3 uppercase tracking-wider">13. Modifications des CGV</h2>
            <p>
              ARAK3D se réserve le droit de modifier les présentes CGV à tout moment. Les CGV applicables sont celles en vigueur à la date de la commande.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-border/30">
          <p className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
            Dernière mise à jour : Juin 2026 — ARAK3D, Canton de Vaud, Suisse
          </p>
        </div>
      </div>
    </div>
  );
}