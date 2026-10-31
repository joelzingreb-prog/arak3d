import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3 h-3 ${s <= value ? 'text-primary fill-primary' : 'text-muted-foreground/20'}`} />
      ))}
    </div>
  );
}

export default function FeaturedReviewsSection() {
  const { data: reviews = [] } = useQuery({
    queryKey: ['featured-reviews'],
    queryFn: () => base44.entities.Review.filter({ is_featured: true }, '-created_date', 4),
  });

  if (reviews.length === 0) return null;

  return (
    <section className="py-20 px-6 md:px-[8vw]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase mb-2">Avis clients</p>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
            Ce qu'ils en pensent
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="border border-border/40 bg-card/20 p-6 flex flex-col gap-3"
            >
              <StarDisplay value={r.rating} />
              {r.comment && (
                <p className="font-body text-sm text-foreground/80 italic leading-relaxed">
                  "{r.comment}"
                </p>
              )}
              <div className="mt-auto pt-2 border-t border-border/20 flex items-center justify-between">
                <span className="font-mono text-xs font-bold">{r.author_name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{r.product_name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}