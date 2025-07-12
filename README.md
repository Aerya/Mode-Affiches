# Mode Affiches Alternatif — UseNet Enhanced

Userscript avancé pour transformer la liste de releases sur un indexeur privé en **galerie d’affiches responsive**, overlay d’info détaillé, et actions directes Radarr/Sonarr.

> **Merci au développeur du site pour le partenariat technique !** Qui a en plus ajouté le mode écran large :)
> **Merci à chatGPT pour les corrections (1 erreur de corrigée, 2 de créées lol), le décalage de l'overlay, l'intégration de Radarr en exemple et le ReadMe !**

---

## 🚀 Fonctionnalités principales

- **Affichage galerie** : Grille responsive pour films & séries (Accueil, Films, Séries)
- **Regroupement intelligent** : Toutes les releases d’un même film/série sont rassemblées sous une seule affiche
- **Overlay dynamique & configurable** :  
  - Clic sur une affiche = détails de toutes les releases du titre (scroll auto si +10 releases)
  - Sur option, ouverture dans un nouvel onglet de la fiche du média/Voir toutes les releases
  - **Taille de police de l’overlay réglable**
- **Actions Radarr/Sonarr/4K/Overserr/Jellyseerr** :  (NB : j'ai pas pris le temps de tester Jellyseerr, je me suis basé sur Overseerr)
  - Boutons d’ajout direct (Radarr, Radarr 4K, Sonarr, Sonarr 4K) affichés **uniquement si des instances sont configurées** (via le menu)
  - Configuration facile des instances, sans exposer d’URL du site ou de clés en dur
  - Fonctionne avec URL ou http://ip:port **sans blackslash à la fin**
  - Pour Overseerr/Jellyseerr, voir plus loin dans le ReadMe (Détails Techniques) car il faut modifier le reverse-proxy si vous en utilisez un
  - Qualité et dossier cible auto, choix du profil dynamique
- **Badges notes TMDB/IMDB** :  
  - Notes avec icônes, fond blanc translucide, texte noir gras  
  - **Lien direct vers la fiche TMDB**
- **Largeur d’affiche configurable** : Slider 200–360 px
- **Menu de configuration dynamique** : Sélection des sections à transformer (Accueil, Films, Séries), instances Radarr/Sonarr, options d’UI
- **Persistant** : Toutes les préférences (sections actives, tailles, instances…) sont sauvegardées en LocalStorage
- **Bouton “Remonter en haut de page”** : Apparition automatique au scroll
- **Sécurité et vie privée** :  
  - **Le script ne contient aucune URL d’indexeur**  
  - Grâce à une détection côté navigateur, il s’active uniquement sur le bon site, sans config manuelle  
  - **Mises à jour automatiques** : Le script vérifie et propose les updates GitHub/Gitea de lui-même (il check les dépôts toutes les 12h)

---

## 🆕 Journal des mises à jour

**8.4.3 (12/07/2025)**

- Ajout de la fonction d’auto-update discrète depuis tig. et GitHub
- Support amélioré pour charger la mise à jour depuis les deux sources simultanément
- Correction mineure dans le processus d’ouverture de l’onglet de mise à jour
- Stabilisation générale du script, sans suppression de fonctionnalités

**8.4.2 (12/07/2025)**

- Badges TMDB/IMDB : fond blanc opaque, texte noir gras, lien direct vers la fiche TMDB
- Icônes Radarr/Sonarr/4K visibles uniquement si instances configurées
- Config multi-instance Radarr/Sonarr, Overseerr, Jellyseerr, overlay moderne, taille de police ajustable
- Nombreuses optimisations UX

---

## 📦 Installation

1. **Installez [ViolentMonkey](https://violentmonkey.github.io/)** (ou [TamperMonkey](https://www.tampermonkey.net/), [GreaseMonkey](https://www.greasespot.net/)…)
2. **Créez un nouveau script** et collez-y le contenu de `mode_affiches.js`
3. **Activez le script**. Il détectera automatiquement s’il se trouve sur le bon indexeur (grâce à la collaboration avec le développeur)
4. **Configurez** vos instances Radarr/Sonarr/4K si besoin, via le menu (aucune URL du site à renseigner)

---

## 🖥️ Aperçu visuel

<div align="center">

### Menu  
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/menu.1.0.png" alt="Démo Menu" width="600"/>

</div>

<div align="center">

### Overlay  
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/overlay.1.0.png" alt="Démo Overlay 1" width="400"/>
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/overlay.1.1.png" alt="Démo Overlay 2" width="400"/>

</div>

<div align="center">

### Affiches  
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/affiches.1.0.png" alt="Démo Affiches 1" width="400"/>
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/affiches.1.1.png" alt="Démo Affiches 2" width="400"/>

</div>

<div align="center">

### Radarr  
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/radarr.1.0.png" alt="Démo Radarr 1" width="350"/>
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/radarr.1.1.png" alt="Démo Radarr 2" width="350"/>
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/radarr.1.2.png" alt="Démo Radarr 3" width="350"/>
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/radarr.1.3.png" alt="Démo Radarr 4" width="350"/>

</div>

### Overseerr  
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/overseerr.1.0.png" alt="Démo Overseerr 1" width="350"/>
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/overseerr.1.1.png" alt="Démo Overseerr 2" width="350"/>
<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/overseerr.1.2.png" alt="Démo Overseerr 3" width="350"/>

</div>

---

## 🧩 Détails techniques

- **Vanilla JS** : Zéro dépendance externe
- **Détection automatique du site** : Activation sans configuration d’URL
- **Groupement local** : Toutes les opérations sont faites côté navigateur, jamais d’appel API “sauvage” à l’indexeur
- **Overlay au clic** : Ergonomie optimale
- **Mises à jour automatiques** : Pas besoin de surveiller GitHub, le script le fait pour vous

---

### ⚡ Pré-requis côté serveur : activer CORS pour votre domaine

#### ▶️ Nginx Proxy Manager

Dans l’onglet **Advanced** du proxy vers Overseerr/Jellyseerr, ajoutez (en adaptant l’URL de l’indexeur si besoin) : rempalcez `https://lesite.extension` par la vraie URL de l'indexeur et `ttp://192.168.0.195:5055` par l'IP et le port de l'application

```nginx
location /api/v1/ {
    add_header 'Access-Control-Allow-Origin' 'https://lesite.extension' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, X-Api-Key, Content-Type, Accept' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://lesite.extension' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, X-Api-Key, Content-Type, Accept' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        add_header 'Access-Control-Max-Age' 86400 always;
        add_header 'Content-Type' 'text/plain charset=UTF-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }

    proxy_pass http://192.168.0.195:5055;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

<div align="center">

<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/npm.1.0.png" alt="Démo NPM1 1" width="350"/>

</div>

#### ▶️ Traefik

Dans la section `middlewares` de votre `docker-compose.yml` ou traefik config :

```yaml
  overseerr-cors:
    headers:
      accessControlAllowOriginList:
        - "https://lesite.extension"
      accessControlAllowMethods:
        - "GET"
        - "POST"
        - "OPTIONS"
        - "PUT"
        - "DELETE"
      accessControlAllowHeaders:
        - "Authorization"
        - "X-Api-Key"
        - "Content-Type"
        - "Accept"
      accessControlExposeHeaders:
        - "Content-Length"
        - "Content-Range"
      accessControlMaxAge: 86400
      addVaryHeader: true
```

Ajoutez le middleware à votre service Overseerr/Jellyseerr :

```yaml
  labels:
    - "traefik.http.routers.overseerr.middlewares=overseerr-cors@docker"
```

---

> ⚠️ Si vous voyez un message “CORS error” dans la console navigateur :  
> C’est la config proxy qui doit être adaptée (voir ci-dessus)
> Un simple `curl` qui marche ne suffit pas, le navigateur exige un header CORS valide et un endpoint `OPTIONS` qui répond 204/200

---

## ❓ FAQ

**Le script ne fonctionne pas ?**  
Vérifiez que vous êtes bien sur les pages sur lesquelles il agit. Vérifiez que l'URL est bien détectée (et non bloquée par une extension de votre navigateur Internet)
**Un bug ?**  
Joignez un extrait HTML de la page pour correction express

---

## 💡 Idées pour les prochaines versions

- **Section musique** : recherche sur Spotify, recherche par genres/artistes similaires, intégration de Lidarr
- ... ?
---

## 🤝 Crédits

Développé par **[Aerya](https://github.com/Aerya)** — libre d’utilisation & de modification, avec mention de la source.  

---
