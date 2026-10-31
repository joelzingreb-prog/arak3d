import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle, Minus, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ARK-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export default function OrderRequestModal({ product, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', quantity: 1, color: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [clientCode, setClientCode] = useState('');

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const isPack = !!(product?.product_ids);
  const availableColors = product?.available_colors || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const code = generateCode();

    await base44.entities.Order.create({
      product_id: product.id,
      product_name: isPack ? `[PACK] ${product.name}` : product.name,
      product_price: product.price,
      customer_name: form.name,
      customer_email: form.email,
      customer_message: [
        isPack ? `Pack : ${(product.product_names || []).join(', ')}` : '',
        form.color ? `Couleur : ${form.color}` : '',
        `Quantité : ${form.quantity}`,
        form.message ? `Message : ${form.message}` : '',
      ].filter(Boolean).join('\n'),
      status: 'pending',
      client_code: code,
    });

    const itemLabel = isPack ? `[PACK] ${product.name}` : product.name;

    // Email admin
    await base44.integrations.Core.SendEmail({
      to: 'joelzingre.b@gmail.com',
      from_name: 'ARAK3D',
      subject: `🖨️ Nouvelle demande — ${itemLabel}`,
      body: `Nouvelle demande de commande reçue sur ARAK3D.\n\n${isPack ? 'PACK' : 'PRODUIT'} : ${itemLabel}\nPRIX : CHF ${product.price?.toFixed(2)}\nQUANTITÉ : ${form.quantity}${form.color ? `\nCOULEUR : ${form.color}` : ''}${isPack ? `\nPRODUITS INCLUS : ${(product.product_names || []).join(', ')}` : ''}\n\nCLIENT : ${form.name}\nEMAIL : ${form.email}\nCODE CLIENT : ${code}${form.message ? `\nMESSAGE : ${form.message}` : ''}\n\nConnectez-vous au panneau admin pour accepter ou refuser.`,
    });

    // Email client
    await base44.integrations.Core.SendEmail({
      to: form.email,
      from_name: 'ARAK3D',
      subject: `Votre demande de commande — Code ${code}`,
      body: `Bonjour ${form.name},\n\nVotre demande pour "${itemLabel}" (CHF ${product.price?.toFixed(2)}) x${form.quantity}${form.color ? ` — Couleur : ${form.color}` : ''} a bien été reçue.\n\nVotre code client : ${code}\n\nConservez ce code précieusement. Rendez-vous dans la section "Favoris 3D" du site ARAK3D, puis "Suivre ma commande" pour vérifier le statut de votre demande avec ce code.\n\nNous vous répondons dans les meilleurs délais.\n\nL'équipe ARAK3D`,
    });

    setClientCode(code);
    setLoading(false);
    setDone(true);
    setTimeout(() => { onSuccess(); onClose(); }, 8000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative z-10 w-full max-w-md bg-card border border-border max-h-[90vh] overflow-y-auto"
        >
          {!done ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-1">
                    {isPack ? '🎁 Commande de pack' : 'Demande de commande'}
                  </p>
                  <p className="font-display font-bold text-sm">{product.name}</p>
                  <p className="font-mono text-xs text-primary mt-0.5">CHF {product.price?.toFixed(2)}</p>
                  {isPack && (product.product_names || []).length > 0 && (
                    <p className="font-mono text-[9px] text-muted-foreground mt-0.5">
                      Inclus : {(product.product_names || []).join(', ')}
                    </p>
                  )}
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Votre demande sera examinée. Vous recevrez une confirmation par email une fois acceptée.
                </p>

                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Votre nom</Label>
                  <Input required value={form.name} onChange={e => set('name', e.target.value)}
                    className="bg-background/50 border-border font-body" placeholder="Jean Dupont" />
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Votre email</Label>
                  <Input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    className="bg-background/50 border-border font-body" placeholder="jean@email.com" />
                </div>

                {/* Quantity - max 2 */}
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Quantité (max 2)</Label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => set('quantity', Math.max(1, form.quantity - 1))}
                      className="w-9 h-9 border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xl w-8 text-center">{form.quantity}</span>
                    <button
                      type="button"
                      onClick={() => set('quantity', Math.min(2, form.quantity + 1))}
                      className="w-9 h-9 border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-[10px] text-muted-foreground">unité{form.quantity > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Color — masqué pour les packs */}
                {!isPack && <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">
                    Couleur souhaitée {availableColors.length > 0 ? '' : '(optionnel)'}
                  </Label>
                  {availableColors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => set('color', c)}
                          className={`px-3 py-1.5 font-mono text-[10px] border transition-all duration-200 ${
                            form.color === c
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border/50 text-muted-foreground hover:border-primary/30'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Input
                      value={form.color}
                      onChange={e => set('color', e.target.value)}
                      className="bg-background/50 border-border font-body"
                      placeholder="Noir, blanc, rouge..."
                    />
                  )}
                </div>}

                <div className="space-y-2">
                  <Label className="font-mono text-[10px] tracking-wider">Message (optionnel)</Label>
                  <Textarea
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    className="bg-background/50 border-border font-body"
                    rows={2}
                    placeholder="Questions, précisions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || (!isPack && availableColors.length > 0 && !form.color)}
                  className="w-full py-3 bg-primary/10 border border-primary/30 text-primary font-mono text-xs tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" />Envoyer la demande</>}
                </button>
                {!isPack && availableColors.length > 0 && !form.color && (
                  <p className="font-mono text-[10px] text-amber-400 text-center">Veuillez sélectionner une couleur</p>
                )}
              </form>
            </>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
              <CheckCircle className="w-8 h-8 text-primary" />
              <p className="font-display font-bold text-lg">Demande envoyée !</p>
              <p className="font-body text-xs text-muted-foreground max-w-xs">
                Votre code client unique a été envoyé à votre adresse email.
              </p>
              {clientCode && (
                <div className="w-full border border-primary/30 bg-primary/5 p-4">
                  <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-1">Votre code client</p>
                  <p className="font-mono font-bold text-2xl text-primary tracking-[0.3em]">{clientCode}</p>
                  <p className="font-body text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    Dans "Favoris 3D" → "Suivre ma commande", entrez ce code pour voir si votre demande est acceptée et accéder au paiement.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}