# Publier ce projet Base44 sur Cloudflare Pages

> ✅ **Ce zip est déjà préconfiguré pour ARAK3D** : le fichier `.env.production`
> contient l'App ID et l'URL du backend Base44 de ton app
> (`https://arak.base44.app`). Un simple `npm run build` produit un `dist/`
> branché sur tes vraies données — **aucune variable à ajouter dans Cloudflare,
> rien à faire de plus**. (Si tu déploies via Git plutôt que via upload du zip,
> ajoute quand même les deux variables `VITE_BASE44_APP_ID` /
> `VITE_BASE44_APP_BASE_URL` dans Cloudflare, au cas où.)

## Pourquoi l'interface n'apparaissait pas

Le code exporté de Base44 contient une étape de vérification au démarrage
(`AuthContext` → `checkAppState`) qui :

1. **restait bloquée sur un spinner infini** si `app_id` / le backend
   Base44 n'étaient pas configurés dans le build (cas d'un build Cloudflare
   sans variables d'environnement) ;
2. utilisait un import interne du SDK (`@base44/sdk/dist/utils/axios-client`)
   fragile, et des appels API en chemins relatifs (`/api/...`) qui ne
   mènent nulle part une fois le site servi statiquement par Cloudflare.

Ces deux problèmes ont été corrigés : l'interface originale se lance
désormais même si le backend n'est pas encore branché, et les appels API
sont automatiquement dirigés vers le backend Base44 quand il est configuré.

## Étapes pour publier

1. Dans le projet Base44 (sur base44.com), récupère :
   - l'**App ID** (voir "Connect your code" / paramètres de l'app), ex. `cbef744a8545c389ef439ea6`
   - l'**URL publique de l'app**, ex. `https://mon-site-abc12345.base44.app`

2. Sur Cloudflare Pages → *Settings* → *Environment variables* (Build settings), ajoute :

   | Variable | Valeur |
   |---|---|
   | `VITE_BASE44_APP_ID` | ton App ID |
   | `VITE_BASE44_APP_BASE_URL` | `https://<ton-app>.base44.app` |

3. Réglages de build :
   - **Framework preset** : `Vite`
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Node version** : 20 ou plus

4. C'est tout : le fichier `public/_redirects` inclus gère déjà les routes
   React Router (SPA fallback), et `manifest.json` évite une erreur 404.

## Notes

- Sans ces variables, le site affiche l'interface mais les données
  (produits, réglages, avis…) seront vides, car elles vivent sur le
  backend Base44. La connexion (login admin, etc.) nécessite aussi
  le backend Base44.
- Les images/upload envoyées vers l'API Base44 fonctionneront dès que
  `VITE_BASE44_APP_BASE_URL` est défini.
- Test local : `npm install && npm run dev` (crée un `.env` avec les
  deux variables ci-dessus pour tester dans les mêmes conditions).

## Connexion Google / panneau admin — à faire UNE fois sur Base44

Le site tourne désormais 100 % sur Cloudflare, mais l'identité (comptes,
rôles, données) reste sur le backend Base44 — c'est voulu et cela ne
nécessite aucune modification du code du site. Pour que le bouton
« Continue with Google » fonctionne depuis ton domaine Cloudflare :

1. Ouvre https://base44.com → projet **arak** → **Settings → Authentication**
   (ou « OAuth / Social login »).
2. Dans la liste des **URLs autorisées / redirect URIs**, ajoute :
   - `https://<ton-sous-domaine>.pages.dev`
   - `https://www.<ton-domaine-personnalisé>.com` (si tu en as un)
3. C'est tout. Le flux est déjà câblé côté code :
   `/login` → Google → retour Base44 vers `<ton-site-cloudflare>/?access_token=…`
   → le jeton est capturé par l'app, stocké en localStorage, puis nettoyé
   de l'URL. Tu arrives connecté(e) sur la page d'accueil ; `/admin` est
   alors accessible selon le rôle défini sur Base44.

Remarques :
- Les règles `public/_redirects` (SPA fallback) ne touchent pas les retours
  OAuth : le `access_token` n'est jamais perdu.
- Si une connexion échoue avec « redirect URI not allowed », c'est uniquement
  l'étape 2 ci-dessus qui manque — aucune action nécessaire sur le code.
- Aucune donnée n'est dupliquée : produits, commandes, réglages et comptes
  administrateurs restent ceux de Base44, lus/écrits en direct par le site
  hébergé sur Cloudflare.
