import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Upload, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MAX_ARTICLES = 6;

function ArticleForm({ article, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: article?.title || '',
    author: article?.author || '',
    published_at: article?.published_at
      ? new Date(article.published_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    content: article?.content || '',
    image_url: article?.image_url || '',
    image_urls: article?.image_urls || [],
    is_active: article?.is_active !== false,
    sort_order: article?.sort_order || 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);

  const uploadImage = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return file_url;
  };

  const handleMainImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    setForm(f => ({ ...f, image_url: url }));
    setUploading(false);
  };

  const handleExtraImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if ((form.image_urls || []).length >= 4) return;
    setUploadingExtra(true);
    const url = await uploadImage(file);
    setForm(f => ({ ...f, image_urls: [...(f.image_urls || []), url] }));
    setUploadingExtra(false);
  };

  const removeExtraImage = (idx) => {
    setForm(f => ({ ...f, image_urls: f.image_urls.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, published_at: new Date(form.published_at).toISOString() });
  };

  return (
    <div className="border border-border/50 bg-card/30 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[10px] tracking-wider text-primary uppercase">
          {article ? "Modifier l'article" : 'Nouvel article'}
        </p>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">Titre *</label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
            className="bg-background/50 font-body text-sm" placeholder="Titre de l'article" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">Auteur *</label>
            <Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} required
              className="bg-background/50 font-body text-sm" placeholder="Nom de l'auteur" />
          </div>
          <div>
            <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">Date de publication</label>
            <Input type="datetime-local" value={form.published_at}
              onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))}
              className="bg-background/50 font-mono text-xs" />
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-1">Contenu</label>
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            className="w-full bg-background/50 border border-input rounded-md px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[120px] resize-y"
            placeholder="Contenu de l'article..." />
        </div>

        <div>
          <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-2">Image principale</label>
          <div className="flex items-center gap-3">
            {form.image_url && (
              <img src={form.image_url} alt="" className="w-20 h-14 object-cover border border-border/50" />
            )}
            <label className={`flex items-center gap-2 px-3 py-2 border border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-border cursor-pointer transition-colors font-mono text-[10px] ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? 'Envoi...' : 'Choisir'}
              <input type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
            </label>
            {form.image_url && (
              <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase block mb-2">
            Images supplémentaires ({(form.image_urls || []).length}/4)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(form.image_urls || []).map((url, idx) => (
              <div key={idx} className="relative">
                <img src={url} alt="" className="w-16 h-12 object-cover border border-border/50" />
                <button type="button" onClick={() => removeExtraImage(idx)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            {(form.image_urls || []).length < 4 && (
              <label className={`w-16 h-12 flex items-center justify-center border border-dashed border-border/50 text-muted-foreground hover:border-border cursor-pointer transition-colors ${uploadingExtra ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploadingExtra ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleExtraImage} />
              </label>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
            className="w-3.5 h-3.5 accent-primary" />
          <span className="font-mono text-[11px] text-muted-foreground">Visible sur la page</span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="bg-primary hover:bg-primary/90 font-mono text-xs tracking-wider">
            {article ? 'Enregistrer' : "Créer l'article"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="font-mono text-xs">
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ArticlesPanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => base44.entities.Article.list('-published_at'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Article.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['articles'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Article.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['articles'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Article.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['articles'] }),
  });

  const handleSave = (data) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
          {articles.length}/{MAX_ARTICLES} articles
        </p>
        {articles.length < MAX_ARTICLES && !showForm && !editing && (
          <Button onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90 font-mono text-xs tracking-wider">
            <Plus className="w-4 h-4 mr-2" /> Nouvel article
          </Button>
        )}
      </div>

      {showForm && !editing && (
        <ArticleForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border">
          <p className="font-mono text-sm text-muted-foreground">Aucun article. Créez-en un !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(article => (
            <div key={article.id}>
              {editing?.id === article.id ? (
                <ArticleForm article={article} onSave={handleSave} onCancel={() => setEditing(null)} />
              ) : (
                <div className="border border-border/50 bg-card/20 p-4 flex items-start gap-4">
                  {article.image_url && (
                    <img src={article.image_url} alt="" className="w-16 h-12 object-cover shrink-0 border border-border/30" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 border ${article.is_active ? 'text-primary border-primary/30 bg-primary/10' : 'text-muted-foreground border-border/30'}`}>
                        {article.is_active ? 'Visible' : 'Masqué'}
                      </span>
                      <p className="font-display font-bold text-sm truncate">{article.title}</p>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {article.author} · {article.published_at ? new Date(article.published_at).toLocaleString('fr-CH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                    {article.content && (
                      <p className="font-body text-xs text-muted-foreground/70 mt-1 line-clamp-2">{article.content}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => updateMutation.mutate({ id: article.id, data: { is_active: !article.is_active } })}
                      className="text-muted-foreground hover:text-primary transition-colors" title={article.is_active ? 'Masquer' : 'Afficher'}>
                      {article.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setEditing(article)}
                      className="text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(article.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}