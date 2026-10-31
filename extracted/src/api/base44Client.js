// ============================================================================
// Client 100 % LOCAL — AUCUN appel réseau, AUCUNE popup, AUCUN lien Base44.
// Interface strictement inchangée : mêmes composants, mêmes écrans, même
// comportement (produits, commandes, demandes, sondages, avis, packs,
// YouTube, articles, saisons, réglages). Tout est stocké dans le navigateur
// (localStorage) et persiste donc sur l'appareil de l'administrateur.
// ============================================================================

const DB_KEY = 'arak_local_db_v1';
const SESSION_KEY = 'arak_local_session';

export const LOCAL_ADMIN_PASSWORD = '@48#57a@rak!'; // mot de passe du panneau d'accès admin

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

const nowISO = () => new Date().toISOString();

const defaultDb = () => ({
  Product: [],
  Pack: [],
  Order: [],
  CustomRequest: [],
  Poll: [],
  Review: [],
  YoutubeContent: [],
  Article: [],
  AppSettings: [
    { id: 'local-settings', key: 'settings', free_shipping_threshold: 100, currency: 'CHF' },
  ],
});

function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return defaultDb();
    const parsed = JSON.parse(raw);
    const def = defaultDb();
    for (const k of Object.keys(def)) if (!Array.isArray(parsed[k])) parsed[k] = def[k];
    return parsed;
  } catch (e) {
    return defaultDb();
  }
}

function saveDb(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) { /* quota */ }
}

let dbCache = null;
function getDb() {
  if (!dbCache) dbCache = loadDb();
  return dbCache;
}

// --------------------------- tri type Base44 --------------------------------
function sortItems(items, orderBy) {
  if (!orderBy) return items;
  const fields = String(orderBy).split(',').map(s => s.trim()).filter(Boolean);
  const copy = [...items];
  copy.sort((a, b) => {
    for (const f of fields) {
      const desc = f.startsWith('-');
      const key = desc ? f.slice(1) : f;
      const va = a[key], vb = b[key];
      if (va === vb) continue;
      if (va === undefined || va === null) return 1;
      if (vb === undefined || vb === null) return -1;
      const c = va < vb ? -1 : 1;
      return desc ? -c : c;
    }
    return 0;
  });
  return copy;
}

// ------------------------- entités (API identique) --------------------------
function makeEntity(name) {
  return {
    async list(orderBy, limit) {
      let items = sortItems(getDb()[name] || [], orderBy || '-created_date');
      if (limit) items = items.slice(0, limit);
      return JSON.parse(JSON.stringify(items));
    },
    async retrieve(id) {
      const it = (getDb()[name] || []).find(x => x.id === id);
      if (!it) throw { status: 404, message: 'Not found' };
      return JSON.parse(JSON.stringify(it));
    },
    async create(data) {
      const db = getDb();
      const item = { id: uid(), created_date: nowISO(), last_updated: nowISO(), ...data };
      db[name].unshift(item);
      saveDb(db);
      return JSON.parse(JSON.stringify(item));
    },
    async update(id, data) {
      const db = getDb();
      const i = db[name].findIndex(x => x.id === id);
      if (i === -1) throw { status: 404, message: 'Not found' };
      db[name][i] = { ...db[name][i], ...data, id, last_updated: nowISO() };
      saveDb(db);
      return JSON.parse(JSON.stringify(db[name][i]));
    },
    async bulk_update(items) {
      const db = getDb();
      for (const upd of items || []) {
        const i = db[name].findIndex(x => x.id === upd.id);
        if (i !== -1) db[name][i] = { ...db[name][i], ...upd, last_updated: nowISO() };
      }
      saveDb(db);
      return true;
    },
    async delete(id) {
      const db = getDb();
      db[name] = (db[name] || []).filter(x => x.id !== id);
      saveDb(db);
      return true;
    },
    async delete_multiple(ids) {
      const db = getDb();
      const set = new Set(ids || []);
      db[name] = (db[name] || []).filter(x => !set.has(x.id));
      saveDb(db);
      return true;
    },
  };
}

const ENTITY_NAMES = [
  'Product', 'Pack', 'Order', 'CustomRequest', 'Poll', 'Review',
  'YoutubeContent', 'Article', 'AppSettings', 'User',
];

// ------------------------------ auth locale ---------------------------------
const listeners = new Set();
function emitAuthChange(user) {
  listeners.forEach(fn => { try { fn(user); } catch (e) { /* noop */ } });
}

function currentUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function setCurrentUser(user) {
  if (user) {
    const s = JSON.stringify(user);
    try { sessionStorage.setItem(SESSION_KEY, s); localStorage.setItem(SESSION_KEY, s); } catch (e) { /* noop */ }
  } else {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }
  emitAuthChange(user);
}

const auth = {
  me: async () => {
    const u = currentUser();
    if (!u) throw { status: 401, message: 'Unauthorized' };
    return u;
  },
  isAuthenticated: () => !!currentUser(),
  setToken: () => { /* plus de token externe — mode local */ },
  getToken: () => null,
  // Connexion directe : le mot de passe du panneau admin suffit.
  login: async (email, password) => {
    if (password !== LOCAL_ADMIN_PASSWORD) throw { status: 403, message: 'ACCESS_DENIED' };
    const user = {
      id: 'local-admin',
      email: email || 'admin',
      role: 'admin',
      first_name: 'Admin',
      last_name: '',
      picture: null,
    };
    setCurrentUser(user);
    return user;
  },
  register: async ({ email, password }) => auth.login(email, password),
  logout: async () => { setCurrentUser(null); },
  sendPasswordResetEmail: async () => true,
  resetPasswordRequest: async () => true,
  resetPassword: async () => true,
  verifyOtp: async () => auth.me(),
  resendOtp: async () => true,
  getRedirectUrl: () => window.location.origin + '/login',
};

// Filet de sécurité final : si un composant résiduel tentait encore
// d'ouvrir une fenêtre vers base44.app/com, elle est bloquée ici.
const _origOpen = window.open.bind(window);
window.open = function (url, name, features) {
  const u = String(url || '');
  if (/base44\.(app|com|dev)/i.test(u) || name === 'base44_auth') return null;
  return _origOpen(url, name, features);
};

// ------------------------------- client -------------------------------------
export const base44 = {
  appId: 'local',
  token: null,
  auth,
  onUserChange: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  entities: Object.fromEntries(ENTITY_NAMES.map(n => [n, makeEntity(n)])),
  integrations: {
    Core: {
      SendEmail: async () => true,   // no-op local (aucun service externe)
      SendSMS: async () => true,
      GenerateImage: async () => { throw { message: 'IA non disponible en mode local' }; },
      ExtractData: async () => ({}),
      QueryTextModel: async () => '',
    },
  },
  functions: {
    call: async () => { throw { message: 'Fonctions distantes désactivées (mode local)' }; },
  },
};
