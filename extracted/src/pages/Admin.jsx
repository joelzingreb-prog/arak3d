import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, ArrowLeft, ShoppingBag, Package, Settings, Palette, Tag, BarChart2, Star, Gift, Lock, Youtube, Sun, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductForm from '../components/admin/ProductForm';
import ProductRow from '../components/admin/ProductRow';
import OrdersPanel from '../components/admin/OrdersPanel';
import SettingsPanel from '../components/admin/SettingsPanel';
import CustomRequestsPanel from '../components/admin/CustomRequestsPanel';
import PromotionsPanel from '../components/admin/PromotionsPanel';
import PollsPanel from '../components/admin/PollsPanel';
import ReviewsPanel from '../components/admin/ReviewsPanel';
import PacksPanel from '../components/admin/PacksPanel';
import YoutubePanel from '../components/admin/YoutubePanel';
import SeasonPanel from '../components/admin/SeasonPanel';
import ArticlesPanel from '../components/admin/ArticlesPanel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TABS = [
  { id: 'orders', label: 'Commandes', icon: ShoppingBag },
  { id: 'custom', label: 'Demandes perso.', icon: Palette },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'promotions', label: 'Promotions', icon: Tag },
  { id: 'polls', label: 'Sondages', icon: BarChart2 },
  { id: 'reviews', label: 'Avis clients', icon: Star },
  { id: 'packs', label: 'Packs produits', icon: Gift },
  { id: 'youtube', label: 'Réseaux / YouTube', icon: Youtube },
  { id: 'articles', label: 'Actualités', icon: Newspaper },
  { id: 'season', label: 'Saisons', icon: Sun },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('orders');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading'); // 'loading' | 'admin' | 'denied'
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (user?.role === 'admin') {
          setAuthStatus('admin');
        } else {
          setAuthStatus('denied');
        }
      })
      .catch(() => setAuthStatus('denied'));
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('sort_order'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeletingProduct(null);
    },
  });

  const handleSave = (data) => {
    if (editingProduct) {
      return updateMutation.mutateAsync({ id: editingProduct.id, data });
    } else {
      return createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleToggleStock = async (product, inStock) => {
    await updateMutation.mutateAsync({ id: product.id, data: { in_stock: inStock } });
  };

  if (authStatus === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (authStatus === 'denied') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-4">
        <Lock className="w-10 h-10 text-muted-foreground" />
        <p className="font-mono text-sm text-muted-foreground tracking-wider">Accès refusé</p>
        <p className="font-mono text-xs text-muted-foreground/60">Utilisez le panneau d'accès depuis l'accueil</p>
        <Link to="/" className="font-mono text-xs text-primary hover:underline">← Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 px-6 md:px-[8vw] max-w-5xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2 pt-4">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <p className="font-mono text-xs tracking-[0.3em] text-primary uppercase">
          Control Center
        </p>
      </div>

      <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mb-8">
        Panneau d'administration
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-border/50 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 font-mono text-[11px] tracking-wider uppercase transition-all duration-300 border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'orders' && (
        <OrdersPanel />
      )}

      {activeTab === 'custom' && (
        <CustomRequestsPanel />
      )}

      {activeTab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              {products.length} produit{products.length !== 1 ? 's' : ''}
            </p>
            <Button
              onClick={() => { setEditingProduct(null); setShowForm(true); }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {showForm && (
            <div className="mb-8">
              <ProductForm
                product={editingProduct}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditingProduct(null); }}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border">
              <p className="font-mono text-sm text-muted-foreground">
                Aucun produit. Cliquez sur "Ajouter" pour commencer.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={setDeletingProduct}
                  onToggleStock={handleToggleStock}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="font-mono text-2xl font-bold">{products.length}</p>
                <p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mt-1">Total</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl font-bold text-primary">
                  {products.filter(p => p.in_stock !== false).length}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mt-1">En stock</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl font-bold">
                  {products.filter(p => p.in_stock === false).length}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mt-1">Épuisés</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'promotions' && <PromotionsPanel />}

      {activeTab === 'polls' && <PollsPanel />}

      {activeTab === 'reviews' && <ReviewsPanel />}

      {activeTab === 'packs' && <PacksPanel />}

      {activeTab === 'youtube' && <YoutubePanel />}

      {activeTab === 'articles' && <ArticlesPanel />}

      {activeTab === 'season' && <SeasonPanel />}

      {activeTab === 'settings' && <SettingsPanel />}

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              "{deletingProduct?.name}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deletingProduct.id)}
              className="bg-destructive hover:bg-destructive/90 font-mono text-xs"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}