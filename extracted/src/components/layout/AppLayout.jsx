import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import AdminModal from './AdminModal';
import ThreeBackground from './ThreeBackground';
import FavoritesPanel from '../catalogue/FavoritesPanel';
import SeasonalDecorations from '../seasonal/SeasonalDecorations';
import { getFavorites } from '@/lib/favorites';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AppLayout() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [favPanelOpen, setFavPanelOpen] = useState(false);
  const [favorites, setFavorites] = useState(getFavorites);
  const navigate = useNavigate();

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  const ordersBlocked = settings.find(s => s.key === 'orders_blocked')?.value === 'true';
  const activeSeason = settings.find(s => s.key === 'active_season')?.value || 'none';

  const refreshFavorites = () => setFavorites(getFavorites());

  useEffect(() => {
    const handler = () => refreshFavorites();
    window.addEventListener('favorites-updated', handler);
    return () => window.removeEventListener('favorites-updated', handler);
  }, []);

  const handleAdminSuccess = () => {
    setShowAdminModal(false);
    window.location.href = '/admin';
  };

  // Apply seasonal theme color
  useEffect(() => {
    const root = document.documentElement;
    if (activeSeason === 'ete') {
      root.style.setProperty('--primary', '45 100% 50%'); // jaune-orangé
      root.style.setProperty('--accent', '45 100% 50%');
      root.style.setProperty('--ring', '45 100% 50%');
    } else if (activeSeason === 'hiver') {
      root.style.setProperty('--primary', '210 80% 75%'); // bleu-blanc
      root.style.setProperty('--accent', '210 80% 75%');
      root.style.setProperty('--ring', '210 80% 75%');
    } else {
      root.style.setProperty('--primary', '20 100% 50%'); // orange par défaut
      root.style.setProperty('--accent', '20 100% 50%');
      root.style.setProperty('--ring', '20 100% 50%');
    }
  }, [activeSeason]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThreeBackground />
      <SeasonalDecorations season={activeSeason} />
      <Navbar
        onAdminTrigger={() => setShowAdminModal(true)}
        onFavoritesOpen={() => setFavPanelOpen(true)}
        activeSeason={activeSeason}
      />
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={handleAdminSuccess}
      />
      <FavoritesPanel
        isOpen={favPanelOpen}
        onClose={() => setFavPanelOpen(false)}
        favorites={favorites}
        onFavoritesChange={refreshFavorites}
        ordersBlocked={ordersBlocked}
        onRequestOrder={() => { setFavPanelOpen(false); }}
      />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}