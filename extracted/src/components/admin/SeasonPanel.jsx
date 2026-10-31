import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sun, Snowflake, Leaf, X } from 'lucide-react';

const SEASONS = [
  { id: 'ete', label: 'Été', icon: Sun, desc: 'Palmiers, étoile de mer · Thème jaune-orangé · "Allez à la mer !"', color: 'text-yellow-400' },
  { id: 'hiver', label: 'Hiver', icon: Snowflake, desc: 'Pain d\'épices, flocons · Thème blanc · "Joyeux hiver !"', color: 'text-blue-300' },
  { id: 'automne', label: 'Automne', icon: Leaf, desc: 'Feuilles mortes · Thème orange (défaut) · "Bel automne !"', color: 'text-orange-400' },
  { id: 'none', label: 'Aucun', icon: X, desc: 'Apparence de base du site', color: 'text-muted-foreground' },
];

export default function SeasonPanel() {
  const queryClient = useQueryClient();

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  const currentSeason = settings.find(s => s.key === 'active_season')?.value || 'none';
  const seasonRecord = settings.find(s => s.key === 'active_season');

  const mutation = useMutation({
    mutationFn: async (value) => {
      if (seasonRecord) {
        await base44.entities.AppSettings.update(seasonRecord.id, { value });
      } else {
        await base44.entities.AppSettings.create({ key: 'active_season', value, label: 'Saison active' });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mb-1">
          Thème saisonnier
        </p>
        <p className="font-body text-xs text-muted-foreground">
          Active une décoration 3D holographique en premier plan et change le thème couleur du site.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SEASONS.map(({ id, label, icon: Icon, desc, color }) => {
          const isActive = currentSeason === id;
          return (
            <button
              key={id}
              onClick={() => mutation.mutate(id)}
              disabled={mutation.isPending}
              className={`text-left p-4 border rounded-lg transition-all duration-300 ${
                isActive
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-border/80 bg-card hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : color}`} />
                <span className={`font-mono text-sm font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {label}
                </span>
                {isActive && (
                  <span className="ml-auto font-mono text-[9px] tracking-widest text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                    Actif
                  </span>
                )}
              </div>
              <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border/50">
        <p className="font-mono text-[10px] text-muted-foreground tracking-wider">
          Saison active : <span className="text-primary">{SEASONS.find(s => s.id === currentSeason)?.label || 'Aucune'}</span>
        </p>
      </div>
    </div>
  );
}