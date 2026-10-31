# Publier ce projet Base44 sur Cloudflare Pages — 100 % GRATUIT

> 💸 **Coût total : 0 CHF/0 €.** Cloudflare Pages est gratuit (builds + trafic
> illimités sur le plan Free). Le backend Base44 utilisé ici reste celui de
> ton compte gratuit actuel — aucune option payante n'est nécessaire.

> ✅ **Deux zips fournis :**
> - `arak3d-final-dist.zip` → **le plus simple** : site déjà compilé. Sur
>   Cloudflare Pages : *Create a project → Upload assets*, dézippe et glisse
>   le contenu du dossier `dist/`. Aucun build, aucune variable, rien à taper.
> - `arak3d-final-source.zip` → le code source, pour un déploiement Git ou si
>   tu veux recompiler toi-même (`npm install && npm run build`).
>
> ✅ **Déjà préconfiguré pour ARAK3D** : l'App ID et l'URL du backend Base44
> (`https://arak.base44.app`) sont compilés DANS le `dist/` livré et dans le
> `.env.production` du source. **Aucune variable à ajouter dans Cloudflare.**

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

## Connexion Google / panneau admin — GRATUIT, zéro payant

Le site tourne désormais 100 % sur Cloudflare, mais l'identité (comptes,
rôles, données) reste sur le backend Base44 gratuit actuel — c'est voulu et
cela ne nécessite aucune modification du code ni aucun upgrade payant.

### Option A — Email + mot de passe (recommandée, 100 % gratuite, rien à configurer)
Dans `/login`, entre l'email et le mot de passe du compte admin tel qu'il
existe déjà sur Base44. La connexion par mot de passe fonctionne depuis
n'importe quel domaine (Cloudflare y compris), sans aucune configuration :
le site appelle directement l'API d'authentification de ton backend gratuit.
Tu es redirigé vers `/admin` selon le rôle du compte. C'est la voie la plus
simple et elle ne dépend d'aucun réglage OAuth.

### Option B — Bouton « Continue with Google » (gratuit aussi, 1 réglage une fois)
Le bouton « Continuer avec Google » ouvre la page de login officielle de l'app dans un nouvel onglet (voir section Connexion admin plus bas).


## 🔐 Connexion admin (version gratuite, sans "Domain is not valid")

Problème rencontré : l'OAuth Google de Base44 n'accepte que les domaines
`*.base44.app`. Rediriger vers `*.pages.dev` renvoyait
`{"message":"Domain is not valid"}` — et le déblocage était payant.

Solution implémentée (100 % gratuite, rien à changer chez Base44) :
- Le **mot de passe admin** du panneau d'accueil connecte désormais
  directement au compte admin via email+mot de passe (API Base44), puis
  redirige vers `/admin`. Plus de détour par Google.
- Si ce compte n'utilise pas ce mot de passe sur Base44, un onglet s'ouvre
  sur la page de login officielle `arak.base44.app/login` (Google y
  fonctionne) ; après connexion là-bas, revenir sur le site Cloudflare.
- La page `/login` classique propose aussi "Continue with Google" (même
  comportement : ouvre l'app officielle dans un nouvel onglet).

## 📤 Publication express (Upload assets)

1. Cloudflare Pages → Create project → **Upload assets**
2. Nom du projet (ex. `arak-7kw`) → dézipper `arak3d-final-dist.zip` et
   glisser **le contenu du dossier** (index.html, assets/, _redirects…)
3. Deploy → le site répond sur https://arak-7kw.pages.dev
