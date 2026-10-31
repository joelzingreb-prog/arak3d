import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';

const SIZES = [
  { id: 'small',  label: 'Petit',  sub: '< 10 cm',  base: 15 },
  { id: 'medium', label: 'Moyen',  sub: '< 20 cm',  base: 30 },
  { id: 'large',  label: 'Grand',  sub: '> 20 cm',  base: 55 },
];
const MATERIALS = [
  { id: 'pla',  label: 'PLA',  sub: 'Déco',         mult: 1.0 },
  { id: 'petg', label: 'PETG', sub: 'Extérieur',    mult: 1.2 },
  { id: 'tpu',  label: 'TPU',  sub: 'Flexible',     mult: 1.35 },
];
const FILLS = [
  { id: 'light',    label: 'Léger',   sub: '15%',  mult: 1.0 },
  { id: 'standard', label: 'Standard',sub: '30%',  mult: 1.25 },
  { id: 'heavy',    label: 'Robuste', sub: '60%',  mult: 1.6 },
];

function Pill({ selected, onClick, label, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center px-2 py-2 border font-mono transition-all duration-150 text-center ${
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border/50 text-muted-foreground hover:border-primary/40'
      }`}
    >
      <span className="text-[10px] font-bold tracking-wider uppercase">{label}</span>
      <span className={`text-[9px] leading-tight ${selected ? 'text-primary/60' : 'text-muted-foreground/50'}`}>{sub}</span>
    </button>
  );
}

export default function PriceEstimatorWidget() {
  const [open, setOpen] = useState(false);
  const [size, setSize]         = useState(null);
  const [material, setMaterial] = useState(null);
  const [fill, setFill]         = useState(null);

  const estimate = useMemo(() => {
    if (!size || !material || !fill) return null;
    const s = SIZES.find(x => x.id === size);
    const m = MATERIALS.find(x => x.id === material);
    const f = FILLS.find(x => x.id === fill);
    const raw = s.base * m.mult * f.mult;
    return { low: Math.floor(raw), high: Math.ceil(raw * 1.25) };
  }, [size, material, fill]);

  return (
    <div className="border border-border/50 bg-card/30">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground">Estimer le prix</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
              {/* Taille */}
              <div>
                <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1.5">Taille</p>
                <div className="flex gap-1.5">
                  {SIZES.map(s => <Pill key={s.id} selected={size === s.id} onClick={() => setSize(s.id)} label={s.label} sub={s.sub} />)}
                </div>
              </div>
              {/* Matière */}
              <div>
                <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1.5">Matière</p>
                <div className="flex gap-1.5">
                  {MATERIALS.map(m => <Pill key={m.id} selected={material === m.id} onClick={() => setMaterial(m.id)} label={m.label} sub={m.sub} />)}
                </div>
              </div>
              {/* Remplissage */}
              <div>
                <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1.5">Solidité</p>
                <div className="flex gap-1.5">
                  {FILLS.map(f => <Pill key={f.id} selected={fill === f.id} onClick={() => setFill(f.id)} label={f.label} sub={f.sub} />)}
                </div>
              </div>

              {/* Résultat */}
              <AnimatePresence>
                {estimate && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between p-3 bg-primary/5 border border-primary/30"
                  >
                    <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Estimation</span>
                    <span className="font-mono font-bold text-lg text-primary">CHF {estimate.low}–{estimate.high}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="font-mono text-[9px] text-muted-foreground/50 leading-relaxed">
                Indicatif — le devis final peut varier selon la complexité du modèle.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}