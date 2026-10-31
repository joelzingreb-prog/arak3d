// AuthContext crée le state AVANT que main.jsx s'exécute, donc le client SDK a
// déjà été initialisé avec un token potentiellement absent (localStorage vidé
// par clear_access_token). On force l'en-tête Authorization du client à chaque
// montage pour être certain que la session est bien prise en compte.
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

export function useSyncBase44Token() {
  useEffect(() => {
    const token = localStorage.getItem('base44_access_token') || appParams.token;
    if (token) {
      try {
        base44.auth.setToken(token);
      } catch (e) {
        /* non bloquant */
      }
    }
  }, []);
}

// Lance la connexion Google. Depuis un domaine externe (Cloudflare Pages),
// on utilise directement l'endpoint OAuth public du backend Base44 : le
// fournisseur renvoie ensuite sur from_url avec ?access_token=..., que
// app-params.js capture et mémorise automatiquement. Aucune configuration
// payante n'est nécessaire côté Base44.
export function googleLogin(client, redirectTo = '/') {
  const isExternalHost = typeof window !== 'undefined' &&
    !/(^|\.)base44\.(app|com)$/.test(window.location.hostname);
  if (isExternalHost && appParams.appBaseUrl && appParams.appId) {
    const base = String(appParams.appBaseUrl).replace(/\/+$/, '');
    const redirectUrl = `${window.location.origin}${redirectTo}`;
    window.location.href =
      `${base}/api/apps/auth/login?app_id=${encodeURIComponent(appParams.appId)}` +
      `&provider=google&from_url=${encodeURIComponent(redirectUrl)}`;
    return;
  }
  client.auth.loginWithProvider('google', redirectTo);
}
