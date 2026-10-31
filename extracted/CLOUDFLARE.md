# Publier ce projet Base44 sur Cloudflare Pages

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
