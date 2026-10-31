import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Clock, CheckCircle, XCircle, Palette, Package, AlertTriangle, Mail, Printer, Truck, Star, Youtube } from 'lucide-react';
import FooterSection from '../components/home/FooterSection';

const Section = ({ icon: Icon, title, children, delay = 0 }) =>
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay }}
  className="border border-border/50 bg-card/20 p-6 md:p-8">
  
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 border border-primary/30 bg-primary/5 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="font-display font-bold text-lg">{title}</h2>
    </div>
    <div className="font-body text-sm text-muted-foreground leading-relaxed space-y-3 pl-11">
      {children}
    </div>
  </motion.div>;


const Step = ({ num, text }) =>
<div className="flex items-start gap-3">
    <span className="font-mono text-[10px] text-primary border border-primary/30 bg-primary/5 w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{num}</span>
    <p>{text}</p>
  </div>;


export default function Infos() {
  return (
    <div className="pt-24 pb-0 min-h-screen">
      <div className="px-6 md:px-[8vw] max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12">
          
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-4 uppercase">Informations</p>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight mb-4">
            Comment ça fonctionne ?
          </h1>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed">
            Tout ce que vous devez savoir pour passer commande sur ARAK3D, de la découverte du produit jusqu'au paiement.
          </p>
        </motion.div>

        <div className="space-y-6 mb-24">
          {/* Commander un produit du catalogue */}
          <Section icon={ShoppingBag} title="Commander un produit du catalogue" delay={0.1}>
            <p>Voici les étapes pour commander un produit déjà existant dans notre catalogue :</p>
            <div className="space-y-2 mt-3">
              <Step num="1" text="Parcourez le catalogue et trouvez le produit qui vous intéresse." />
              <Step num="2" text='Cliquez sur "Faire une demande" directement sur la fiche produit.' />
              <Step num="3" text="Remplissez le formulaire : votre nom, email, la quantité souhaitée (max 2 par demande), la couleur, et un message optionnel." />
              <Step num="4" text="Vous recevrez immédiatement un email avec votre code client unique (ex: ARK-A1B2C3). Conservez-le précieusement !" />
              <Step num="5" text="Nous examinons votre demande et vous notifions par email de notre décision." />
              <Step num="6" text="Si acceptée, rendez-vous dans l'onglet « Suivre ma commande » (icône coeur en haut à droite) pour accéder au lien de paiement." />
            </div>
          </Section>

          {/* Faire une demande personnalisée */}
          <Section icon={Palette} title="Faire une demande personnalisée" delay={0.2}>
            <p>Vous avez un projet unique en tête ? Utilisez la page <Link to="/demande" className="text-primary hover:underline">Demande</Link> pour soumettre votre idée :</p>
            <div className="space-y-2 mt-3">
              <Step num="1" text="Décrivez votre projet en détail : dimensions, matériau souhaité, couleur, quantité et budget approximatif." />
              <Step num="2" text="Soumettez votre demande. Vous recevrez un code de suivi par email." />
              <Step num="3" text="Nous étudions la faisabilité et vous répondons pour discuter des détails et du devis." />
              <Step num="4" text="Si votre demande est acceptée, un lien de paiement vous sera communiqué." />
            </div>
          </Section>

          {/* Suivre sa commande */}
          <Section icon={Search} title="Suivre le statut de sa commande" delay={0.3}>
            <p>Après avoir soumis une demande (catalogue ou personnalisée), vous recevez un <strong className="text-foreground">code client unique</strong> par email.</p>
            <p>Pour vérifier l'avancement de votre demande :</p>
            <div className="space-y-2 mt-3">
              <Step num="1" text="Cliquez sur l'icône coeur (Favoris 3D) en haut à droite du site." />
              <Step num="2" text='Faites défiler vers le bas et cliquez sur "Suivre ma commande".' />
              <Step num="3" text="Entrez votre code (ex: ARK-A1B2C3) et appuyez sur Vérifier." />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 p-2 border border-amber-400/20 bg-amber-400/5">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <p className="text-amber-400/80 text-xs"><strong>En attente</strong> — Votre demande est en cours d'examen par notre équipe.</p>
              </div>
              <div className="flex items-center gap-2 p-2 border border-primary/20 bg-primary/5">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="text-primary/80 text-xs"><strong>Acceptée</strong> — Demande validée. Le lien de paiement est disponible dans le tracker (commandes catalogue).</p>
              </div>
              <div className="flex items-center gap-2 p-2 border border-blue-400/20 bg-blue-400/5">
                <Printer className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <p className="text-blue-400/80 text-xs"><strong>En impression</strong> — Votre commande est en cours de fabrication sur notre imprimante 3D.</p>
              </div>
              <div className="flex items-center gap-2 p-2 border border-purple-400/20 bg-purple-400/5">
                <Truck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <p className="text-purple-400/80 text-xs"><strong>Livraison en cours</strong> — Votre colis est en route ! Vous devriez le recevoir prochainement.</p>
              </div>
              <div className="flex items-center gap-2 p-2 border border-destructive/20 bg-destructive/5">
                <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                <p className="text-destructive/80 text-xs"><strong>Refusée</strong> — La demande n'a pas pu être traitée. Contactez-nous pour plus d'infos.</p>
              </div>
            </div>
          </Section>

          {/* Couleurs et matériaux */}
          <Section icon={Palette} title="Couleurs & matériaux" delay={0.4}>
            <p>Chaque produit du catalogue affiche les couleurs disponibles. Vous pouvez sélectionner la couleur de votre choix lors de votre demande de commande.</p>
            <p>Si la couleur souhaitée n'est pas listée, mentionnez-la dans le champ "message" — nous ferons de notre mieux pour vous satisfaire !</p>
            <p>Les matériaux courants utilisés sont le <strong className="text-foreground">PLA</strong> (robuste, biodégradable) et le <strong className="text-foreground">PETG</strong> (flexible, résistant à l'humidité). Le matériau est indiqué sur chaque fiche produit.</p>
          </Section>

          {/* Quantités */}
          <Section icon={Package} title="Quantités & délais" delay={0.5}>
            <p><strong className="text-foreground">Maximum 2 unités par demande</strong> pour les produits du catalogue. Si vous avez besoin d'une quantité plus importante, utilisez le formulaire de demande personnalisée en précisant vos besoins.</p>
            <p>Le temps d'impression est indiqué sur chaque produit. En général, comptez <strong className="text-foreground">2 à 7 jours</strong> entre l'acceptation de votre demande et l'expédition/remise, selon la complexité et le volume.</p>
          </Section>

          {/* Commandes bloquées */}
          <Section icon={AlertTriangle} title="Pourquoi les demandes sont parfois bloquées ?" delay={0.6}>
            <p>Il peut arriver que les demandes de commandes soient <strong className="text-foreground">temporairement suspendues</strong>. Cela peut être dû à :</p>
            <ul className="list-none space-y-1 mt-2">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">—</span> Une forte demande en cours nécessitant de traiter les commandes existantes</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">—</span> Une maintenance ou un approvisionnement en matériaux</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">—</span> Des congés ou une période d'indisponibilité</li>
            </ul>
            <p className="mt-2">Dans ce cas, vous pouvez tout de même ajouter des produits à vos Favoris 3D pour les retrouver facilement dès la réouverture des commandes.</p>
          </Section>

          {/* Vote / Sondage */}
          <Section icon={Star} title="Voter pour le prochain produit" delay={0.65}>
            <p>La page <Link to="/vote" className="text-primary hover:underline">Vote</Link> vous permet de participer au choix du prochain produit ARAK3D en édition limitée.</p>
            <div className="space-y-2 mt-3">
              <Step num="1" text="Consultez les produits candidats avec leur aperçu 3D, leur prix estimé et leur matériau." />
              <Step num="2" text="Votez pour votre favori — un seul vote par appareil est enregistré." />
              <Step num="3" text="Le produit gagnant sera fabriqué en édition limitée, disponible uniquement pendant une période définie." />
            </div>
            <p className="mt-2">Le sondage est géré par l'administrateur qui peut l'activer, le désactiver et y ajouter des produits candidats.</p>
          </Section>

          {/* Réseaux / YouTube */}
          <Section icon={Youtube} title="Réseaux & YouTube" delay={0.7}>
            <p>La page <Link to="/reseaux" className="text-primary hover:underline">Réseaux</Link> regroupe toutes nos vidéos YouTube : présentations de produits, impressions en direct, tutoriels et Shorts.</p>
            <p>Retrouvez-nous aussi sur nos réseaux sociaux pour suivre les nouveautés et les coulisses de l'atelier ARAK3D.</p>
          </Section>

          {/* Contact */}
          <Section icon={Mail} title="Nous contacter" delay={0.75}>
            <p>Pour toute question sur une commande, un produit, ou un projet personnalisé, n'hésitez pas à nous écrire directement. Notre adresse email est disponible en bas de page dans la section "Nous contacter".</p>
            <p>Nous répondons généralement sous <strong className="text-foreground">24 à 48h</strong> (jours ouvrés).</p>
          </Section>
        </div>
      </div>

      <FooterSection />
    </div>);

}