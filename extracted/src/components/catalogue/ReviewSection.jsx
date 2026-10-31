import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-colors duration-150 ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star
            className={`w-4 h-4 ${
              star <= (hovered || value)
                ? 'text-primary fill-primary'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function containsBlockedWord(text, blockedWords) {
  const lower = text.toLowerCase();
  return blockedWords.some(w => lower.includes(w.word.toLowerCase()));
}

export default function ReviewSection({ product }) {
  const queryClient = useQueryClient();
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', product.id],
    queryFn: () => base44.entities.Review.filter({ product_id: product.id }, '-created_date'),
  });

  const { data: blockedWords = [] } = useQuery({
    queryKey: ['blocked-words'],
    queryFn: () => base44.entities.BlockedWord.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product.id] });
      setAuthorName('');
      setRating(0);
      setComment('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!authorName.trim() || rating === 0) return;

    const fullText = `${authorName} ${comment}`;
    if (containsBlockedWord(fullText, blockedWords)) {
      setBlocked(true);
      setTimeout(() => setBlocked(false), 3000);
      return;
    }

    createMutation.mutate({
      product_id: product.id,
      product_name: product.name,
      author_name: authorName.trim(),
      rating,
      comment: comment.trim(),
    });
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="border-t border-border/30 pt-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase">Avis clients</p>
        {avgRating && (
          <div className="flex items-center gap-1.5">
            <StarRating value={Math.round(Number(avgRating))} readonly />
            <span className="font-mono text-xs text-muted-foreground">{avgRating}/5 ({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Existing reviews */}
      {reviews.length > 0 && (
        <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
          {reviews.map((r) => (
            <div key={r.id} className="border border-border/30 bg-background/30 p-3">
              <div className="flex items-center gap-2 mb-1">
                <StarRating value={r.rating} readonly />
                <span className="font-mono text-[10px] text-muted-foreground">{r.author_name}</span>
              </div>
              {r.comment && (
                <p className="font-body text-xs text-muted-foreground italic">"{r.comment}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.p
            key="ok"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-mono text-xs text-primary tracking-wider"
          >
            Merci pour votre avis !
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-2"
          >
            <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Laisser un avis</p>
            <div className="flex items-center gap-3">
              <StarRating value={rating} onChange={setRating} />
              <input
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="Votre prénom *"
                maxLength={40}
                className="flex-1 bg-background/50 border border-input px-2 py-1 text-xs font-body placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Votre expérience (optionnel)"
              maxLength={300}
              rows={2}
              className="w-full bg-background/50 border border-input px-2 py-1 text-xs font-body placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
            {blocked && (
              <p className="font-mono text-[10px] text-destructive">Commentaire contenant un mot non autorisé.</p>
            )}
            <button
              type="submit"
              disabled={!authorName.trim() || rating === 0 || createMutation.isPending}
              className="px-4 py-1.5 border border-primary/30 bg-primary/5 text-primary font-mono text-[10px] tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Publier
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}