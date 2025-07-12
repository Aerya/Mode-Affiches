# Mode Affiches Alternatif — UseNet Enhanced

Userscript pour transformer la liste de releases sur un indexeur privé en **galerie d'affiches responsive**, avec overlay d’info avancé et configuration dynamique.

Encore un grand bravo & merci au développeur du site !


### A l'avenir, les mises à jour ne seront publiées que sur le Git fu site concerné afin de pouvoir mettre les URLs en clair ###



<div align="center">

<img src="https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/1.2.png" alt="Menu" />

</div>

---

## 🚀 Fonctionnalités principales

- **Affichage galerie** (grille responsive) pour les films et séries, sur la page d'accueil et les sections Films / Séries
- **Regroupement de releases** pour les films et séries, sur la page chargée, toutes les releases d'un même contenu solt regroupées
- **Overlay** : au clic sur une affiche, détail de toutes les releases du même titre (avec icônes d’action natives du site)
- **Largeur d’affiche configurable** (slider : 200–360 px), lisible et adaptatif
- **Menu de configuration dynamique** : sélectionnez les sections à transformer (Accueil, Films, Séries)
- **Affichage de la note TMDB avec lien vers la fiche** optionnel, avec clé API personnelle à configurer
- **Nettoyage/normalisation des titres** (optimisé Films & Séries)
- **Bouton “Remonter en haut de page”** visible lors du scroll
- **Options persistantes** (taille d’affiche & sections actives via LocalStorage)
- **Mise à jour automatique** depuis GitHub à chaque utilisation du script dans le navigateur

---

## 🆕 Journal des mises à jour

### 6.28 (12/07/2025)
- Ajout lien vers fiche TMDB dans icône + note (votes)

### 6.27 (12/07/2025)
- Corrections affichage note TMDB. Au besoin, la taille de l'icône se modifie ligne 158 `width="70" height="42"`

### 6.26 (12/07/2025)
- Correction overlay qui pouvait dépasser les dimensions du navigateur
- Ajout de notes TMDB sur les affiches, en option

### 6.25 (12/07/2025)
- Correction bogue Bouton de menu

### 6.24 (12/07/2025)
- Ajout d’une option pour la taille de police des noms de releases dans l’overlay (menu configuration)
- Séparateur centré dans le header de l’overlay, correction « Voir toutes les releases pour le film / la série »
- Correction : NFO toujours affiché devant l’overlay, ajustement dynamique de la hauteur de l’overlay
- Mise à jour automatique depuis GitHub

### 6.23 (11/07/2025)
- Overlay extra-large (1150px), responsive à la largeur de vignette
- Menu amélioré, bouton Remonter en haut de page
- Affichage propre, bugfix police et espacements

### 6.20 (10/07/2025)
- Adaptation à la nouvelle structure du site
- Responsive, pagination propre, intégration menu config
- Groupement des releases par ID film/série, overlay dynamique par affiche
- Option sections (Films, Séries, Accueil)
- Slider taille d’affiche amélioré

---

## 📦 Installation

1. **Installez [Tampermonkey](https://www.tampermonkey.net/)** (ou équivalent : Violentmonkey, Greasemonkey)
2. Créez un nouveau script et copiez-y le contenu de `mode_affiches.js`
3. Modifiez le champ `@match` du script pour cibler votre propre indexeur (ex : `https://lesite.domaine/*`)
4. Pour avoir les notes TMDB sur les affiches, mettez votre [clé API TMDB](https://www.themoviedb.org/settings/api) (gratuite) dans le champ `const TMDB_API_KEY = '1234'; // Mettez votre clé ici !`
3. Sauvegardez, activez le script

---

## 🖥️ Screenshots

![Démo](https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/2.1.png)
![Démo](https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/3.1.png)
![Démo](https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/4.1.png)
![Démo](https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/5.1.png)

---

## 🧩 Détails techniques

- **Vanilla JS** (pas de dépendances externes)
- Overlay uniquement au clic (ergonomie : pas d’effet “polluant” au survol)
- Regroupement des releases par titre (film ou série) depuis la page chargée, donc pas d'appel superflue au site
- Icônes natives pour chaque release (signalement, téléchargement, panier, etc.)

---

## ❓ FAQ

- **Le script ne fonctionne pas ?**  
  Vérifiez le champ `@match` tout en haut du script : il doit correspondre à votre site.
- **Je veux plus d’options !**  
  Forkez le script ou ouvrez un ticket pour proposer vos idées.
- **Vous constatez un bug ?**  
  Fournissez un extrait du HTML concerné pour correction rapide.

---

## 🤝 Crédits

Développé par [Aerya](https://github.com/Aerya) — libre d’utilisation et de modification du moment que la source est citée.  
Toute contribution est la bienvenue !

---