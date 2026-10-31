import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Clock, Maximize2, Heart, Send } from 'lucide-react';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/favorites';
import ImageCarousel from './ImageCarousel';

function getActiveBadge(product) {
  if (product.badge_type === 'new') return { type: 'new', label: 'NEW' };
  if (product.badge_type === 'promo') {
    const now = new Date();
    const start = product.promo_start ? new Date(product.promo_start) : null;
    const end = product.promo_end ? new Date(product.promo_end) : null;
    if (start && now < start) return null;
    if (end && now > end) return null;
    return { type: 'promo', label: product.promo_label || 'PROMO' };
  }
  return null;
}

export default function ProductCard({ product, index, ordersBlocked, onRequestOrder, onOpenDetail }) {
  const [fav, setFav] = useState(() => isFavorite(product.id));

  const toggleFav = (e) => {
    e && e.stopPropagation();
    if (fav) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
    setFav(!fav);
    window.dispatchEvent(new Event('favorites-updated'));
  };

  const badge = getActiveBadge(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      onClick={onOpenDetail}
      className="group relative border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-500 flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="aspect-square bg-muted/30 overflow-hidden relative">
        {(() => {
          const imgs = [product.image_url, ...(product.image_urls || [])].filter(Boolean);
          return imgs.length > 0 ? (
            <ImageCarousel images={imgs} alt={product.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Layers className="w-12 h-12 text-muted-foreground/20" />
            </div>
          );
        })()}

        {/* Badge coin haut gauche */}
        {badge && (
          <div className={`absolute top-0 left-0 z-10 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase ${
            badge.type === 'new'
              ? 'bg-blue-500 text-white'
              : 'bg-primary text-primary-foreground'
          }`}>
            {badge.label}
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={toggleFav}
          className={`absolute top-3 right-3 p-2 backdrop-blur-sm border transition-all duration-300 ${
            fav
              ? 'bg-primary border-primary text-primary-foreground'
              : 'bg-background/60 border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary'
          }`}
          aria-label="Ajouter aux Favoris 3D"
        >
          <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Data block */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-base mb-2 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>

        {product.description && (
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-1.5 mb-4">
          {product.material && (
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3 text-primary/60" />
              <span className="font-mono text-[11px] text-muted-foreground tracking-wider">{product.material}</span>
            </div>
          )}
          {product.print_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-primary/60" />
              <span className="font-mono text-[11px] text-muted-foreground tracking-wider">{product.print_time}</span>
            </div>
          )}
          {product.dimensions && (
            <div className="flex items-center gap-2">
              <Maximize2 className="w-3 h-3 text-primary/60" />
              <span className="font-mono text-[11px] text-muted-foreground tracking-wider">{product.dimensions}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-4 border-t border-border/50 mt-auto">
          <div className="flex items-center justify-between mb-3">
            {(() => {
              const discountMatch = badge?.type === 'promo' && badge.label?.match(/^-(\d+)%$/);
              if (discountMatch) {
                const pct = parseInt(discountMatch[1], 10);
                const discounted = product.price * (1 - pct / 100);
                return (
                  <div>
                    <span className="font-mono text-sm text-muted-foreground line-through mr-2">
                      CHF {product.price?.toFixed(2)}
                    </span>
                    <span className="font-mono font-bold text-lg text-primary">
                      CHF {discounted.toFixed(2)}
                    </span>
                  </div>
                );
              }
              return (
                <span className="font-mono font-bold text-lg text-foreground">
                  CHF {product.price?.toFixed(2)}
                </span>
              );
            })()}
          </div>

          {/* CTA */}
          {ordersBlocked ? (
            <button
              onClick={toggleFav}
              className={`w-full py-2.5 border font-mono text-[10px] tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                fav
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary'
              }`}
            >
              <Heart className={`w-3 h-3 ${fav ? 'fill-current' : ''}`} />
              {fav ? 'Dans vos Favoris 3D' : 'Ajouter aux Favoris 3D'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={toggleFav}
                className={`p-2.5 border transition-all duration-300 ${
                  fav
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary'
                }`}
                aria-label="Favoris 3D"
              >
                <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRequestOrder(product); }}
                className="flex-1 py-2.5 border border-primary/30 bg-primary/5 text-primary font-mono text-[10px] tracking-[0.15em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Send className="w-3 h-3" />
                Demande de commande
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}