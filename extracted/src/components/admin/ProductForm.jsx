import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { X, Loader2, Plus, ChevronLeft, ChevronRight, Box } from 'lucide-react';

const MAX_IMAGES = 7;

export default function ProductForm({ product, onSave, onCancel }) {
  // Merge image_url + image_urls into one array
  const existingImages = (() => {
    const arr = [];
    if (product?.image_url) arr.push(product.image_url);
    if (product?.image_urls?.length) {
      product.image_urls.forEach(u => { if (u && !arr.includes(u)) arr.push(u); });
    }
    return arr;
  })();

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    material: product?.material || '',
    print_time: product?.print_time || '',
    dimensions: product?.dimensions || '',
    in_stock: product?.in_stock !== false,
    sort_order: product?.sort_order || 0,
    payment_link: product?.payment_link || '',
    available_colors: product?.available_colors || [],
    model_3d_url: product?.model_3d_url || '',
  });
  const [colorInput, setColorInput] = useState('');
  const [images, setImages] = useState(existingImages);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    const urls = await Promise.all(toUpload.map(f => base44.integrations.Core.UploadFile({ file: f }).then(r => r.file_url)));
    setImages(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviewIdx(p => Math.max(0, p >= idx ? p - 1 : p));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        price: parseFloat(form.price),
        sort_order: parseInt(form.sort_order) || 0,
        image_url: images[0] || '',
        image_urls: images.slice(1),
        available_colors: form.available_colors,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleModelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingModel(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleChange('model_3d_url', file_url);
    setUploadingModel(false);
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="border border-border bg-card/50 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-primary">
          {product ? 'Modifier le produit' : 'Nouveau produit'}
        </h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs">Nom</Label>
            <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required className="bg-background/50 border-border font-body" />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs">Prix (CHF)</Label>
            <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => handleChange('price', e.target.value)} required className="bg-background/50 border-border font-mono" />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs">Matériau</Label>
            <Input value={form.material} onChange={(e) => handleChange('material', e.target.value)} placeholder="PLA, PETG..." className="bg-background/50 border-border font-body" />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs">Temps d'impression</Label>
            <Input value={form.print_time} onChange={(e) => handleChange('print_time', e.target.value)} placeholder="~4h30" className="bg-background/50 border-border font-body" />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs">Dimensions</Label>
            <Input value={form.dimensions} onChange={(e) => handleChange('dimensions', e.target.value)} placeholder="120 x 80 x 60 mm" className="bg-background/50 border-border font-body" />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs">Ordre d'affichage</Label>
            <Input type="number" value={form.sort_order} onChange={(e) => handleChange('sort_order', e.target.value)} className="bg-background/50 border-border font-mono" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-mono text-xs">Description</Label>
          <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="bg-background/50 border-border font-body" />
        </div>

        {/* Multi-image upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-mono text-xs">Images ({images.length}/{MAX_IMAGES})</Label>
            <span className="font-mono text-[10px] text-muted-foreground">La 1ère image est l'image principale</span>
          </div>

          {/* Preview */}
          {images.length > 0 && (
            <div className="relative aspect-video bg-muted/30 border border-border overflow-hidden">
              <img src={images[previewIdx]} alt="Preview" className="w-full h-full object-contain" />
              {images.length > 1 && (
                <>
                  <button type="button" onClick={() => setPreviewIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-background/80 border border-border">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setPreviewIdx(i => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-background/80 border border-border">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((url, i) => (
                <div key={i} className={`relative w-14 h-14 border cursor-pointer overflow-hidden ${i === previewIdx ? 'border-primary' : 'border-border/50'}`}
                  onClick={() => setPreviewIdx(i)}>
                  <img src={url} alt={`img ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-destructive text-white opacity-0 hover:opacity-100 transition-opacity">
                    <X className="w-2.5 h-2.5" />
                  </button>
                  {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-primary/80 font-mono text-[8px] text-white text-center">MAIN</span>}
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {images.length < MAX_IMAGES && (
            <label className="flex items-center gap-2 px-4 py-2 border border-border/50 cursor-pointer hover:border-primary/50 transition-colors w-fit">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Plus className="w-4 h-4 text-muted-foreground" />}
              <span className="font-mono text-xs text-muted-foreground">
                {uploading ? 'Upload...' : `Ajouter image${images.length === 0 ? '' : 's'} (max ${MAX_IMAGES - images.length} restante${MAX_IMAGES - images.length > 1 ? 's' : ''})`}
              </span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <Label className="font-mono text-xs">Couleurs disponibles</Label>
          <div className="flex gap-2">
            <input
              type="text"
              value={colorInput}
              onChange={e => setColorInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const c = colorInput.trim();
                  if (c && !form.available_colors.includes(c)) {
                    handleChange('available_colors', [...form.available_colors, c]);
                  }
                  setColorInput('');
                }
              }}
              placeholder="Ex: Noir, Rouge... (Entrée pour ajouter)"
              className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => {
                const c = colorInput.trim();
                if (c && !form.available_colors.includes(c)) {
                  handleChange('available_colors', [...form.available_colors, c]);
                }
                setColorInput('');
              }}
              className="px-3 h-9 border border-border/50 font-mono text-xs hover:border-primary/50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {form.available_colors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.available_colors.map((color, i) => (
                <span key={i} className="flex items-center gap-1 font-mono text-[10px] border border-border/50 bg-muted/20 px-2 py-1">
                  {color}
                  <button type="button" onClick={() => handleChange('available_colors', form.available_colors.filter((_, j) => j !== i))}>
                    <X className="w-2.5 h-2.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3D Model upload */}
        <div className="space-y-2">
          <Label className="font-mono text-xs">Modèle 3D (GLB)</Label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border border-border/50 cursor-pointer hover:border-primary/50 transition-colors w-fit">
              {uploadingModel ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Box className="w-4 h-4 text-muted-foreground" />}
              <span className="font-mono text-xs text-muted-foreground">
                {uploadingModel ? 'Upload...' : form.model_3d_url ? 'Remplacer le modèle' : 'Importer un fichier GLB'}
              </span>
              <input type="file" accept=".glb,.gltf" onChange={handleModelUpload} className="hidden" />
            </label>
            {form.model_3d_url && (
              <div className="flex items-center gap-2">
                <Box className="w-3.5 h-3.5 text-primary" />
                <span className="font-mono text-[10px] text-primary">Modèle chargé</span>
                <button type="button" onClick={() => handleChange('model_3d_url', '')} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment link */}
        <div className="space-y-2">
          <Label className="font-mono text-xs">Lien de paiement (propre à ce produit)</Label>
          <input
            type="url"
            value={form.payment_link}
            onChange={e => handleChange('payment_link', e.target.value)}
            placeholder="https://pay.sumup.com/..."
            className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Stock toggle */}
        <div className="flex items-center gap-3 pt-2">
          <Switch checked={form.in_stock} onCheckedChange={(val) => handleChange('in_stock', val)} />
          <Label className="font-mono text-xs">En stock</Label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {product ? 'Sauvegarder' : 'Créer le produit'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="font-mono text-xs">Annuler</Button>
        </div>
      </form>
    </div>
  );
}