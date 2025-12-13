# LMS Brevet Fédéral

Plateforme d'apprentissage en ligne (LMS) pour la préparation au Brevet Fédéral, avec support pour les objectifs d'apprentissage (Bloom), portfolio de réflexion et système de gamification.

## 🎯 Fonctionnalités

- **5 Onglets Principaux:**
  1. **Accueil** - Tableau de bord avec progression globale
  2. **Apprentissage** - Chapitres avec parcours d'apprentissage (SVG interactif)
  3. **Révision** - Pool d'exercices dynamique
  4. **Journal** - Réflexion pédagogique (taxonomie de Bloom)
  5. **Profil** - Profil utilisateur et statistiques

- 📚 **Contenu Structuré:** 5+ chapitres avec objectifs d'apprentissage
- 🎯 **Gamification:** Points, badges, progression
- 💾 **Sauvegarde Locale:** Utilise localStorage avec système d'export/import
- 📊 **Suivi de Progression:** Étapes verrouillées/déverrouillées
- 🎨 **Design Responsive:** CSS moderne avec variables de design

## 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/LMS-Brevet-Federal.git
cd LMS-Brevet-Federal

# Ouvrir directement (pas de build nécessaire)
# Utilisez un serveur local ou ouvrez index.html dans votre navigateur
```

## 📁 Structure du Projet

```
.
├── index.html              # Point d'entrée HTML
├── js/
│   ├── app.js             # Logique principale (2100+ lignes)
│   ├── storage.js         # Gestion LocalStorage
│   └── portfolio-swipe.js  # Système de cartes (portfolio)
├── css/
│   ├── style.css          # Styles principaux (1300+ lignes)
│   ├── gamification.css    # Styles gamification
│   └── responsive.css      # Styles responsifs
├── data/
│   └── chapitres.json      # Contenu des chapitres
├── assets/
│   ├── images/            # Images du projet
│   ├── svg/               # SVG personnalisés
│   ├── videos/            # Contenus vidéo
│   └── h5p/               # Exercices interactifs H5P
└── infos générales/        # Documentation du projet
```

## 🛠️ Technologies

- **HTML5** - Structure sémantique
- **CSS3** - Variables CSS, Grid, Flexbox
- **JavaScript (Vanilla)** - Pas de framework, logique pure
- **LocalStorage** - Persistance des données
- **SVG** - Graphiques vectoriels interactifs

## 📖 Utilisation

1. **Première visite:** Complétez votre profil (Accueil → Profil)
2. **Apprentissage:** Naviguez dans les chapitres et complétez les étapes
3. **Révision:** Pratiquez avec les exercices des chapitres complétés
4. **Réflexion:** Documentez votre apprentissage dans le Journal
5. **Progression:** Consultez votre profil pour voir vos badges et points

## 💾 Sauvegarde et Export

- Les données sont **automatiquement sauvegardées** dans le navigateur
- **Export JSON** disponible dans l'onglet Profil
- **Import JSON** pour restaurer une sauvegarde
- **Réinitialisation** avec option de confirmation

## 📝 Licence

Ce projet est créé pour la formation au Brevet Fédéral.

---

**Dernière mise à jour:** Décembre 2025
