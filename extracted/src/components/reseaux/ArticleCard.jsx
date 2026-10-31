import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function ArticleCard({ article }) {
  const [expanded, setExpanded] = useState(false);
  const allImages = [article.image_url, ...(article.image_urls || [])].filter(Boolean);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/50 bg-card/20 overflow-hidden"
    >
      {article.image_url && (
        <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-5">
        <h3 className="font-display font-bold text-lg tracking-tight mb-2">{article.title}</h3>
        <div className="flex items-center gap-3 text-muted-foreground mb-3 flex-wrap">
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <User className="w-3 h-3" /> {article.author}
          </span>
          {article.published_at && (
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <Clock className="w-3 h-3" />
              {new Date(article.published_at).toLocaleString('fr-CH', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        {article.content && (
          <>
            <p className={`font-body text-sm text-muted-foreground leading-relaxed whitespace-pre-line ${expanded ? '' : 'line-clamp-3'}`}>
              {article.content}
            </p>
            {article.content.length > 200 && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 font-mono text-[10px] text-primary mt-2 hover:opacity-80 transition-opacity"
              >
                {expanded ? <><ChevronUp className="w-3 h-3" /> Réduire</> : <><ChevronDown className="w-3 h-3" /> Lire la suite</>}
              </button>
            )}
          </>
        )}
        {allImages.length > 1 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {allImages.slice(1).map((url, i) => (
              <img key={i} src={url} alt="" className="w-20 h-14 object-cover border border-border/30" />
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}