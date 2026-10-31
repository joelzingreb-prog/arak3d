// Paramètres d'app — version 100 % locale (aucun backend externe).
export const appParams = {
  appId: 'local',
  token: null,
  fromUrl: typeof window !== 'undefined' ? window.location.href : '',
  functionsVersion: null,
  appBaseUrl: '',
};
