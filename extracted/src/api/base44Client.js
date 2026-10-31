import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, functionsVersion, appBaseUrl } = appParams;

// Dynamically read the token at runtime so admin operations always include the session token
const token = localStorage.getItem('base44_access_token')
  || appParams.token
  || null;

// En local (vite dev), on laisse '' pour bénéficier du plugin/proxy Base44.
// Une fois buildé et servi statiquement (Cloudflare Pages), les appels relatifs
// (/api/...) échouent car il n'y a pas de backend au même endroit :
// on pointe donc directement vers le backend public de l'app si connu.
const isDevAndProxied = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const serverUrl = !isDevAndProxied && appBaseUrl ? String(appBaseUrl).replace(/\/+$/, '') : '';

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl
});