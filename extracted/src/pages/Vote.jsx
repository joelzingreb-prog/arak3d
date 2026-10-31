import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Vote, Clock, CheckCircle2, Layers, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FooterSection from '../components/home/FooterSection';
import { format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

const VOTED_KEY = 'arak3d_voted_polls';

function getVotedPolls() {
  try { return JSON.parse(localStorage.getItem(VOTED_KEY) || '{}'); } catch { return {}; }
}
function saveVote(pollId, optionId) {
  const v = getVotedPolls();
  v[pollId] = optionId;
  localStorage.setItem(VOTED_KEY, JSON.stringify(v));
}

function PollCard({ poll }) {
  const queryClient = useQueryClient();
  const voted = getVotedPolls();
  const myVote = voted[poll.id];
  const isClosed = !poll.is_active || (poll.end_date && isPast(new Date(poll.end_date)));

  const totalVotes = (poll.options || []).reduce((s, o) => s + (o.votes || 0), 0);

  const voteMutation = useMutation({
    mutationFn: async (optionId) => {
      const newOptions = (poll.options || []).map(o =>
        o.id === optionId ? { ...o, votes: (o.votes || 0) + 1 } : o
      );
      await base44.entities.Poll.update(poll.id, { options: newOptions });
      saveVote(poll.id, optionId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['polls'] }),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/50 bg-card/20 overflow-hidden"
    >
      {/* Poll header */}
      <div className="px-6 py-5 border-b border-border/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-1">
              {isClosed ? 'Sondage clos' : 'Vote en cours'}
            </p>
            <h2 className="font-display font-extrabold text-xl tracking-tight">{poll.title}</h2>
            {poll.description && (
              <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{poll.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {poll.end_date && (
              <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {isClosed ? 'Clos' : `Jusqu'au ${format(new Date(poll.end_date), 'd MMM yyyy', { locale: fr })}`}
              </span>
            )}
            <span className="font-mono text-[10px] text-muted-foreground">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {poll.limited_edition_note && (
          <div className="mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20">
            <p className="font-mono text-[10px] text-amber-400 tracking-wider">⚡ {poll.limited_edition_note}</p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(poll.options || []).map(option => {
          const pct = totalVotes > 0 ? Math.round((option.votes || 0) / totalVotes * 100) : 0;
          const isWinner = isClosed && (option.votes || 0) === Math.max(...(poll.options || []).map(o => o.votes || 0)) && totalVotes > 0;
          const isMyVote = myVote === option.id;

          return (
            <div key={option.id} className={`relative border overflow-hidden transition-all duration-300 ${
              isWinner ? 'border-primary' : isMyVote ? 'border-primary/50' : 'border-border/50'
            }`}>
              {isWinner && (
                <div className="absolute top-0 left-0 right-0 bg-primary py-0.5 text-center">
                  <span className="font-mono text-[9px] text-primary-foreground tracking-widest uppercase">★ Gagnant</span>
                </div>
              )}
              {/* Image */}
              <div className={`aspect-square bg-muted/30 overflow-hidden ${isWinner ? 'mt-5' : ''}`}>
                {option.image_url ? (
                  <img src={option.image_url} alt={option.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layers className="w-10 h-10 text-muted-foreground/20" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-display font-bold text-sm mb-1">{option.name}</p>
                {option.description && (
                  <p className="font-body text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">{option.description}</p>
                )}
                <div className="space-y-0.5 mb-3">
                  {option.material && (
                    <p className="font-mono text-[10px] text-muted-foreground">{option.material}</p>
                  )}
                  {option.price_estimate && (
                    <p className="font-mono text-[10px] text-primary">~{option.price_estimate}</p>
                  )}
                </div>

                {/* Vote bar */}
                {(myVote || isClosed) && (
                  <div className="mb-3">
                    <div className="flex justify-between font-mono text-[9px] text-muted-foreground mb-1">
                      <span>{option.votes || 0} vote{(option.votes || 0) !== 1 ? 's' : ''}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1 bg-muted/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full ${isWinner ? 'bg-primary' : 'bg-muted-foreground/50'}`}
                      />
                    </div>
                  </div>
                )}

                {/* Vote button */}
                {!isClosed && (
                  <button
                    onClick={() => !myVote && voteMutation.mutate(option.id)}
                    disabled={!!myVote || voteMutation.isPending}
                    className={`w-full py-2 font-mono text-[10px] tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      isMyVote
                        ? 'bg-primary/10 border border-primary/30 text-primary cursor-default'
                        : myVote
                        ? 'border border-border/30 text-muted-foreground/40 cursor-not-allowed'
                        : 'border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    {voteMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isMyVote ? (
                      <><CheckCircle2 className="w-3 h-3" /> Mon choix</>
                    ) : (
                      <><Vote className="w-3 h-3" /> Voter</>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function VotePage() {
  const { data: polls = [], isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => base44.entities.Poll.list('-created_date'),
  });

  const activePolls = polls.filter(p => p.is_active && !(p.end_date && isPast(new Date(p.end_date))));
  const closedPolls = polls.filter(p => !p.is_active || (p.end_date && isPast(new Date(p.end_date))));

  return (
    <div className="pt-24 pb-0 min-h-screen">
      <div className="px-6 md:px-[8vw] max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-4 uppercase">Communauté</p>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight mb-4">
            Votez pour le prochain produit
          </h1>
          <p className="font-body text-muted-foreground text-base leading-relaxed max-w-2xl">
            Participez au choix du prochain objet 3D mis en vente. Le produit élu sera fabriqué et disponible pour une <span className="text-primary">durée limitée</span>.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border/30">
            <Vote className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-mono text-sm text-muted-foreground">Aucun sondage actif pour l'instant.</p>
            <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">Revenez bientôt !</p>
          </div>
        ) : (
          <div className="space-y-12 mb-16">
            {activePolls.length > 0 && (
              <div className="space-y-8">
                {activePolls.map(poll => <PollCard key={poll.id} poll={poll} />)}
              </div>
            )}
            {closedPolls.length > 0 && (
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-6">Sondages terminés</p>
                <div className="space-y-8 opacity-80">
                  {closedPolls.map(poll => <PollCard key={poll.id} poll={poll} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <FooterSection />
    </div>
  );
}