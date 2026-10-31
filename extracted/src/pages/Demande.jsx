import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import FooterSection from '../components/home/FooterSection';
import PriceEstimatorWidget from '../components/demande/PriceEstimatorWidget';

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ARK-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export default function Demande() {
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    dimensions: '',
    material: '',
    color: '',
    quantity: 1,
    budget: '',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [clientCode, setClientCode] = useState('');

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const code = generateCode();

    await base44.entities.CustomRequest.create({
      ...form,
      quantity: parseInt(form.quantity) || 1,
      status: 'pending',
      client_code: code,
    });

    // Emails envoyés en arrière-plan — non bloquants
    base44.integrations.Core.SendEmail({
      to: 'joelzingre.b@gmail.com',
      from_name: 'ARAK3D',
      subject: `🎨 Nouvelle demande personnalisée — ${form.subject}`,
      body: `Nouvelle demande personnalisée reçue sur ARAK3D.\n\nSUJET : ${form.subject}\nCLIENT : ${form.customer_name}\nEMAIL : ${form.customer_email}\nCODE : ${code}\n\nDESCRIPTION :\n${form.description}${form.dimensions ? `\n\nDIMENSIONS : ${form.dimensions}` : ''}${form.material ? `\nMATÉRIAU : ${form.material}` : ''}${form.color ? `\nCOULEUR : ${form.color}` : ''}${form.quantity ? `\nQUANTITÉ : ${form.quantity}` : ''}${form.budget ? `\nBUDGET : ${form.budget}` : ''}\n\nConnectez-vous au panneau admin pour accepter ou refuser.`,
    }).catch(() => {});

    base44.integrations.Core.SendEmail({
      to: form.customer_email,
      from_name: 'ARAK3D',
      subject: `Votre demande personnalisée — Code ${code}`,
      body: `Bonjour ${form.customer_name},\n\nVotre demande personnalisée "${form.subject}" a bien été reçue.\n\nVotre code client : ${code}\n\nConservez ce code précieusement. Rendez-vous dans la section "Favoris 3D" du site ARAK3D, puis "Suivre ma commande" pour vérifier le statut de votre demande.\n\nNous vous répondons dans les meilleurs délais.\n\nL'équipe ARAK3D`,
    }).catch(() => {});

    setClientCode(code);
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="pt-24 pb-0 min-h-screen">
      <div className="px-6 md:px-[8vw] max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 min-w-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-4 uppercase">Demande</p>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight mb-4">
            Commande personnalisée
          </h1>
          <p className="font-body text-muted-foreground text-base leading-relaxed">
            Vous avez un projet unique ? Décrivez-le en détail et nous vous répondrons pour étudier la faisabilité et établir un devis.
          </p>
        </motion.div>

        {!done ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6 mb-24 border border-border/50 bg-card/20 p-6 md:p-8"
          >
            {/* Identité */}
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-4">Vos informations</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Votre nom *</Label>
                  <Input
                    required
                    value={form.customer_name}
                    onChange={e => set('customer_name', e.target.value)}
                    className="bg-background/50 border-border font-body"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Votre email *</Label>
                  <Input
                    required
                    type="email"
                    value={form.customer_email}
                    onChange={e => set('customer_email', e.target.value)}
                    className="bg-background/50 border-border font-body"
                    placeholder="jean@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Projet */}
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-4">Votre projet</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Sujet / titre *</Label>
                  <Input
                    required
                    value={form.subject}
                    onChange={e => set('subject', e.target.value)}
                    className="bg-background/50 border-border font-body"
                    placeholder="Ex: Figurine personnalisée, boîtier électronique..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Description détaillée *</Label>
                  <Textarea
                    required
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    className="bg-background/50 border-border font-body"
                    rows={5}
                    placeholder="Décrivez votre projet en détail : forme, usage, contraintes particulières, fichier 3D disponible ou non..."
                  />
                </div>
              </div>
            </div>

            {/* Spécifications */}
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-4">Spécifications</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Dimensions souhaitées</Label>
                  <Input
                    value={form.dimensions}
                    onChange={e => set('dimensions', e.target.value)}
                    className="bg-background/50 border-border font-body"
                    placeholder="Ex: 10 x 5 x 3 cm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Matériau souhaité</Label>
                  <Input
                    value={form.material}
                    onChange={e => set('material', e.target.value)}
                    className="bg-background/50 border-border font-body"
                    placeholder="PLA, PETG, flexible..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Couleur souhaitée</Label>
                  <Input
                    value={form.color}
                    onChange={e => set('color', e.target.value)}
                    className="bg-background/50 border-border font-body"
                    placeholder="Noir, blanc, rouge..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Quantité</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={e => set('quantity', e.target.value)}
                    className="bg-background/50 border-border font-mono"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="font-mono text-[10px] tracking-wider">Budget approximatif</Label>
                  <Input
                    value={form.budget}
                    onChange={e => set('budget', e.target.value)}
                    className="bg-background/50 border-border font-body"
                    placeholder="Ex: CHF 20-50, moins de CHF 100..."
                  />
                </div>
              </div>
            </div>

            <p className="font-body text-xs text-muted-foreground">
              * Champs obligatoires. Vous recevrez un email de confirmation avec votre code de suivi.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary/10 border border-primary/30 text-primary font-mono text-xs tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Envoyer ma demande
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-24 border border-primary/30 bg-primary/5 p-8 text-center"
          >
            <CheckCircle className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl mb-2">Demande envoyée !</h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Votre code client unique a été envoyé à votre adresse email.
            </p>
            {clientCode && (
              <div className="border border-primary/30 bg-background/50 p-6 inline-block">
                <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2">Votre code client</p>
                <p className="font-mono font-bold text-3xl text-primary tracking-[0.3em]">{clientCode}</p>
                <p className="font-body text-[11px] text-muted-foreground mt-3 leading-relaxed max-w-xs">
                  Dans "Favoris 3D" → "Suivre ma commande", entrez ce code pour voir si votre demande est acceptée.
                </p>
              </div>
            )}
          </motion.div>
        )}
        </div>
        {/* Widget estimateur — colonne droite */}
        <div className="lg:w-72 shrink-0 space-y-3 lg:sticky lg:top-24">
          <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase">Outil de calcul</p>
          <PriceEstimatorWidget />
          <p className="font-body text-xs text-muted-foreground leading-relaxed">
            Utilisez cet outil pour estimer le coût de votre projet avant d'envoyer votre demande.
          </p>
        </div>
        </div>
      </div>
      <FooterSection />
    </div>
  );
}