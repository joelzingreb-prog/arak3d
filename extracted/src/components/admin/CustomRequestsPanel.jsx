import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Package, Palette, Ruler, User, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS = {
  pending:    { text: 'En attente',         color: 'text-amber-400',    bg: 'bg-amber-400/10 border-amber-400/20' },
  accepted:   { text: 'Acceptée',           color: 'text-primary',       bg: 'bg-primary/10 border-primary/20' },
  printing:   { text: 'En impression',      color: 'text-blue-400',      bg: 'bg-blue-400/10 border-blue-400/20' },
  delivering: { text: 'Livraison en cours', color: 'text-purple-400',    bg: 'bg-purple-400/10 border-purple-400/20' },
  rejected:   { text: 'Refusée',            color: 'text-destructive',   bg: 'bg-destructive/10 border-destructive/20' },
};

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

export default function CustomRequestsPanel() {
  const queryClient = useQueryClient();

  const { data: requests = [] } = useQuery({
    queryKey: ['custom-requests'],
    queryFn: () => base44.entities.CustomRequest.list('-created_date'),
    refetchInterval: 15000,
  });

  useEffect(() => {
    const unsub = base44.entities.CustomRequest.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['custom-requests'] });
    });
    return unsub;
  }, [queryClient]);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.CustomRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-requests'] }),
  });

  const pending = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-border/50 bg-card/30 p-4 text-center">
          <p className="font-mono text-2xl font-bold text-amber-400">{pending}</p>
          <p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mt-1">En attente</p>
        </div>
        <div className="border border-border/50 bg-card/30 p-4 text-center">
          <p className="font-mono text-2xl font-bold text-primary">{requests.filter(r => r.status === 'accepted').length}</p>
          <p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mt-1">Acceptées</p>
        </div>
        <div className="border border-border/50 bg-card/30 p-4 text-center">
          <p className="font-mono text-2xl font-bold">{requests.length}</p>
          <p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mt-1">Total</p>
        </div>
      </div>

      {/* List */}
      <div>
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mb-4">
          Toutes les demandes personnalisées ({requests.length})
        </p>
        {requests.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border">
            <p className="font-mono text-xs text-muted-foreground">Aucune demande personnalisée reçue.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const s = STATUS[req.status] || STATUS.pending;
              return (
                <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-border/50 bg-card/20 p-4">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className={`font-mono text-[10px] px-2 py-0.5 border ${s.bg} ${s.color} tracking-wider`}>{s.text}</span>
                    <span className="font-display font-bold text-sm">{req.subject}</span>
                    {req.client_code && (
                      <span className="font-mono text-[10px] text-muted-foreground border border-border/50 px-2 py-0.5">{req.client_code}</span>
                    )}
                  </div>
                  <StatusSelector
                    currentStatus={req.status}
                    itemId={req.id}
                    onUpdate={(id, status) => updateMutation.mutate({ id, status })}
                  />

                  <div className="flex flex-wrap gap-4 mb-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span className="font-body">{req.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="font-mono">{req.customer_email}</span>
                    </div>
                  </div>

                  <p className="font-body text-xs text-muted-foreground italic border-l-2 border-border pl-3 mb-3">"{req.description}"</p>

                  <div className="flex flex-wrap gap-3">
                    {req.quantity > 1 && (
                      <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground border border-border/30 px-2 py-0.5">
                        <Package className="w-3 h-3" /> Qté : {req.quantity}
                      </div>
                    )}
                    {req.dimensions && (
                      <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground border border-border/30 px-2 py-0.5">
                        <Ruler className="w-3 h-3" /> {req.dimensions}
                      </div>
                    )}
                    {req.material && (
                      <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground border border-border/30 px-2 py-0.5">
                        {req.material}
                      </div>
                    )}
                    {req.color && (
                      <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground border border-border/30 px-2 py-0.5">
                        <Palette className="w-3 h-3" /> {req.color}
                      </div>
                    )}
                    {req.budget && (
                      <div className="flex items-center gap-1 font-mono text-[10px] text-primary border border-primary/20 bg-primary/5 px-2 py-0.5">
                        Budget : {req.budget}
                      </div>
                    )}
                  </div>

                  <p className="font-mono text-[10px] text-muted-foreground/50 mt-3">
                    {new Date(req.created_date).toLocaleString('fr-CH')}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}