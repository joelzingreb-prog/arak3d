import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, GripVertical } from 'lucide-react';

export default function ProductRow({ product, onEdit, onDelete, onToggleStock }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-border/50 bg-card/30 backdrop-blur-sm hover:border-border transition-colors group">
      <GripVertical className="w-4 h-4 text-muted-foreground/30" />

      {/* Thumbnail */}
      <div className="w-12 h-12 shrink-0 bg-muted/30 border border-border/50 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 font-mono text-xs">
            —
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-sm truncate">{product.name}</p>
        <p className="font-mono text-xs text-muted-foreground">
          CHF {product.price?.toFixed(2)}
        </p>
      </div>

      {/* Stock toggle */}
      <div className="flex items-center gap-2">
        <Switch
          checked={product.in_stock !== false}
          onCheckedChange={(val) => onToggleStock(product, val)}
        />
        <span className="font-mono text-[10px] text-muted-foreground w-16">
          {product.in_stock !== false ? 'En stock' : 'Épuisé'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(product)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(product)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}