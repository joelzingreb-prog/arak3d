import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { useSyncBase44Token } from '@/lib/cloudflareAuth';

const AuthContext = createContext();

// Le client axios interne du SDK n'expose pas ses erreurs sous la forme
// attendue ici (error.status / error.data). On fait une requête fetch simple
// avec gestion robuste des codes HTTP pour ne jamais bloquer l'affichage.
async function fetchPublicSettings() {
  const base = (appParams.appBaseUrl || '').replace(/\/+$/, '');
  const url = `${base || ''}/api/apps/public/prod/public-settings/by-id/${appParams.appId}`;
  const headers = { 'X-App-Id': appParams.appId };
  if (appParams.token) headers.Authorization = `Bearer ${appParams.token}`;
  const res = await fetch(url, { headers });
  let data = null;
  try { data = await res.json(); } catch (e) { /* réponse non-JSON */ }
  return { ok: res.ok, status: res.status, data };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useSyncBase44Token();

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    // Mode 100 % local (Cloudflare autonome) : AUCUN appel réseau vers un
    // backend externe, AUCUNE popup, aucun spinner infini possible.
    // On restaure simplement une éventuelle session admin locale.
    try {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      setIsAuthenticated(!!u);
    } catch (e) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
      
      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);

    // Nettoyage local du token, SANS redirection vers arak.base44.app
    // (qui afficherait un popup 404 / erreur de domaine). On reste sur
    // Cloudflare : retour simple vers l'accueil.
    localStorage.removeItem('base44_access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('arak_local_session');
    sessionStorage.removeItem('arak_local_session');
    try { base44.auth.setToken(null); } catch (e) { /* non bloquant */ }
    if (shouldRedirect && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    // Cloudflare : on reste TOUJOURS sur notre propre page /login (aucune
    // redirection vers arak.base44.app, qui afficherait une erreur de domaine
    // ou un popup 404). Interface inchangée — c'est la même page de login.
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
