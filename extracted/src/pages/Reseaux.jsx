import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Youtube, ExternalLink, Play, Film, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import ArticleCard from '@/components/reseaux/ArticleCard';

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  // Shorts
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  // Watch
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return null;
}

function isShortUrl(url) {
  return url?.includes('/shorts/');
}

function VideoCard({ item }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getYoutubeEmbedUrl(item.youtube_url);
  const isShort = isShortUrl(item.youtube_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border/50 overflow-hidden group ${isShort ? 'row-span-2' : ''}`}
    >
      <div
        className={`relative bg-black ${isShort ? 'aspect-[9/16]' : 'aspect-video'} cursor-pointer`}
        onClick={() => !playing && setPlaying(true)}
      >
        {playing && embedUrl ? (
          <iframe
            src={`${embedUrl}?autoplay=1`}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={item.title}
          />
        ) : (
          <>
            <img
              src={`https://img.youtube.com/vi/${embedUrl?.split('/embed/')[1]}/hqdefault.jpg`}
              alt={item.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
            <div className="absolute top-2 left-2">
              <span className={`font-mono text-[9px] tracking-widest uppercase px-2 py-1 ${isShort ? 'bg-primary text-white' : 'bg-black/70 text-white'}`}>
                {isShort ? 'Short' : 'Vidéo'}
              </span>
            </div>
          </>
        )}
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <p className="font-mono text-xs text-foreground/90 truncate">{item.title}</p>
        <a
          href={item.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

export default function Reseaux() {
  const { data: allContent = [], isLoading } = useQuery({
    queryKey: ['youtube-content'],
    queryFn: () => base44.entities.YoutubeContent.list('sort_order'),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['articles'],
    queryFn: () => base44.entities.Article.list('-published_at'),
  });

  const activeArticles = articles.filter(a => a.is_active !== false);

  const channelUrl = settings.find(s => s.key === 'youtube_channel_url')?.value || '';
  const channelName = settings.find(s => s.key === 'youtube_channel_name')?.value || 'ARAK3D';

  const active = allContent.filter(c => c.is_active !== false);
  const videos = active.filter(c => c.type === 'video');
  const shorts = active.filter(c => c.type === 'short');

  return (
    <div className="pt-24 pb-20 px-6 md:px-[8vw] max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-primary uppercase mb-3">Nos Réseaux</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">
            Chaîne YouTube
          </h1>
          {channelUrl && (
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-xs tracking-wider transition-colors"
            >
              <Youtube className="w-4 h-4" />
              {channelName}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : active.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <Youtube className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-mono text-sm text-muted-foreground">Aucun contenu pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Vidéos */}
          {videos.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Film className="w-4 h-4 text-primary" />
                <h2 className="font-display font-bold text-lg tracking-tight">Vidéos</h2>
                <span className="font-mono text-[10px] text-muted-foreground">({videos.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map(v => <VideoCard key={v.id} item={v} />)}
              </div>
            </section>
          )}

          {/* Shorts */}
          {shorts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Play className="w-4 h-4 text-primary fill-primary" />
                <h2 className="font-display font-bold text-lg tracking-tight">Shorts</h2>
                <span className="font-mono text-[10px] text-muted-foreground">({shorts.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {shorts.map(s => <VideoCard key={s.id} item={s} />)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Articles / Actualités */}
      {activeArticles.length > 0 && (
        <section className="mt-20 border-t border-border/50 pt-14">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-4 h-4 text-primary" />
            <p className="font-mono text-xs tracking-[0.3em] text-primary uppercase">Actualités</p>
          </div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mb-8">
            L'impression 3D en ce moment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}