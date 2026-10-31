import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { getFavorites } from '@/lib/favorites';

const SEASON_MESSAGES = {
  ete: '☀️ Allez à la mer !',
  hiver: '❄️ Joyeux hiver !',
  automne: '🍂 Bel automne !',
};

export default function Navbar({ onAdminTrigger, onFavoritesOpen, activeSeason }) {
  const location = useLocation();
  const [favCount, setFavCount] = useState(0);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const adminTimerRef = useRef(null);

  useEffect(() => {
    const update = () => setFavCount(getFavorites().length);
    update();
    window.addEventListener('favorites-updated', update);
    return () => window.removeEventListener('favorites-updated', update);
  }, []);

  // Hidden admin trigger: 4 clicks on the full logo text
  const handleLogoSecretClick = (e) => {
    e.preventDefault();
    setAdminClickCount(c => {
      const next = c + 1;
      if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
      if (next >= 4) {
        onAdminTrigger();
        return 0;
      }
      adminTimerRef.current = setTimeout(() => setAdminClickCount(0), 1500);
      return next;
    });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 md:px-[8vw] h-16 flex items-center justify-between">
        {/* Logo + message saisonnier */}
        <div className="flex items-center gap-3">
          <span
            onClick={handleLogoSecretClick}
            className="font-display font-extrabold text-xl tracking-wider text-foreground hover:text-primary transition-colors duration-300 cursor-pointer select-none"
          >
            ARAK<span className="text-primary">3D</span>
          </span>
          {activeSeason && activeSeason !== 'none' && SEASON_MESSAGES[activeSeason] && (
            <span className="hidden sm:inline font-mono text-[10px] tracking-wider text-primary/80 border border-primary/30 px-2 py-0.5 rounded-full animate-pulse">
              {SEASON_MESSAGES[activeSeason]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <Link
            to="/"
            className={`font-mono text-[10px] md:text-xs uppercase tracking-[0.05em] md:tracking-[0.2em] transition-colors duration-300 ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Accueil
          </Link>
          <Link
            to="/catalogue"
            className={`font-mono text-[10px] md:text-xs uppercase tracking-[0.05em] md:tracking-[0.2em] transition-colors duration-300 ${
              isActive('/catalogue') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Catalogue
          </Link>
          <Link
            to="/infos"
            className={`font-mono text-[10px] md:text-xs uppercase tracking-[0.05em] md:tracking-[0.2em] transition-colors duration-300 ${
              isActive('/infos') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Infos
          </Link>
          <Link
            to="/demande"
            className={`font-mono text-[10px] md:text-xs uppercase tracking-[0.05em] md:tracking-[0.2em] transition-colors duration-300 ${
              isActive('/demande') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Demande
          </Link>
          <Link
            to="/vote"
            className={`font-mono text-[10px] md:text-xs uppercase tracking-[0.05em] md:tracking-[0.2em] transition-colors duration-300 ${
              isActive('/vote') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Vote
          </Link>
          <Link
            to="/reseaux"
            className={`font-mono text-[10px] md:text-xs uppercase tracking-[0.05em] md:tracking-[0.2em] transition-colors duration-300 ${
              isActive('/reseaux') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Réseaux
          </Link>

          {/* Favoris 3D button */}
          <button
            onClick={onFavoritesOpen}
            className="relative flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-300"
            aria-label="Favoris 3D"
          >
            <Heart className={`w-4 h-4 ${favCount > 0 ? 'text-primary fill-primary' : ''}`} />
            {favCount > 0 && (
              <span className="font-mono text-[10px] text-primary">{favCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}