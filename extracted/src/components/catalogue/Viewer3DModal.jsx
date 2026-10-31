import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Model3DViewer from './Model3DViewer';

export default function Viewer3DModal({ url, productName, onClose }) {
  return (
    <AnimatePresence>
      {url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8"
        >
          <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-xl bg-card border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                {/* 360 icon */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round" />
                  <path d="M22 2l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="6.5" y="14.5" fontSize="6" fontFamily="monospace" fill="currentColor" stroke="none">360</text>
                </svg>
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-primary">Vue 360°</span>
                <span className="font-mono text-[10px] text-muted-foreground">— {productName}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewer */}
            <div className="relative w-full aspect-square">
              <Model3DViewer url={url} />
              {/* Watermark ARAK3D haut */}
              <span className="absolute top-4 left-1/2 -translate-x-1/2 font-display font-extrabold text-3xl tracking-[0.3em] uppercase pointer-events-none select-none whitespace-nowrap">
                <span className="text-foreground/15">ARAK</span><span className="text-primary/60">3D</span>
              </span>
              {/* Watermark ARAK3D bas */}
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-display font-extrabold text-3xl tracking-[0.3em] uppercase pointer-events-none select-none whitespace-nowrap">
                <span className="text-foreground/15">ARAK</span><span className="text-primary/60">3D</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}