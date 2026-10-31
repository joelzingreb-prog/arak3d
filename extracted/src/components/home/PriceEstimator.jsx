import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SIZES = [
  { id: 'small',  label: 'Petit',  sub: 'jusqu\'à 10 cm', base: 15 },
  { id: 'medium', label: 'Moyen',  sub: 'jusqu\'à 20 cm', base: 30 },
  { id: 'large',  label: 'Grand',  sub: 'plus de 20 cm',  base: 55 },
];

const MATERIALS = [
  { id: 'pla',  label: 'PLA',  sub: 'Idéal pour la déco',        mult: 1.0 },
  { id: 'petg', label: 'PETG', sub: 'Résistant à l\'extérieur',  mult: 1.2 },
  { id: 'tpu',  label: 'TPU',  sub: 'Flexible & souple',         mult: 1.35 },
];

const FILLS = [
  { id: 'light',   label: 'Décoratif',    sub: 'Léger / 15 % remplissage',    mult: 1.0 },
  { id: 'standard',label: 'Standard',     sub: 'Quotidien / 30 % remplissage', mult: 1.25 },
  { id: 'heavy',   label: 'Ultra-Robuste',sub: 'Mécanique / 60 % remplissage', mult: 1.6 },
];

function OptionButton({ selected, onClick, label, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-w-[100px] flex flex-col items-center gap-1 px-3 py-3 border font-mono transition-all duration-200 text-center ${
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
      }`}
    >
      <span className="text-[12px] font-bold tracking-wider uppercase">{label}</span>
      <span className={`text-[10px] leading-tight ${selected ? 'text-primary/70' : 'text-muted-foreground/70'}`}>{sub}</span>
    </button>
  );
}

function generateCode() {
  return 'DEV-' + Math.random().toString(36).toUpperCase().slice(2, 8);
}

export default function PriceEstimator() {
  const [size, setSize]         = useState(null);
  const [material, setMaterial] = useState(null);
  const [fill, setFill]         = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [clientCode, setClientCode] = useState('');

  const estimate = useMemo(() => {
    if (!size || !material || !fill) return null;
    const s = SIZES.find(x => x.id === size);
    const m = MATERIALS.find(x => x.id === material);
    const f = FILLS.find(x => x.id === fill);
    const raw = s.base * m.mult * f.mult;
    const low  = Math.floor(raw);
    const high = Math.ceil(raw * 1.25);
    return { low, high };
  }, [size, material, fill]);

  const canSubmit = size && material && fill && description.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    const code = generateCode();
    const s = SIZES.find(x => x.id === size);
    const m = MATERIALS.find(x => x.id === material);
    const f = FILLS.find(x => x.id === fill);

    await base44.entities.CustomRequest.create({
      customer_name: 'Non renseigné',
      customer_email: 'non-renseigne@devis.ch',
      subject: `Devis personnalisé — ${s.label} / ${m.label} / ${f.label}`,
      description: `Taille: ${s.label} (${s.sub})\nMatière: ${m.label} (${m.sub})\nRemplissage: ${f.label} (${f.sub})\nEstimation: CHF ${estimate.low}–${estimate.high}\n\n${description}`,
      dimensions: s.sub,
      material: m.label,
      quantity: 1,
      budget: `CHF ${estimate.low}–${estimate.high}`,
      client_code: code,
      status: 'pending',
    });

    setClientCode(code);
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <section className="py-20 px-6 md:px-[8vw]">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-primary/30 bg-primary/5 p-10 text-center"
          >
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
            <p className="font-display font-extrabold text-xl mb-2">Demande envoyée !</p>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Votre demande de devis a bien été transmise. Nous vous contacterons rapidement.
            </p>
            <div className="inline-block px-4 py-2 bg-muted border border-border font-mono text-sm tracking-widest text-primary">
              {clientCode}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground mt-2 tracking-wider">
              Conservez ce code pour suivre votre demande
            </p>
            <button
              onClick={() => { setSent(false); setSize(null); setMaterial(null); setFill(null); setDescription(''); }}
              className="mt-6 px-4 py-2 border border-border/50 text-muted-foreground font-mono text-[10px] tracking-wider uppercase hover:text-foreground transition-colors"
            >
              Nouvelle demande
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 md:px-[8vw] border-t border-border/30">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <p className="font-mono text-[10px] tracking-[0.35em] text-primary uppercase mb-3">
          Estimation de prix
        </p>
        <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mb-2">
          Personnalisation d'objets 3D
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-10 leading-relaxed">
          Configurez votre projet en quelques clics — obtenez une fourchette de prix instantanée.
        </p>

        <div className="space-y-8">
          {/* Taille */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-3">
              1 — Taille de l'objet
            </p>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map(s => (
                <OptionButton key={s.id} selected={size === s.id} onClick={() => setSize(s.id)} label={s.label} sub={s.sub} />
              ))}
            </div>
          </div>

          {/* Matière */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-3">
              2 — Type de plastique / Matière
            </p>
            <div className="flex gap-2 flex-wrap">
              {MATERIALS.map(m => (
                <OptionButton key={m.id} selected={material === m.id} onClick={() => setMaterial(m.id)} label={m.label} sub={m.sub} />
              ))}
            </div>
          </div>

          {/* Remplissage */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-3">
              3 — Niveau de solidité / Remplissage
            </p>
            <div className="flex gap-2 flex-wrap">
              {FILLS.map(f => (
                <OptionButton key={f.id} selected={fill === f.id} onClick={() => setFill(f.id)} label={f.label} sub={f.sub} />
              ))}
            </div>
          </div>

          {/* Estimation temps réel */}
          <AnimatePresence>
            {estimate && (
              <motion.div
                key="estimate"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center justify-between p-4 border border-primary/40 bg-primary/5"
              >
                <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  Estimation indicative
                </p>
                <p className="font-mono font-bold text-2xl text-primary">
                  CHF {estimate.low} – {estimate.high}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-3">
              4 — Décrivez votre projet
            </p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez votre objet, ses dimensions précises, sa couleur souhaitée... Ou collez un lien vers votre fichier 3D (STL, OBJ, etc.)"
              rows={4}
              className="w-full bg-background/50 border border-input px-3 py-2.5 text-sm font-body placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="w-full py-3.5 border border-primary/40 bg-primary/10 text-primary font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Envoyer ma demande de devis personnalisé
          </button>
        </div>
      </div>
    </section>
  );
}