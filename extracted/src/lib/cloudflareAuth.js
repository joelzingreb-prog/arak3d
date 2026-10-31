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

// Connexion Google depuis un domaine externe (Cloudflare Pages).
//
// ⚠️ Historique du bug « Domain is not valid » :
// L'OAuth de Base44 est enregistré uniquement pour les domaines *.base44.app.
// Toute tentative de rediriger vers arak-7kw.pages.dev était rejetée par
// Google/Base44 ("Domain is not valid"), même gratuitement.
//
// Solution sans rien payer et sans toucher à Base44 :
// On ouvre la vraie page de login Google sur le domaine officiel de l'app
// (arak.base44.app), où l'OAuth fonctionne déjà parfaitement. Une fois
// connecté là-bas, l'utilisateur possède une session valide ; il lui suffit
// alors de revenir sur son site Cloudflare, qui lit les données via l'API
// publique de Base44. Le mot de passe admin, lui, connecte directement
// (loginViaEmailPassword) sans passer par Google.
export function googleLogin(_client, redirectTo = '/') {
  const base = String(appParams.appBaseUrl || 'https://arak.base44.app').replace(/\/+$/, '');
  // Page de login officielle de l'app Base44 (Google y est autorisé).
  window.open(`${base}/login`, '_blank', 'noopener');
}

// Attente simple pour UI (ex. message "reviens ensuite").
export function waitForReturnHint(ms = 1500) {
  return new Promise((res) => setTimeout(res, ms));
}
