# Mode Affiches Alternatif — UseNet Enhanced

Userscript pour transformer la liste de releases sur un indexeur privé en **galerie d'affiches responsive**, avec overlay d’info avancé et configuration dynamique.

**MàJ 11/07/2025 :** Compatible avec la dernière UI du site concerné. Encore un grand bravo & merci au développeur !

![Menu](https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/1.png)

---

## 🚀 Fonctionnalités principales

- **Affichage galerie** (grille responsive) pour les films et séries, sur la page d'accueil et les sections Films / Séries
- **Overlay extra-large :** au clic sur une affiche, détail de toutes les releases du même titre (avec icônes d’action natives du site)
- **Largeur d’affiche configurable** (slider : 200–360 px), lisible et adaptatif
- **Menu de configuration dynamique** : sélectionnez les sections à transformer (Accueil, Films, Séries)
- **Nettoyage/normalisation des titres** (optimisé Films & Séries)
- **Bouton “Remonter en haut de page”** visible lors du scroll
- **Options persistantes** (taille d’affiche & sections actives via LocalStorage)

---

## 📦 Installation

1. **Installez [Tampermonkey](https://www.tampermonkey.net/)** (ou équivalent : Violentmonkey, Greasemonkey)
2. Créez un nouveau script et copiez-y le contenu de `mode_affiches.js`
3. Sauvegardez, activez le script

> **À adapter** :  
> Modifiez le champ `@match` du script pour cibler votre propre indexeur (ex : `https://lesite.domaine/*`).

---

## 🖥️ Screenshots

![Démo](https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/2.png)
![Démo](https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/3.png)
![Démo](https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/4.png)
![Démo](https://raw.githubusercontent.com/Aerya/Mode-Affiches/refs/heads/main/Screens/5.png)

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