import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Clock, Maximize2, Heart, Send } from 'lucide-react';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/favorites';
import ImageLightbox from './ImageLightbox';
import ImageCarousel from './ImageCarousel';
import Viewer3DModal from './Viewer3DModal';
import ReviewSection from './ReviewSection';

export default function ProductDetailModal({ product, onClose, ordersBlocked, onRequestOrder }) {
  const [fav, setFav] = useState(() => isFavorite(product.id));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [viewer3DOpen, setViewer3DOpen] = useState(false);
  const allImages = [product.image_url, ...(product.image_urls || [])].filter(Boolean);
  const has3D = !!product.model_3d_url;

  const toggleFav = () => {
    if (fav) removeFavorite(product.id);
    else addFavorite(product);
    setFav(!fav);
    window.dispatchEvent(new Event('favorites-updated'));
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8"
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-3xl bg-card border border-border overflow-hidden max-h-[90vh] flex flex-col md:flex-row"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-background/60 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image panel */}
            <div className="relative md:w-1/2 shrink-0">
              <div className="aspect-square md:aspect-auto md:h-full bg-muted/30 overflow-hidden">
                {allImages.length > 0 ? (
                  <ImageCarousel
                    images={allImages}
                    alt={product.name}
                    onZoom={(idx) => { setLightboxIdx(idx); setLightboxOpen(true); }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layers className="w-16 h-16 text-muted-foreground/10" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-8">
              <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-3">
                Produit
              </p>
              <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mb-4">
                {product.name}
              </h2>

              {product.description && (
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              {/* Specs */}
              <div className="space-y-2 mb-6">
                {product.material && (
                  <div className="flex items-center gap-3 py-2 border-b border-border/30">
                    <Layers className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase w-20">Matériau</span>
                    <span className="font-body text-sm">{product.material}</span>
                  </div>
                )}
                {product.print_time && (
                  <div className="flex items-center gap-3 py-2 border-b border-border/30">
                    <Clock className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase w-20">Impression</span>
                    <span className="font-body text-sm">{product.print_time}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex items-center gap-3 py-2 border-b border-border/30">
                    <Maximize2 className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase w-20">Dimensions</span>
                    <span className="font-body text-sm">{product.dimensions}</span>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <ReviewSection product={product} />

              {/* Price */}
              <div className="mt-auto pt-6 border-t border-border/50">
                <p className="font-mono font-bold text-3xl mb-4">
                  CHF <span className="text-primary">{product.price?.toFixed(2)}</span>
                </p>

                {/* Bouton 360° — affiché seulement si modèle 3D disponible */}
                {has3D && (
                  <button
                    onClick={() => setViewer3DOpen(true)}
                    className="w-full mb-3 py-2.5 border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {/* Icône 360° flèche circulaire */}
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Visualiser en 360°
                  </button>
                )}

                {ordersBlocked ? (
                  <div className="space-y-2">
                    <div className="p-3 border border-amber-400/20 bg-amber-400/5">
                      <p className="font-mono text-[10px] text-amber-400 tracking-wider">
                        Demandes temporairement suspendues
                      </p>
                    </div>
                    <button
                      onClick={toggleFav}
                      className={`w-full py-3 border font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                        fav ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-current' : ''}`} />
                      {fav ? 'Dans vos Favoris 3D' : 'Ajouter aux Favoris 3D'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={toggleFav}
                      className={`p-3 border transition-all duration-300 ${
                        fav ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => { onClose(); onRequestOrder(product); }}
                      className="flex-1 py-3 border border-primary/30 bg-primary/5 text-primary font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Demande de commande
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {lightboxOpen && allImages[lightboxIdx] && (
        <ImageLightbox
          src={allImages[lightboxIdx]}
          alt={product.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {viewer3DOpen && (
        <Viewer3DModal
          url={product.model_3d_url}
          productName={product.name}
          onClose={() => setViewer3DOpen(false)}
        />
      )}
    </>
  );
}