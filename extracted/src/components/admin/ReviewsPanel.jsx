import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trash2, Star, Plus, X, Loader2, StarOff } from 'lucide-react';

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= value ? 'text-primary fill-primary' : 'text-muted-foreground/20'}`}
        />
      ))}
    </div>
  );
}

function BlockedWordsManager() {
  const queryClient = useQueryClient();
  const [newWord, setNewWord] = useState('');

  const { data: words = [] } = useQuery({
    queryKey: ['blocked-words'],
    queryFn: () => base44.entities.BlockedWord.list(),
  });

  const createMutation = useMutation({
    mutationFn: (word) => base44.entities.BlockedWord.create({ word }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['blocked-words'] }); setNewWord(''); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlockedWord.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocked-words'] }),
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    createMutation.mutate(newWord.trim().toLowerCase());
  };

  return (
    <div className="border border-border/40 bg-card/20 p-4">
      <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Mots bloqués</p>
      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          value={newWord}
          onChange={e => setNewWord(e.target.value)}
          placeholder="Ajouter un mot..."
          className="flex-1 bg-background/50 border border-input px-3 py-1.5 text-xs font-mono placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={!newWord.trim() || createMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-mono text-[10px] tracking-wider uppercase hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <Plus className="w-3 h-3" /> Ajouter
        </button>
      </form>
      {words.length === 0 ? (
        <p className="font-mono text-[10px] text-muted-foreground">Aucun mot bloqué.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {words.map(w => (
            <div key={w.id} className="flex items-center gap-1 px-2 py-0.5 border border-border/50 bg-background/30">
              <span className="font-mono text-[10px] text-muted-foreground">{w.word}</span>
              <button
                onClick={() => deleteMutation.mutate(w.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReviewsPanel() {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews-all'],
    queryFn: () => base44.entities.Review.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews-all'] }),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, is_featured }) => base44.entities.Review.update(id, { is_featured }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews-all'] }),
  });

  const featuredCount = reviews.filter(r => r.is_featured).length;

  // Group by product for stats
  const byProduct = reviews.reduce((acc, r) => {
    if (!acc[r.product_name]) acc[r.product_name] = [];
    acc[r.product_name].push(r);
    return acc;
  }, {});

  const productStats = Object.entries(byProduct)
    .map(([name, rs]) => ({
      name,
      count: rs.length,
      avg: (rs.reduce((s, r) => s + r.rating, 0) / rs.length).toFixed(1),
    }))
    .sort((a, b) => Number(b.avg) - Number(a.avg));

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Product stats */}
      {productStats.length > 0 && (
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Classement produits</p>
          <div className="space-y-2">
            {productStats.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 border border-border/40 bg-card/20 px-4 py-2.5">
                <span className="font-mono text-[10px] text-muted-foreground w-5">#{i + 1}</span>
                <span className="flex-1 font-body text-sm font-medium truncate">{p.name}</span>
                <div className="flex items-center gap-1.5">
                  <StarDisplay value={Math.round(Number(p.avg))} />
                  <span className="font-mono text-xs text-primary">{p.avg}/5</span>
                  <span className="font-mono text-[10px] text-muted-foreground">({p.count} avis)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blocked words */}
      <BlockedWordsManager />

      {/* All reviews */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase">
            Tous les avis ({reviews.length})
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            {featuredCount}/4 mis en avant sur l'accueil
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/30">
            <p className="font-mono text-xs text-muted-foreground">Aucun avis reçu.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className={`border bg-card/20 p-4 ${r.is_featured ? 'border-primary/40' : 'border-border/40'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StarDisplay value={r.rating} />
                      <span className="font-mono text-[10px] font-bold">{r.author_name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">— {r.product_name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground/50">
                        {new Date(r.created_date).toLocaleDateString('fr-CH')}
                      </span>
                      {r.is_featured && (
                        <span className="px-1.5 py-0.5 bg-primary/10 border border-primary/20 font-mono text-[9px] text-primary tracking-wider uppercase">
                          Mis en avant
                        </span>
                      )}
                    </div>
                    {r.comment && (
                      <p className="font-body text-xs text-muted-foreground italic">"{r.comment}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleFeatured.mutate({ id: r.id, is_featured: !r.is_featured })}
                      disabled={!r.is_featured && featuredCount >= 4}
                      title={r.is_featured ? "Retirer de l'accueil" : featuredCount >= 4 ? "Max 4 avis en avant" : "Mettre en avant sur l'accueil"}
                      className={`p-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        r.is_featured ? 'text-primary hover:text-muted-foreground' : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {r.is_featured ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(r.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}