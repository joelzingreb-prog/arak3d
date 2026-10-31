import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tag, Loader2, Check, X, Clock } from 'lucide-react';

const PROMO_PRESETS = [
  { label: '-10%', value: '-10%' },
  { label: '-20%', value: '-20%' },
  { label: '-30%', value: '-30%' },
  { label: '-40%', value: '-40%' },
  { label: '-50%', value: '-50%' },
  { label: '1 acheté = 1 offert', value: '1+1 offert' },
  { label: '2 achetés = 1 offert', value: '2+1 offert' },
  { label: 'Soldes', value: 'Soldes' },
];

function getBadgeStatus(product) {
  if (product.badge_type === 'new') return 'new';
  if (product.badge_type === 'promo') {
    const now = new Date();
    const start = product.promo_start ? new Date(product.promo_start) : null;
    const end = product.promo_end ? new Date(product.promo_end) : null;
    if (start && now < start) return 'scheduled';
    if (end && now > end) return 'expired';
    return 'active';
  }
  return 'none';
}

const STATUS_STYLE = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  active: 'bg-primary/10 text-primary border-primary/30',
  scheduled: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  expired: 'bg-muted text-muted-foreground border-border/50',
  none: 'bg-muted text-muted-foreground border-border/50',
};

const STATUS_LABEL = {
  new: 'NEW actif',
  active: 'Promo active',
  scheduled: 'Planifiée',
  expired: 'Expirée',
  none: 'Aucun badge',
};

export default function PromotionsPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('sort_order'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingId(null);
    },
  });

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      badge_type: product.badge_type || 'none',
      promo_label: product.promo_label || '',
      promo_start: product.promo_start ? product.promo_start.slice(0, 16) : '',
      promo_end: product.promo_end ? product.promo_end.slice(0, 16) : '',
    });
  };

  const handleSave = (productId) => {
    const data = {
      badge_type: form.badge_type,
      promo_label: form.badge_type === 'promo' ? form.promo_label : '',
      promo_start: form.badge_type === 'promo' && form.promo_start ? new Date(form.promo_start).toISOString() : null,
      promo_end: form.badge_type === 'promo' && form.promo_end ? new Date(form.promo_end).toISOString() : null,
    };
    updateMutation.mutate({ id: productId, data });
  };

  const handleRemoveBadge = (product) => {
    updateMutation.mutate({ id: product.id, data: { badge_type: 'none', promo_label: '', promo_start: null, promo_end: null } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mb-6">
        {products.length} produit{products.length !== 1 ? 's' : ''} — Cliquez sur un produit pour gérer son badge
      </p>

      {products.map((product) => {
        const status = getBadgeStatus(product);
        const isEditing = editingId === product.id;

        return (
          <div key={product.id} className="border border-border/50 bg-card/30 overflow-hidden">
            {/* Row */}
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/10 transition-colors"
              onClick={() => isEditing ? setEditingId(null) : startEdit(product)}
            >
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover border border-border/30 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body font-medium text-sm truncate">{product.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">CHF {product.price?.toFixed(2)}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[10px] tracking-wider ${STATUS_STYLE[status]}`}>
                {status === 'active' || status === 'new' ? <Tag className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {status === 'active' && product.promo_label ? product.promo_label : STATUS_LABEL[status]}
              </div>
              {(product.badge_type && product.badge_type !== 'none') && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveBadge(product); }}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  title="Supprimer le badge"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Edit panel */}
            {isEditing && (
              <div className="border-t border-border/50 p-4 bg-muted/5 space-y-4">
                {/* Badge type */}
                <div>
                  <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mb-2">Type de badge</p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'none', label: 'Aucun' },
                      { value: 'new', label: '✦ NEW' },
                      { value: 'promo', label: '% PROMO' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setForm(f => ({ ...f, badge_type: opt.value }))}
                        className={`px-3 py-1.5 border font-mono text-[10px] tracking-wider transition-all ${
                          form.badge_type === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/50 text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promo options */}
                {form.badge_type === 'promo' && (
                  <>
                    <div>
                      <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mb-2">Libellé de la promotion</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {PROMO_PRESETS.map(p => (
                          <button
                            key={p.value}
                            onClick={() => setForm(f => ({ ...f, promo_label: p.value }))}
                            className={`px-3 py-1.5 border font-mono text-[10px] tracking-wider transition-all ${
                              form.promo_label === p.value
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border/50 text-muted-foreground hover:border-primary/30'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={form.promo_label}
                        onChange={e => setForm(f => ({ ...f, promo_label: e.target.value }))}
                        placeholder="Ou saisir un libellé personnalisé..."
                        className="flex h-9 w-full border border-input bg-background/50 px-3 py-1 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mb-2">Début (optionnel)</p>
                        <input
                          type="datetime-local"
                          value={form.promo_start}
                          onChange={e => setForm(f => ({ ...f, promo_start: e.target.value }))}
                          className="flex h-9 w-full border border-input bg-background/50 px-3 py-1 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mb-2">Fin (optionnel)</p>
                        <input
                          type="datetime-local"
                          value={form.promo_end}
                          onChange={e => setForm(f => ({ ...f, promo_end: e.target.value }))}
                          className="flex h-9 w-full border border-input bg-background/50 px-3 py-1 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleSave(product.id)}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-[10px] tracking-wider uppercase hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 border border-border/50 text-muted-foreground font-mono text-[10px] tracking-wider uppercase hover:text-foreground transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}