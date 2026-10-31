import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, XCircle, Clock, ExternalLink, ChevronDown, ChevronUp, X, Package, Truck } from 'lucide-react';

export default function OrderCodeChecker() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [payModal, setPayModal] = useState(false);

  const check = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setProduct(null);

    const upperCode = code.trim().toUpperCase();

    // Chercher dans Order ET CustomRequest en parallèle
    const [orders, customRequests] = await Promise.all([
      base44.entities.Order.filter({ client_code: upperCode }),
      base44.entities.CustomRequest.filter({ client_code: upperCode }),
    ]);

    if (orders.length > 0) {
      const order = orders[0];
      setResult(order);
      if (order.product_id) {
        base44.entities.Product.filter({ id: order.product_id })
          .then(products => { if (products.length > 0) setProduct(products[0]); })
          .catch(() => {});
      }
    } else if (customRequests.length > 0) {
      const req = customRequests[0];
      // On adapte le format pour le réutiliser dans l'affichage
      setResult({
        ...req,
        product_name: req.subject,
        product_price: null,
        isCustomRequest: true,
      });
    } else {
      setResult('not_found');
    }
    setLoading(false);
  };

  const statusInfo = {
    pending:    { icon: Clock,        label: 'En attente',         color: 'text-amber-400',    bg: 'bg-amber-400/10 border-amber-400/20' },
    accepted:   { icon: CheckCircle,  label: 'Acceptée ✓',         color: 'text-primary',       bg: 'bg-primary/10 border-primary/20' },
    printing:   { icon: Package,      label: 'En impression 🖨️',   color: 'text-blue-400',      bg: 'bg-blue-400/10 border-blue-400/20' },
    delivering: { icon: Truck,        label: 'Livraison en cours 📦', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
    rejected:   { icon: XCircle,      label: 'Refusée',            color: 'text-destructive',   bg: 'bg-destructive/10 border-destructive/20' },
  };

  const paymentLink = product?.payment_link || null;

  return (
    <div className="border-t border-border/50 mt-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-primary/60" />
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            Suivre ma commande
          </span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
            Entrez votre code reçu par email après votre demande.
          </p>

          <div className="flex gap-2">
            <Input
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setResult(null); }}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="Ex: ARK-A1B2C3"
              className="bg-background/50 border-border font-mono text-xs tracking-widest h-9"
            />
            <button
              onClick={check}
              disabled={loading || !code.trim()}
              className="px-3 h-9 border border-primary/30 bg-primary/5 text-primary font-mono text-[10px] tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-40 shrink-0"
            >
              {loading ? '...' : 'Vérifier'}
            </button>
          </div>

          {result === 'not_found' && (
            <div className="p-3 border border-border/50 bg-muted/10">
              <p className="font-mono text-[10px] text-muted-foreground">Code introuvable. Vérifiez la saisie.</p>
            </div>
          )}

          {result && result !== 'not_found' && (() => {
            const s = statusInfo[result.status] || statusInfo.pending;
            const Icon = s.icon;
            return (
              <div className={`p-3 border ${s.bg} space-y-2`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                  <span className={`font-mono text-[10px] tracking-wider ${s.color}`}>{s.label}</span>
                </div>
                {result.isCustomRequest ? (
                  <p className="font-body text-xs"><span className="text-muted-foreground">Demande : </span>{result.product_name}</p>
                ) : (
                  <>
                    <p className="font-body text-xs"><span className="text-muted-foreground">Produit : </span>{result.product_name}</p>
                    {result.product_price != null && (
                      <p className="font-body text-xs"><span className="text-muted-foreground">Prix : </span>CHF {result.product_price?.toFixed(2)}</p>
                    )}
                  </>
                )}

                {result.status === 'accepted' && !result.isCustomRequest && (
                  <button
                    onClick={() => setPayModal(true)}
                    className="flex items-center gap-1.5 mt-2 px-3 py-2 border border-primary/30 bg-primary/5 text-primary font-mono text-[10px] tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-300 w-full justify-center"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Payer →
                  </button>
                )}
                {result.status === 'accepted' && result.isCustomRequest && (
                  <p className="font-body text-[11px] text-primary/80">Votre demande a été acceptée ! Vous serez contacté pour la suite.</p>
                )}
                {result.status === 'pending' && (
                  <p className="font-body text-[11px] text-muted-foreground">Votre demande est en cours d'examen. Revenez bientôt.</p>
                )}
                {result.status === 'printing' && (
                  <p className="font-body text-[11px] text-blue-400/80">Votre commande est en cours d'impression. Elle sera bientôt expédiée !</p>
                )}
                {result.status === 'delivering' && (
                  <p className="font-body text-[11px] text-purple-400/80">Votre commande est en route ! Vous devriez la recevoir très prochainement.</p>
                )}
                {result.status === 'rejected' && (
                  <p className="font-body text-[11px] text-muted-foreground">Malheureusement votre demande n'a pas pu être acceptée.</p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Payment modal */}
      <AnimatePresence>
        {payModal && result && result !== 'not_found' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-background/70 backdrop-blur-md"
              onClick={() => setPayModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="fixed inset-0 z-[210] flex items-center justify-center px-4"
            >
              <div className="relative w-full max-w-sm bg-card border border-border p-6 space-y-5">
                {/* Close */}
                <button
                  onClick={() => setPayModal(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Product recap */}
                <div>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-3">Récapitulatif</p>
                  <div className="flex items-center gap-3 p-3 border border-border/50 bg-background/40">
                    <Package className="w-4 h-4 text-primary/60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm truncate">{result.product_name}</p>
                      <p className="font-mono text-xs text-primary mt-0.5">CHF {result.product_price?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Livraison info */}
                <div className="flex items-start gap-3 p-3 border border-border/50 bg-background/40">
                  <Truck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-body text-xs text-foreground font-medium">Livraison par La Poste Suisse</p>
                    <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                      Les livraisons sont disponibles uniquement en Suisse. Les frais de livraison sont de <span className="text-foreground font-medium">CHF 2.00</span>.
                    </p>
                  </div>
                </div>

                {/* Pay button */}
                {paymentLink ? (
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-mono text-xs tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Payer maintenant
                  </a>
                ) : (
                  <p className="font-body text-[11px] text-primary/80 text-center">
                    Vous serez contacté pour le paiement.
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}