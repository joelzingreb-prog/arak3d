import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function ImageCarousel({ images, alt, onZoom }) {
  const [idx, setIdx] = useState(0);
  const total = images.length;

  if (total === 0) return null;

  const prev = (e) => { e?.stopPropagation(); setIdx(i => (i - 1 + total) % total); };
  const next = (e) => { e?.stopPropagation(); setIdx(i => (i + 1) % total); };

  return (
    <div className="relative w-full h-full">
      <img
        src={images[idx]}
        alt={`${alt} ${idx + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Nav arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-background/70 backdrop-blur-sm border border-border/50 text-foreground hover:border-primary/50 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-background/70 backdrop-blur-sm border border-border/50 text-foreground hover:border-primary/50 transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-primary w-3' : 'bg-foreground/30'}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Zoom */}
      {onZoom && (
        <button
          onClick={(e) => { e.stopPropagation(); onZoom(idx); }}
          className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-background/70 backdrop-blur-sm border border-border/50 font-mono text-[9px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
        >
          <ZoomIn className="w-3 h-3" />
          Agrandir
        </button>
      )}
    </div>
  );
}