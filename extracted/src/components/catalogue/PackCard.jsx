import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Send, Package } from 'lucide-react';

export default function PackCard({ pack, index, ordersBlocked, onRequestOrder }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card/40 to-card/20 backdrop-blur-sm overflow-hidden hover:border-primary/60 transition-all duration-500 flex flex-col"
    >
      {/* Ruban cadeau coin */}
      <div className="absolute top-0 right-0 z-10">
        <div className="bg-primary text-primary-foreground px-3 py-1 font-mono text-[9px] tracking-widest uppercase flex items-center gap-1">
          <Gift className="w-2.5 h-2.5" />
          Pack
        </div>
      </div>

      {/* Déco coins cadeau */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/40" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/40" />

      {/* Image */}
      <div className="aspect-square bg-muted/30 overflow-hidden relative">
        {pack.image_url ? (
          <img
            src={pack.image_url}
            alt={pack.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Gift className="w-14 h-14 text-primary/30" />
            <div className="flex flex-wrap gap-1 justify-center px-4">
              {(pack.product_names || []).slice(0, 3).map((name, i) => (
                <span key={i} className="font-mono text-[9px] bg-primary/10 text-primary px-2 py-0.5">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="font-mono text-[9px] tracking-[0.3em] text-primary uppercase mb-1">Pack exclusif</p>
        <h3 className="font-display font-bold text-base mb-2 group-hover:text-primary transition-colors duration-300">
          {pack.name}
        </h3>

        {pack.description && (
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {pack.description}
          </p>
        )}

        {/* Produits inclus */}
        {(pack.product_names || []).length > 0 && (
          <div className="mb-4">
            <p className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase mb-1.5">Inclus dans le pack :</p>
            <div className="flex flex-wrap gap-1">
              {(pack.product_names || []).map((name, i) => (
                <span key={i} className="font-mono text-[9px] bg-muted/60 text-muted-foreground px-2 py-0.5 flex items-center gap-1">
                  <Package className="w-2.5 h-2.5" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prix */}
        <div className="pt-4 border-t border-primary/20 mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-mono font-bold text-xl text-primary">
                CHF {pack.price?.toFixed(2)}
              </span>
              <p className="font-mono text-[9px] text-primary/60 tracking-wider">Prix pack — économies garanties</p>
            </div>
          </div>

          {ordersBlocked ? (
            <div className="w-full py-2.5 border border-border/50 text-muted-foreground font-mono text-[10px] tracking-[0.15em] uppercase text-center">
              Commandes suspendues
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onRequestOrder(pack); }}
              className="w-full py-2.5 border border-primary/30 bg-primary/5 text-primary font-mono text-[10px] tracking-[0.15em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Send className="w-3 h-3" />
              Commander ce pack
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}