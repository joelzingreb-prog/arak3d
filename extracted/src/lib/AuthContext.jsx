import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

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

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      // Sans app_id configuré (ex: build publié sans variables d'environnement),
      // on n'affiche pas un spinner infini : on laisse l'interface se rendre.
      if (!appParams.appId) {
        console.warn('Base44 app_id manquant — définissez VITE_BASE44_APP_ID pour connecter les données.');
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setAuthChecked(true);
        return;
      }

      // Vérifier les paramètres publics de l'app (avec token si disponible)
      let publicResult;
      try {
        publicResult = await fetchPublicSettings();
      } catch (networkError) {
        // Backend injoignable (réseau/CORS) : ne jamais bloquer l'affichage
        console.error('Public settings unreachable:', networkError);
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setAuthChecked(true);
        return;
      }

      if (publicResult.ok) {
        setAppPublicSettings(publicResult.data);

        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
        setIsLoadingPublicSettings(false);
      } else {
        console.error('App state check failed:', publicResult.status, publicResult.data);

        // Gérer les erreurs au niveau de l'app
        if (publicResult.status === 403 && publicResult.data?.extra_data?.reason) {
          const reason = publicResult.data.extra_data.reason;
          if (reason === 'auth_required') {
            setAuthError({ type: 'auth_required', message: 'Authentication required' });
          } else if (reason === 'user_not_registered') {
            setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
          } else {
            setAuthError({ type: reason, message: `HTTP ${publicResult.status}` });
          }
          setIsLoadingPublicSettings(false);
          setIsLoadingAuth(false);
        } else {
          // Erreur inattendue (404, 500, réseau...) : on affiche l'interface
          // plutôt qu'un écran bloqué — c'est ce qui cassait l'affichage sur Cloudflare.
          console.warn('Public settings indisponibles — affichage de l\'interface quand même.');
          setIsLoadingPublicSettings(false);
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
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
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    base44.auth.redirectToLogin(window.location.href);
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
