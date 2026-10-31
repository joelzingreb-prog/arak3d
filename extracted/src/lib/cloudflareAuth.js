// ============================================================================
// Authentification 100 % locale — aucun réseau, aucune popup, aucun Base44.
// (Anciennement: passerelle OAuth Base44 — supprimée définitivement.)
// ============================================================================

import { base44, LOCAL_ADMIN_PASSWORD } from '@/api/base44Client';

export function useSyncBase44Token() {
  // rien à synchroniser : la session vit dans localStorage
}

export async function directLogin(email, password) {
  try {
    const user = await base44.auth.login(email, password);
    return { token: 'local', user };
  } catch (e) {
    return null;
  }
}

export async function fetchAdminEmails() {
  const u = await base44.auth.me().catch(() => null);
  return u ? [u.email] : [];
}

export function googleLogin() {
  // Volontairement désactivé : l'OAuth externe ouvrait une popup vers
  // base44.app (erreur "Domain is not valid" / 404). Plus jamais.
  // La connexion utilise le mot de passe admin directement sur Cloudflare.
  window.location.href = '/login';
}

export { LOCAL_ADMIN_PASSWORD };
