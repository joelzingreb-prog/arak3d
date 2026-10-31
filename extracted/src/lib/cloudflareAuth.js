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

// Popup OAuth "Domain is not valid" : le SDK Base44 ouvrait en interne une
// popup d'authentification sur arak.base44.app avec redirect back vers notre
// domaine pages.dev — refusé par Base44. Ces garde-monde bloquent TOUTE
// ouverture de popup/base44_auth, désormais et pour toujours. Plus jamais de
// popup Base44 ni d'erreur "Domain is not valid" / 404.
if (typeof window !== 'undefined') {
  try {
    const _open = window.open.bind(window);
    window.open = function (url, name, features) {
      if (name === 'base44_auth') return null;
      if (typeof url === 'string' && /base44\.app/.test(url)) return null;
      return _open(url, name, features);
    };
  } catch (e) { /* non bloquant */ }
}

// Connexion Google : désactivée volontairement (impossible gratuitement
// depuis un domaine externe — l'OAuth Base44 n'accepte que *.base44.app).
// Elle ne provoque plus aucune erreur : c'est un simple message discret.
export function googleLogin(_client, _redirectTo = '/') {
  const toast = document.createElement('div');
  toast.textContent = 'Connexion Google indisponible — utilise ton email et ton mot de passe.';
  toast.setAttribute(
    'style',
    'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);z-index:9999;' +
    'background:#111;color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;' +
    'font-family:ui-monospace,monospace;box-shadow:0 8px 24px rgba(0,0,0,.35);'
  );
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Authentification directe via l'API REST publique de Base44 (email + mot de
// passe). N'utilise PAS l'OAuth Google → fonctionne depuis n'importe quel
// domaine (pages.dev, domaine perso…), gratuitement, sans rien configurer.
// Retourne { access_token, user } ou null (mauvais identiques / réseau HS).
export async function directLogin(email, password) {
  const base = String(appParams.appBaseUrl || 'https://arak.base44.app').replace(/\/+$/, '');
  try {
    const res = await fetch(`${base}/api/apps/${appParams.appId}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const token = data.access_token || (data.data && data.data.access_token);
    if (!token) return null;
    localStorage.setItem('base44_access_token', token);
    localStorage.setItem('token', token);
    appParams.token = token;
    try { base44.auth.setToken(token); } catch (e) { /* non bloquant */ }
    return { access_token: token, user: data.user || (data.data && data.data.user) || null };
  } catch (e) {
    return null;
  }
}

// Récupère l'email des comptes (admin inclus) via l'API publique, SANS popup.
// best-effort : renvoie [] si le backend refuse.
export async function fetchAdminEmails() {
  const emails = [];
  const bases = [
    `${String(appParams.appBaseUrl || 'https://arak.base44.app').replace(/\/+$/, '')}/api/apps/${appParams.appId}`,
    '/api/apps/' + appParams.appId,
  ];
  const token = localStorage.getItem('base44_access_token') || appParams.token;
  for (const b of bases) {
    for (const path of ['/entities/User/list?limit=100', '/entities/User/list?limit=100&sort_by=created_date']) {
      try {
        const res = await fetch(b + path, {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) continue;
        const json = await res.json();
        let list = Array.isArray(json) ? json : (json && (json.items || json.results || json.data)) || [];
        if (!Array.isArray(list)) list = [];
        for (const u of list) {
          const role = (u && (u.role || (u.extra_fields && u.extra_fields.role))) || '';
          if (String(role).toLowerCase() === 'admin' && u.email) emails.push(u.email);
        }
        if (emails.length) return emails;
      } catch (e) { /* essaie la suite */ }
    }
  }
  return emails;
}

// Attente simple pour UI (ex. message "reviens ensuite").
export function waitForReturnHint(ms = 1500) {
  return new Promise((res) => setTimeout(res, ms));
}
