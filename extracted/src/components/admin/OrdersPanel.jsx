import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, TrendingUp, CheckCircle, XCircle, Printer, Truck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ALL_STATUSES = [
  { key: 'pending',    label: 'En attente',         color: 'text-amber-400',    border: 'border-amber-400/40',    activeBg: 'bg-amber-400/15' },
  { key: 'accepted',   label: 'Acceptée',            color: 'text-primary',       border: 'border-primary/40',       activeBg: 'bg-primary/15' },
  { key: 'printing',   label: 'En impression',       color: 'text-blue-400',      border: 'border-blue-400/40',      activeBg: 'bg-blue-400/15' },
  { key: 'delivering', label: 'Livraison en cours',  color: 'text-purple-400',    border: 'border-purple-400/40',    activeBg: 'bg-purple-400/15' },
  { key: 'rejected',   label: 'Refusée',             color: 'text-destructive',   border: 'border-destructive/40',   activeBg: 'bg-destructive/15' },
];

function StatusSelector({ currentStatus, onUpdate, itemId }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {ALL_STATUSES.map(s => {
        const isActive = currentStatus === s.key;
        return (
          <button
            key={s.key}
            onClick={() => !isActive && onUpdate(itemId, s.key)}
            className={`font-mono text-[10px] px-2.5 py-1 border rounded-sm transition-all duration-200 ${
              isActive
                ? `${s.color} ${s.border} ${s.activeBg} font-bold`
                : 'text-muted-foreground border-border/30 hover:border-border hover:text-foreground'
            }`}
          >
            {isActive && <Check className="inline w-2.5 h-2.5 mr-1" />}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function todayCount(orders) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return orders.filter(o => new Date(o.created_date) >= today).length;
}

function getLast7Days(orders) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const label = d.toLocaleDateString('fr-CH', { weekday: 'short' });
    const count = orders.filter(o => {
      const cd = new Date(o.created_date);
      return cd >= d && cd < next;
    }).length;
    days.push({ label, count });
  }
  return days;
}

const STATUS = {
  pending:    { text: 'En attente',         color: 'text-amber-400',    bg: 'bg-amber-400/10 border-amber-400/20' },
  accepted:   { text: 'Acceptée',           color: 'text-primary',       bg: 'bg-primary/10 border-primary/20' },
  printing:   { text: 'En impression',      color: 'text-blue-400',      bg: 'bg-blue-400/10 border-blue-400/20' },
  delivering: { text: 'Livraison en cours', color: 'text-purple-400',    bg: 'bg-purple-400/10 border-purple-400/20' },
  rejected:   { text: 'Refusée',            color: 'text-destructive',   bg: 'bg-destructive/10 border-destructive/20' },
};

export default function OrdersPanel() {
  const queryClient = useQueryClient();
  const [liveCount, setLiveCount] = useState(null);

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    refetchInterval: 10000,
  });

  useEffect(() => {
    const unsub = base44.entities.Order.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (event.type === 'create') setLiveCount(prev => (prev !== null ? prev + 1 : null));
    });
    return unsub;
  }, [queryClient]);

  const today = todayCount(orders);
  const chart = getLast7Days(orders);
  const maxVal = Math.max(...chart.map(d => d.count), 1);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  return (
    <div className="space-y-8">
      {/* Live Counter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border/50 bg-card/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Aujourd'hui</p>
          </div>
          <motion.p key={today} initial={{ scale: 1.3, color: '#FF4D00' }} animate={{ scale: 1, color: 'hsl(var(--foreground))' }} transition={{ duration: 0.4 }} className="font-display font-extrabold text-5xl">
            {today}
          </motion.p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">demande{today !== 1 ? 's' : ''} reçue{today !== 1 ? 's' : ''}</p>
        </div>
        <div className="border border-border/50 bg-card/30 p-6">
          <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mb-4">7 derniers jours</p>
          <div className="flex items-end gap-2 h-16">
            {chart.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/20 rounded-sm transition-all duration-500" style={{ height: `${(day.count / maxVal) * 48}px`, minHeight: day.count > 0 ? '4px' : '2px' }}>
                  <div className="w-full bg-primary rounded-sm" style={{ height: i === 6 ? '100%' : '60%', opacity: i === 6 ? 1 : 0.4 }} />
                </div>
                <span className="font-mono text-[8px] text-muted-foreground">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div>
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mb-4">
          Toutes les demandes ({orders.length})
        </p>
        {orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border">
            <p className="font-mono text-xs text-muted-foreground">Aucune demande reçue.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => {
              const s = STATUS[order.status] || STATUS.pending;
              return (
                <div key={order.id} className="border border-border/50 bg-card/20 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className={`font-mono text-[10px] px-2 py-0.5 border ${s.bg} ${s.color} tracking-wider`}>{s.text}</span>
                        <span className="font-display font-bold text-sm">{order.product_name}</span>
                        <span className="font-mono text-xs text-primary">CHF {order.product_price?.toFixed(2)}</span>
                      </div>
                      <p className="font-body text-sm font-medium">{order.customer_name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{order.customer_email}</p>
                      {order.customer_message && (
                        <p className="font-body text-xs text-muted-foreground mt-1 italic">"{order.customer_message}"</p>
                      )}
                      <p className="font-mono text-[10px] text-muted-foreground/50 mt-2">
                        {new Date(order.created_date).toLocaleString('fr-CH')}
                      </p>
                      <StatusSelector
                        currentStatus={order.status}
                        itemId={order.id}
                        onUpdate={(id, status) => updateMutation.mutate({ id, status })}
                      />
                      </div>
                      {order.status === 'accepted' && order.product_payment_link && (
                      <a href={order.product_payment_link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-[10px] text-primary hover:underline shrink-0">
                        <ExternalLink className="w-3 h-3" /> Lien de paiement
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}