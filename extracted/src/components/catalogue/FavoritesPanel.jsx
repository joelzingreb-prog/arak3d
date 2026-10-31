import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Trash2 } from 'lucide-react';
import { removeFavorite } from '@/lib/favorites';
import OrderCodeChecker from './OrderCodeChecker';


export default function FavoritesPanel({ isOpen, onClose, favorites, onFavoritesChange, ordersBlocked, onRequestOrder }) {

  const handleRemove = (productId) => {
    removeFavorite(productId);
    onFavoritesChange();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-sm bg-card border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-display font-bold text-sm">Favoris 3D</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {favorites.length} modèle{favorites.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <Heart className="w-10 h-10 text-muted-foreground/20" />
                  <p className="font-mono text-xs text-muted-foreground tracking-wider">
                    Aucun favori pour l'instant.
                  </p>
                  <p className="font-body text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                    Ajoutez des modèles depuis le catalogue pour les retrouver ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favorites.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 border border-border/50 bg-background/30 group"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 shrink-0 bg-muted/30 border border-border/50 overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono text-xs text-muted-foreground/20">—</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-xs truncate">{product.name}</p>
                        <p className="font-mono text-xs text-primary mt-0.5">CHF {product.price?.toFixed(2)}</p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order code checker */}
            <OrderCodeChecker />

            {/* Footer */}
            {favorites.length > 0 && (
              <div className="p-4 border-t border-border space-y-3">
                {ordersBlocked ? (
                  <div className="text-center py-3 border border-border/50 bg-muted/20">
                    <p className="font-mono text-[10px] text-muted-foreground tracking-wider">
                      Demandes temporairement suspendues
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {favorites.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => onRequestOrder(product)}
                        className="w-full py-2.5 border border-primary/30 bg-primary/5 text-primary font-mono text-[10px] tracking-[0.15em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      >
                        Demander → {product.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}