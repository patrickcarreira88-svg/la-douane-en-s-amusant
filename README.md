# 🎓 LMS Douane Suisse - Brevet Fédéral

Plateforme e-learning interactive pour la préparation au Brevet Fédéral Douane.

## ✨ Caractéristiques

- 📚 **6 chapitres complets** (15-20h de formation)
- ❓ **Types d'exercices variés:** QCM, Drag & Drop, Scénarios immersifs, Matching, Flashcards
- 🎮 **Système de gamification:** Points, badges, progression
- 💾 **Sauvegarde locale:** localStorage avec export/import JSON
- 📱 **Design responsive:** Mobile, tablet, desktop
- 📊 **Tableau de bord:** Statistiques et suivi de progression
- 🔒 **Outil auteur:** Interface pour créer et modifier les exercices

## 🚀 Démarrage rapide

### Installation

```bash
# Cloner le repository
git clone https://github.com/patrickcarreira88-svg/la-douane-en-s-amusant.git
cd la-douane-en-s-amusant

# Aucune installation nécessaire - ouvrir index.html
# Ou utiliser un serveur local:
# python -m http.server 8000
# puis accéder à http://localhost:8000
```

### Utilisation

1. **Accueil:** Consultez votre progression globale
2. **Apprentissage:** Parcourez les 6 chapitres (101AB, 101BT, 101CT, etc.)
3. **Exercices:** Complétez les QCM, drag & drop, scénarios
4. **Révision:** Révisez avec des exercices aléatoires
5. **Profil:** Suivez vos statistiques et badges

## 📁 Structure du projet

```
.
├── index.html              # Application principale
├── js/
│   ├── app.js              # Logique principale
│   ├── storage.js          # Gestion localStorage
│   ├── VideoPlayer.js      # Lecteur vidéo
│   └── portfolio-swipe.js   # Interface cartes
├── css/
│   ├── style.css           # Styles principaux
│   ├── gamification.css     # Système de points/badges
│   ├── responsive.css       # Design responsive
│   ├── video-player.css     # Lecteur vidéo
│   └── portfolio-swipe.css  # Interface cartes
├── data/
│   ├── chapitres.json       # Contenu des chapitres
│   ├── data101-BT.json      # Données spécifiques 101BT
│   └── exercises/           # Fichiers d'exercices
│       ├── qcm.json
│       ├── dragdrop.json
│       ├── scenario.json
│       ├── matching.json
│       ├── fillblanks.json
│       ├── flashcards.json
│       ├── video.json
│       ├── lecture.json
│       └── quiz.json
├── src/
│   └── modules/            # Modules utilitaires
│       ├── ExerciseLoader.js
│       ├── ExerciseValidator.js
│       └── ExerciseNormalizer.js
├── authoring/              # Outils de création
│   ├── index.html
│   ├── create-qcm.html
│   ├── create-dragdrop.html
│   ├── create-scenario.html
│   └── js/generator.js
├── assets/
│   ├── images/             # Images du projet
│   ├── svg/                # Graphiques vectoriels
│   ├── videos/             # Contenus vidéo
│   └── h5p/                # Ressources H5P
└── docs/                   # Documentation

```

## 🛠️ Technologies

- **HTML5** - Structure sémantique
- **CSS3** - Variables, Grid, Flexbox
- **JavaScript (Vanilla)** - Pas de framework externe
- **localStorage** - Persistance des données client
- **SVG** - Graphiques vectoriels interactifs
- **JSON** - Format de données

## 📊 Fonctionnalités principales

### 1. Système d'apprentissage
- Navigation par chapitres
- Objectifs d'apprentissage Bloom
- Progression verrouillée/déverrouillée
- Vidéos intégrées avec transcription

### 2. Types d'exercices
- **QCM** - Questions à choix multiples
- **Drag & Drop** - Glisser-déposer
- **Scénarios** - Situations immersives
- **Matching** - Appariement
- **Flashcards** - Cartes mémo
- **Remplissage** - Trous à compléter
- **Lecteur vidéo** - Contenu vidéo avec sous-titres

### 3. Gamification
- Système de points
- Badges déverrouillables
- Tableau de classement
- Statistiques détaillées

### 4. Persistance
- Sauvegarde automatique localStorage
- Export JSON de la progression
- Import de sauvegarde
- Réinitialisation avec confirmation

### 5. Outil auteur
- Interface de création d'exercices
- Support JSON natif
- Générateur d'exercices
- Validation des données

## 🎯 Objectifs pédagogiques

La plateforme couvre les contenus requis pour le Brevet Fédéral en Douane:
- Marchandises et classification
- Processus douanier
- Réglementation
- Procédures administratives
- Cas d'usage pratiques

## 📝 Format des données

Les exercices utilisent un format JSON standardisé:

```json
{
  "id": "qcm_001",
  "type": "qcm",
  "question": "Question?",
  "options": [
    { "text": "Option 1", "correct": true },
    { "text": "Option 2", "correct": false }
  ],
  "explanation": "Explication de la réponse",
  "points": 10
}
```

## 💾 Sauvegarde des données

- **Automatique:** Chaque action est enregistrée
- **Export:** Télécharger un fichier JSON
- **Import:** Restaurer à partir d'une sauvegarde
- **Cloud:** Compatible avec stockage cloud (TODO)

## 🔧 Développement

### Ajouter un chapitre

1. Éditer `data/chapitres.json`
2. Ajouter les exercices dans `data/exercises/`
3. Actualiser l'application

### Ajouter un exercice

1. Utiliser l'outil auteur (`authoring/`)
2. Ou éditer directement le fichier JSON
3. Valider le format avec `ExerciseValidator.js`

## 📱 Responsive

- ✅ Mobile (< 768px)
- ✅ Tablet (768px - 1024px)
- ✅ Desktop (> 1024px)

## ⚙️ Configuration

Variables CSS personnalisables dans `style.css`:

```css
:root {
  --primary-color: #0066cc;
  --secondary-color: #ff6600;
  --success-color: #00cc00;
  --text-dark: #333333;
  --bg-light: #f5f5f5;
}
```

## 🐛 Problèmes connus

- Aucun actuellement

## 📄 Licence

Projet créé pour la formation au Brevet Fédéral Douane.

## 👤 Auteur

Patrick Carreira - [GitHub](https://github.com/patrickcarreira88-svg)

## 🤝 Contribution

Les suggestions et améliorations sont bienvenues! 

## 📞 Support

Pour toute question ou signalement de bug, ouvrez une [issue](https://github.com/patrickcarreira88-svg/la-douane-en-s-amusant/issues).

## 📖 Documentation supplémentaire

- **[Guide Utilisateur](docs/GUIDE_UTILISATEUR.md)** - Pour les apprenants
- **[Guide Auteur](docs/GUIDE_AUTEUR.md)** - Pour les formateurs  
- **[Guide Admin](docs/GUIDE_ADMIN.md)** - Pour les administrateurs

## 🧪 Tests

Exécuter la suite de tests:

```bash
node tests.js
```

Résultat attendu: 100% pass ✅

## 🎯 Chapitres

1. **CH1** - Introduction (Cantons, géographie)
2. **CH2** - Marchandises (Classification, définitions)
3. **CH3** - Législation (Tarifs, douanes)
4. **CH4** - Procédures (Dédouanement, documents)
5. **CH5** - Commerce International (Incoterms, échanges)
6. **CH6** - Sécurité (Contrôles, risques)

## 📱 Navigation principale

- 🏠 **Accueil** - Vue d'ensemble et statistiques
- 📚 **Apprentissage** - Cours + exercices interactifs
- 🎯 **Pratique** - Révision ciblée et pool d'exercices
- 📔 **Journal** - Historique et réflexions
- 👤 **Profil** - Données personnelles et badges

## 🛠️ Stack Technique

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Data:** JSON statique
- **Storage:** localStorage (données privées côté client)
- **Deploy:** GitHub Pages, Netlify, ou serveur custom
- **Performance:** Pas de dépendances externes

## 🔒 Sécurité & Confidentialité

- ✅ **Pas de backend** = pas de base de données
- ✅ **localStorage local** = données stockées localement
- ✅ **Pas d'authentification requise** (à ajouter si nécessaire)
- ✅ **HTTPS inclus** (GitHub Pages, Netlify)
- ✅ **Export/Import** pour contrôler ses données

## 🚀 Serveur local (développement)

```bash
# Avec Python 3
python -m http.server 5500

# Puis accéder à http://localhost:5500
```

## 📝 Licence

Projet éducatif - TFE Brevet Fédéral Douane Suisse

---

**Développé pour la Suisse 🇨🇭 | Décembre 2025**  
**Version:** 2.0.0
