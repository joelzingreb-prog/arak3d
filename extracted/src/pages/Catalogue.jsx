import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ProductCard from '../components/catalogue/ProductCard';
import PackCard from '../components/catalogue/PackCard';
import FavoritesPanel from '../components/catalogue/FavoritesPanel';
import OrderRequestModal from '../components/catalogue/OrderRequestModal';
import ProductDetailModal from '../components/catalogue/ProductDetailModal';
import FooterSection from '../components/home/FooterSection';
import { Loader2, Gift } from 'lucide-react';
import { getFavorites } from '@/lib/favorites';

export default function Catalogue() {
  const [favPanelOpen, setFavPanelOpen] = useState(false);
  const [favorites, setFavorites] = useState(getFavorites);
  const [orderProduct, setOrderProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('sort_order'),
  });

  const { data: packs = [] } = useQuery({
    queryKey: ['packs'],
    queryFn: () => base44.entities.Pack.list('-created_date'),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  const activePacks = packs.filter(p => p.is_active);

  const ordersBlocked = settings.find(s => s.key === 'orders_blocked')?.value === 'true';

  const refreshFavorites = () => setFavorites(getFavorites());

  // Listen for favorites updates from navbar
  React.useEffect(() => {
    const handler = () => refreshFavorites();
    window.addEventListener('favorites-updated', handler);
    return () => window.removeEventListener('favorites-updated', handler);
  }, []);

  return (
    <div className="pt-24 pb-0 min-h-screen">
      <div className="px-6 md:px-[8vw] max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-4 uppercase">
            Catalogue
          </p>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight mb-4">
            Nos créations
          </h1>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed">
            Découvrez notre collection d'objets imprimés en 3D, 
            conçus et fabriqués avec soin dans la Vallée de Joux.
          </p>
          {ordersBlocked && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-amber-400/20 bg-amber-400/5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="font-mono text-[10px] text-amber-400 tracking-wider">
                Demandes de commandes temporairement suspendues — Ajoutez en Favoris 3D
              </span>
            </div>
          )}
        </motion.div>

        {/* Packs section */}
        {activePacks.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-5 h-5 text-primary" />
              <p className="font-display font-bold text-xl">Packs exclusifs</p>
              <span className="font-mono text-[10px] text-primary border border-primary/30 px-2 py-0.5">Économies garanties</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {activePacks.map((pack, index) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  index={index}
                  ordersBlocked={ordersBlocked}
                  onRequestOrder={setOrderProduct}
                />
              ))}
            </div>
          </div>
        )}

        {/* Products grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-mono text-sm text-muted-foreground tracking-wider">
              Aucun produit disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                ordersBlocked={ordersBlocked}
                onRequestOrder={setOrderProduct}
                onOpenDetail={() => setDetailProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      <FooterSection />

      {/* Favorites panel */}
      <FavoritesPanel
        isOpen={favPanelOpen}
        onClose={() => setFavPanelOpen(false)}
        favorites={favorites}
        onFavoritesChange={refreshFavorites}
        ordersBlocked={ordersBlocked}
        onRequestOrder={(p) => { setFavPanelOpen(false); setOrderProduct(p); }}
      />

      {/* Product detail modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          ordersBlocked={ordersBlocked}
          onRequestOrder={(p) => { setDetailProduct(null); setOrderProduct(p); }}
        />
      )}

      {/* Order modal */}
      {orderProduct && (
        <OrderRequestModal
          product={orderProduct}
          onClose={() => setOrderProduct(null)}
          onSuccess={() => setOrderProduct(null)}
        />
      )}
    </div>
  );
}