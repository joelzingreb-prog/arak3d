import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Loader2, Trash2, Edit2, Check, X, Upload, ToggleLeft, ToggleRight, Gift } from 'lucide-react';

function ImageUploader({ imageUrl, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {imageUrl ? (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img src={imageUrl} alt="" className="w-10 h-10 object-cover border border-border/40 shrink-0" />
          <span className="font-mono text-[10px] text-muted-foreground truncate flex-1">{imageUrl.split('/').pop()}</span>
          <button type="button" onClick={() => { onChange(''); inputRef.current.value = ''; }} className="p-1 text-muted-foreground hover:text-destructive">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border/50 text-muted-foreground font-mono text-[10px] tracking-wider hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {uploading ? 'Envoi...' : 'Importer une image'}
        </button>
      )}
    </div>
  );
}

const emptyPack = () => ({
  name: '',
  description: '',
  price: '',
  product_ids: [],
  product_names: [],
  image_url: '',
  image_urls: [],
  is_active: false,
  payment_link: '',
});

function PackForm({ pack: initialPack, products, onSave, onCancel }) {
  const [pack, setPack] = useState(initialPack || emptyPack());

  const toggleProduct = (product) => {
    const ids = pack.product_ids || [];
    const names = pack.product_names || [];
    if (ids.includes(product.id)) {
      setPack(p => ({
        ...p,
        product_ids: ids.filter(id => id !== product.id),
        product_names: names.filter((_, i) => ids[i] !== product.id),
      }));
    } else {
      setPack(p => ({
        ...p,
        product_ids: [...ids, product.id],
        product_names: [...names, product.name],
      }));
    }
  };

  const handleSave = () => {
    if (!pack.name.trim() || !pack.price) return;
    onSave({ ...pack, price: parseFloat(pack.price) });
  };

  const totalSeparate = (pack.product_ids || []).reduce((sum, id) => {
    const p = products.find(pr => pr.id === id);
    return sum + (p?.price || 0);
  }, 0);

  return (
    <div className="border border-border/50 bg-card/20 p-5 space-y-4 mb-6">
      <input
        value={pack.name}
        onChange={e => setPack(p => ({ ...p, name: e.target.value }))}
        placeholder="Nom du pack *"
        className="w-full bg-background/50 border border-input px-3 py-2 text-sm font-display font-bold placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <textarea
        value={pack.description}
        onChange={e => setPack(p => ({ ...p, description: e.target.value }))}
        placeholder="Description du pack"
        rows={2}
        className="w-full bg-background/50 border border-input px-3 py-2 text-sm font-body placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1">Prix du pack (CHF) *</p>
          <input
            type="number"
            step="0.01"
            value={pack.price}
            onChange={e => setPack(p => ({ ...p, price: e.target.value }))}
            placeholder="Ex: 39.90"
            className="w-full bg-background/50 border border-input px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col justify-end">
          {totalSeparate > 0 && (
            <p className="font-mono text-[10px] text-muted-foreground">
              Total séparé : <span className="text-foreground">CHF {totalSeparate.toFixed(2)}</span>
              {pack.price && parseFloat(pack.price) < totalSeparate && (
                <span className="text-primary ml-1">
                  (−{Math.round((1 - parseFloat(pack.price) / totalSeparate) * 100)}%)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-2">Produits inclus dans le pack</p>
        <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
          {products.map(product => {
            const selected = (pack.product_ids || []).includes(product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product)}
                className={`flex items-center gap-3 px-3 py-2 border text-left transition-all ${
                  selected ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/40 text-muted-foreground hover:border-primary/30'
                }`}
              >
                {product.image_url && <img src={product.image_url} alt="" className="w-7 h-7 object-cover shrink-0" />}
                <span className="font-body text-xs flex-1">{product.name}</span>
                <span className="font-mono text-[10px]">CHF {product.price?.toFixed(2)}</span>
                {selected && <Check className="w-3 h-3 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase mb-1">Image principale</p>
        <ImageUploader imageUrl={pack.image_url} onChange={url => setPack(p => ({ ...p, image_url: url }))} />
      </div>

      <input
        value={pack.payment_link}
        onChange={e => setPack(p => ({ ...p, payment_link: e.target.value }))}
        placeholder="Lien de paiement (optionnel)"
        className="w-full bg-background/50 border border-input px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />

      <button
        type="button"
        onClick={() => setPack(p => ({ ...p, is_active: !p.is_active }))}
        className={`flex items-center gap-2 px-3 py-2 border font-mono text-[10px] tracking-wider uppercase transition-all ${
          pack.is_active ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground'
        }`}
      >
        {pack.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
        {pack.is_active ? 'Pack actif (visible)' : 'Pack inactif (masqué)'}
      </button>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-[10px] tracking-wider uppercase hover:bg-primary/90 transition-colors"
        >
          <Check className="w-3 h-3" /> Sauvegarder
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border/50 text-muted-foreground font-mono text-[10px] tracking-wider uppercase hover:text-foreground transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export default function PacksPanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPack, setEditingPack] = useState(null);

  const { data: packs = [], isLoading } = useQuery({
    queryKey: ['packs'],
    queryFn: () => base44.entities.Pack.list('-created_date'),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('sort_order'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Pack.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['packs'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Pack.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['packs'] }); setEditingPack(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Pack.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packs'] }),
  });

  const handleSave = (data) => {
    if (editingPack) updateMutation.mutate({ id: editingPack.id, data });
    else createMutation.mutate(data);
  };

  const toggleActive = (pack) => updateMutation.mutate({ id: pack.id, data: { is_active: !pack.is_active } });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
          {packs.length} pack{packs.length !== 1 ? 's' : ''} — seuls les packs actifs apparaissent dans le catalogue
        </p>
        <button
          onClick={() => { setEditingPack(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-[10px] tracking-wider uppercase hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nouveau pack
        </button>
      </div>

      {showForm && !editingPack && (
        <PackForm products={products} onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      <div className="space-y-3">
        {packs.map(pack => (
          <div key={pack.id}>
            {editingPack?.id === pack.id ? (
              <PackForm pack={editingPack} products={products} onSave={handleSave} onCancel={() => setEditingPack(null)} />
            ) : (
              <div className="border border-border/50 bg-card/20 p-4 flex items-center gap-4">
                <Gift className={`w-5 h-5 shrink-0 ${pack.is_active ? 'text-primary' : 'text-muted-foreground/40'}`} />
                {pack.image_url && <img src={pack.image_url} alt={pack.name} className="w-10 h-10 object-cover border border-border/30 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm truncate">{pack.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    CHF {pack.price?.toFixed(2)} — {(pack.product_ids || []).length} produit{(pack.product_ids || []).length !== 1 ? 's' : ''}
                    {!pack.is_active && <span className="ml-2 text-amber-400">· inactif</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => toggleActive(pack)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title={pack.is_active ? 'Désactiver' : 'Activer'}>
                    {pack.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditingPack(pack)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(pack.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {packs.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border/30">
            <p className="font-mono text-sm text-muted-foreground">Aucun pack. Créez votre premier pack !</p>
          </div>
        )}
      </div>
    </div>
  );
}