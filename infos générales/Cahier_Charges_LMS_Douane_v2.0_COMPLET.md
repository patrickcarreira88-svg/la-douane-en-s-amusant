# 📋 CAHIER DES CHARGES COMPLET
## Plateforme LMS Gamifiée Version 2.0 - Adaptée Mimo

**Et si on jouait ? La Douane en s'amusant !**

---

## 📅 INFORMATIONS CLÉS

| Élément | Détail |
|---------|--------|
| **Version** | 2.0 - Avec adaptations Mimo |
| **Date** | 9 décembre 2025 |
| **Public** | Apprenants Brevet Fédéral (18-45 ans) |
| **Plateforme** | HTML5 SPA (Local only) |
| **Timeline** | 15 jours |
| **Budget** | 0€ |
| **Dépendances** | ZÉRO (HTML/CSS/JS pur) |
| **RGPD** | ✅ Conforme |

---

## 📑 TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#section-1)
2. [Architecture système (MISE À JOUR)](#section-2)
3. [Composants fonctionnels (ADAPTÉS MIMO)](#section-3)
4. [Spécifications techniques](#section-4)
5. [Guide de développement (15 jours)](#section-5)
6. [Normes et bonnes pratiques](#section-6)
7. [Plan de déploiement](#section-7)
8. [Comparaison Mimo vs Notre Plateforme](#section-8)
9. [Fiche synthétique](#section-9)

---

## 1️⃣ VUE D'ENSEMBLE DU PROJET {#section-1}

### 1.1 Contexte & Objectif

**Nom du projet:** Et si on jouait ? La Douane en s'amusant !

**Type:** Plateforme LMS locale (offline-first) avec gamification

**Public cible:**
- Jeunes adultes sortant d'un cursus CFC (formation professionnelle)
- Candidats en reconversion professionnelle
- Âge: 18-45 ans
- Contexte: Formation théorique intensive en entreprise (Brevet Fédéral suisse)

**Besoin pédagogique identifié:**
- ✓ Faible accroche avec enseignement académique traditionnel
- ✓ Besoin de transposer théorie vers pratique
- ✓ Manque de motivation et d'engagement
- ✓ Habitudes d'apprentissage à développer (répétition espacée)

**Contexte organisationnel:**
- Formation d'adultes en entreprise suisse
- Certification Brevet Fédéral
- Initiative personnelle pour combler gap pédagogique

**Contraintes majeures:**
- ✅ Déploiement LOCAL uniquement (HTML + JS + CSS, zéro serveur)
- ✅ RGPD strictement respecté (données sensibles, cloisonnement état)
- ✅ Responsive et tactile (tablettes + ordinateurs tactiles)
- ✅ Livraison prototype TFE (avant fin décembre 2025)
- ✅ Aucun framework externe (zéro dépendances)

### 1.2 Objectifs Pédagogiques

**Objectif Principal:** Créer une plateforme qui gamifie l'apprentissage tout en soutenant la réflexion métacognitive et l'autoévaluation, inspirée des meilleures pratiques Mimo.

**7 objectifs spécifiques:**

1. Motivation intrinsèque via gamification visuelle
2. Apprentissage durable via répétition espacée **VISIBLE**
3. Métaréflexion pédagogique (journal)
4. Autoévaluation formative (portfolio)
5. Tutorat asynchrone facilité
6. Vue d'ensemble des progrès (dashboard)
7. Pratique libre avec exercices aléatoires

---

## 2️⃣ ARCHITECTURE SYSTÈME (MISE À JOUR) {#section-2}

### 2.1 Stack Technologique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | HTML5 SPA + Vanilla JS ES6+ + CSS3 |
| **Storage** | LocalStorage (5MB max) + JSON |
| **Assets** | Images/Vidéos optimisées + SVG |
| **Accessibilité** | WCAG 2.1 AA + Responsive 320-1920px |

### 2.2 Navigation Principale (5 ONGLETS - Style Mimo)

```
🏠 ACCUEIL | 📚 CHAPITRES | 🎯 PRATIQUE | 📔 JOURNAL | 👤 PROFIL
```

#### 🏠 **ACCUEIL** - Dashboard Principal (NEW)
- Vue d'ensemble tous chapitres
- Statistiques globales (points, progression %)
- Prochain défi suggéré
- Progression visuelle globale

#### 📚 **MES CHAPITRES** - Existant + Amélioré
- Vue liste: tous 20 chapitres avec progression
- Détail chapitre au clic
- Chemin serpentin interactif
- États visibles (verrouillé/en cours/complété)

#### 🎯 **PRATIQUE LIBRE** - NEW (Très Important!)
- **Révisions Suggérées:** Affiche SM2 recommandations du jour
- **Exercices Aléatoires:** Quiz random depuis toute banque
- **Tracking:** Exercices maîtrisés + temps passé

#### 📔 **MON JOURNAL** - Existant
- Métaréflexion avec verbes Bloom
- Édition libre et consultable
- Archive complète

#### 👤 **PROFIL** - NEW
- Niveau & Points
- Badges obtenus
- Statistiques personnelles
- Actions: export/import/réinitialiser

### 2.3 Structure de Fichiers

```
📁 douane-lms/
├── index.html (SPA principale - 5 onglets)
├── css/
│   ├── style.css (général)
│   ├── gamification.css (chemin, badges, points)
│   ├── responsive.css (mobile/tablet/desktop)
│   └── dashboard.css (NEW - pages principales)
├── js/
│   ├── app.js (contrôleur principal)
│   ├── storage.js (wrapper LocalStorage)
│   ├── exercices.js (factory pattern)
│   ├── gamification.js (points & badges)
│   ├── spaced-repetition.js (SM2)
│   ├── video-loader.js (lazy loading)
│   ├── dashboard.js (NEW)
│   ├── practice.js (NEW - pratique libre)
│   ├── profile.js (NEW)
│   └── mail-helper.js (contact formateur)
├── assets/
│   ├── images/
│   ├── videos/
│   └── svg/ (icônes, chemin SVG)
├── data/
│   ├── chapitres.json
│   ├── exercices.json
│   └── badges.json
└── README.md
```

---

## 3️⃣ COMPOSANTS FONCTIONNELS (ADAPTÉS MIMO) {#section-3}

### 3.1 Gamification - Chemin Serpentin (Inspiré Mimo)

**Design Visuel:**
- Chemin vertical/serpentin avec étapes carrées arrondies
- États: 🔒 Verrouillé (gris) → ⚠️ En cours (orange) → ✅ Complété (mauve/vert)
- Éléments intermédiaires: Icônes (⚡ leçon, ✓ exercice, ▶️ vidéo)
- Points (+10 par exercice complété)
- Badges par chapitre (1 badge = chapitre 100%)
- Progression 0-100% par chapitre
- Ligne connectrice SVG animée

**Interactions:**
- Clic étape verrouillée → Montre prérequis
- Clic étape débloquée → Ouvre exercice
- Animation pop lors de complétion
- Feedback sonore (optionnel)

### 3.2 Dashboard Principal (NEW - Mimo-inspired)

Affiche:
- **"Mes Chapitres"** - Vue liste scrollable
  ```
  Chapitre 1: Introduction Douane [████░░░░] 40% (EN COURS)
  Chapitre 2: Tarification [░░░░░░░░░] 0% (🔒 VERROUILLÉ)
  Chapitre 3: Procédures [░░░░░░░░░] 0% (🔒 VERROUILLÉ)
  ... 17 autres chapitres
  ```
- **Statistiques Globales**
  - Points totaux: X XP
  - Chapitres complétés: X/20
  - Progression globale: X%
- **Prochain Défi**
  - "Vous êtes sur la bonne voie! Complétez Chapitre 2"

### 3.3 Pratique Libre (NEW - Très Important!)

#### Révisions Suggérées (Spaced Repetition VISIBLE)

Affiche: **"🎯 3 révisions suggérées aujourd'hui"**

Algo SM2 détermine quels exercices réviser. Liste mini-quiz aléatoires du jour:
- QCM - Mission douane [Difficile] (5 min)
- Gaps - Tarification [Moyen] (3 min)
- Flashcard - Termes [Facile] (2 min)

#### Exercices Aléatoires (Libre)

- Bouton "Nouveau Quiz Aléatoire"
- Génère exercice random depuis toute banque
- Pas ordre linéaire (contrairement chemin)
- Permet renforcer apprentissage
- Tracking stats:
  - Exercices maîtrisés: 42
  - Temps total: 12h 45min
  - Taux réussite: 87%

### 3.4 Types d'Exercices LMS (Priorités)

1. **QCM (4 choix)** ← Priorité absolue
2. **Vrai/Faux**
3. **Remplir les blancs (gaps)**
4. **Flashcards (swipe - tactile friendly)**
5. **Vidéos interactives**
6. **Drag & Drop (pour procédures)**

Chaque exercice:
- Feedback immédiat (juste/faux)
- Points attribués
- Enregistrement pour spaced rep
- Option "Je ne sais pas" pour SM2

### 3.5 Répétition Espacée (SM2) - Intégration à Pratique Libre

**Algo Simplifié:**
- 5 niveaux d'apprentissage (Again, Hard, Good, Easy)
- Intervalle de révision: 1, 3, 7, 14, 30 jours
- Visible dans "Pratique Libre"
- Quotidien: affiche révisions du jour
- Non-bloquant: apprenant peut réviser quand veut

### 3.6 Journal d'Apprentissage (Existant - Inchangé)

- Entrée libre post-exercice (optionnel)
- Verbes Bloom suggérés (Comprendre, Appliquer, Analyser, etc.)
- Feedback formateur possible (asynchrone)
- Archive consultable
- Export possible

### 3.7 Portfolio avec Validation (Existant)

- Autoévaluation: Swipe + checkboxes
- Valide compétences acquises
- Tracking: Quoi, quand, auto-évaluation niveau

### 3.8 Profil / Dashboard Personnel (NEW)

Affichage:
- Nickname: "Apprenti Douanier" (généré ou personnalisé)
- Points: 150 XP
- Jours d'affilée: 5 jours
- **Badges obtenus:**
  - [Maître Chapitre 1] - 96%
  - [Régulier] - 5 jours d'affilée
  - [Curieux] - 42 exercices complétés
  - [En Progrès] - 1/20 chapitres
- Progression Globale: [█░░░░░░░░] 5%
- **Actions:**
  - [📥 Importer données]
  - [📤 Exporter données]
  - [🗑️ Réinitialiser]

---

## 4️⃣ SPÉCIFICATIONS TECHNIQUES {#section-4}

### 4.1 Architecture Logique

**Core Modules:**
- **app.js** - Contrôleur principal (état global, routing)
- **storage.js** - Wrapper LocalStorage (CRUD)
- **exercices.js** - Factory pattern (génération exercices)
- **gamification.js** - Points & badges (calculs)
- **spaced-repetition.js** - SM2 (intervalles)
- **video-loader.js** - Lazy loading (performance)
- **dashboard.js** - Vue d'ensemble chapitres
- **practice.js** - Pratique libre + SM2 visible
- **profile.js** - Profil + badges
- **mail-helper.js** - Contact formateur

### 4.2 Format JSON - Structures Clés

```json
// chapitres.json
{
  "chapitres": [
    {
      "id": "ch1",
      "titre": "Introduction Douane",
      "description": "...",
      "progression": 40,
      "etapes": [...]
    }
  ]
}

// exercices.json
{
  "exercices": [
    {
      "id": "ex1",
      "type": "qcm",
      "question": "...",
      "options": [...],
      "reponse": "a",
      "points": 10,
      "categories": ["tarification", "niveau1"]
    }
  ]
}

// progression.json (LocalStorage)
{
  "chapitresCompletudes": {...},
  "exercicesCompletes": [...],
  "pointsTotal": 150,
  "badges": ["badge1", "badge2"],
  "spacedRep": [
    {
      "exerciceId": "ex1",
      "niveau": 2,
      "prochainRevisionDate": "2025-12-10"
    }
  ]
}
```

### 4.3 Algorithmes Clés

**Déblocage Étapes:**
- Étape N requiert 100% étape N-1
- Calcul progression = (étapes_complétées / total_étapes) * 100
- Chapitre complété si 100%

**Calcul Spaced Rep (SM2):**
- Input: Qualité réponse (1-5), Intervalle précédent
- Output: Nouvel intervalle, Date révision
- Intervalle base: 1, 3, 7, 14, 30 jours

**Validation Portfolio:**
- Score auto-évaluation stocké
- Comparaison avancée vs attendu

### 4.4 Performance Cibles

- First Paint: < 1s
- Time to Interactive: < 2s
- LocalStorage read: < 50ms
- Lazy loading images: 100% des images non-critiques
- Bundle CSS/JS: < 200KB total

### 4.5 Sécurité RGPD

- ✅ Données stockées LOCALEMENT (LocalStorage uniquement)
- ✅ Zéro connexion serveur
- ✅ Droit à l'oubli: Bouton "Réinitialiser tout"
- ✅ Droit à la portabilité: Export JSON complet
- ✅ Pas de tracking tiers
- ✅ Pas de cookies (sauf LocalStorage natif)

---

## 5️⃣ GUIDE DÉVELOPPEMENT (TIMELINE 15 JOURS) {#section-5}

### Phase 1 (Jours 1-3): Fondations

**J1:**
- ☐ Structure HTML SPA (5 onglets)
- ☐ Nav bar bottom (style Mimo)
- ☐ CSS Grid/Flexbox setup
- ☐ LocalStorage wrapper (storage.js)

**J2:**
- ☐ Chemin SVG serpentin (basique)
- ☐ États visuels (verrouillé/débloqué/complété)
- ☐ Chargement chapitres.json
- ☐ Clic étape → Ouverture détail

**J3:**
- ☐ Dashboard principal (vue liste chapitres)
- ☐ Calcul progression par chapitre
- ☐ Stats globales (points, % complétion)
- ☐ Responsive check (mobile)

### Phase 2 (Jours 4-7): Exercices Core

**J4:**
- ☐ QCM (4 choix) - Complet
- ☐ Vrai/Faux - Complet
- ☐ Système points (+10 par exercice)
- ☐ Feedback juste/faux immédiat

**J5:**
- ☐ Gaps (remplir les blancs)
- ☐ Flashcards (swipe/click)
- ☐ Validation réponses
- ☐ Sauvegarde progression

**J6:**
- ☐ Vidéo player (lazy load)
- ☐ Vidéos interactives (basic)
- ☐ Drag & Drop (simple)
- ☐ Tests tous types d'exercices

**J7:**
- ☐ Bug fixes exercices
- ☐ Tests responsif complets
- ☐ Optimisation perf (< 1s First Paint)

### Phase 3 (Jours 8-11): Gamification & Spaced Rep

**J8:**
- ☐ Badges system (création, attribution)
- ☐ Badge par chapitre 100%
- ☐ Page profil avec badges
- ☐ Animation badge unlock

**J9:**
- ☐ Spaced repetition algo (SM2)
- ☐ Calcul révisions du jour
- ☐ Stockage data SM2 en LocalStorage

**J10:**
- ☐ Section "Pratique Libre" (NEW)
- ☐ Affichage révisions suggérées
- ☐ Quiz aléatoires (random)
- ☐ Stats maîtrise (exercices réussis)

**J11:**
- ☐ Journal d'apprentissage intégré
- ☐ Portfolio intégré
- ☐ Contact formateur (mailto link)

### Phase 4 (Jours 12-15): Optimisation & Livraison

**J12:**
- ☐ Accessibilité WCAG AA (ARIA labels)
- ☐ Contraste couleurs 4.5:1
- ☐ Keyboard navigation (Tab)
- ☐ Screen reader compatibility

**J13:**
- ☐ Export/Import JSON (données)
- ☐ Tests all browsers (Chrome, FF, Safari)
- ☐ Tests mobile (iOS/Android)

**J14:**
- ☐ Documentation code (JSDoc)
- ☐ README.md (installation + usage)
- ☐ Guide utilisateur PDF
- ☐ Guide développeur

**J15:**
- ☐ QA final (tous les bugs)
- ☐ Performance audit (Lighthouse)
- ☐ Préparation livraison TFE
- ☐ ✅ LIVE!

---

## 6️⃣ NORMES & BONNES PRATIQUES {#section-6}

### 6.1 JavaScript - Code Quality

**Noms Explicites:**
```javascript
✓ calculateChapterProgress() not calc()
✓ getUnlockedSteps() not getSteps()
✓ spacedRepetitionIntervals not sr_intervals
```

**JSDoc Comments:**
```javascript
/**
 * Calcule la progression d'un chapitre
 * @param {string} chapterId - ID du chapitre
 * @returns {number} Pourcentage 0-100
 */
function calculateChapterProgress(chapterId) { ... }
```

**Gestion Erreurs:**
```javascript
try {
  loadChapter(chapterId);
} catch (error) {
  console.error('Failed to load chapter:', error);
  showUserError('Chapitre non trouvé');
}
```

### 6.2 Accessibilité (WCAG 2.1 AA)

- ☐ Tous les inputs ont labels (<label for="id">)
- ☐ Images ont alt text descriptif
- ☐ Contraste minimum 4.5:1 (normal), 3:1 (large)
- ☐ Focus visible sur tous boutons/inputs
- ☐ ARIA labels pour icônes: aria-label="Ouvrir menu"
- ☐ Keyboard nav complète (Tab, Enter, Arrow keys)
- ☐ Pas de piège clavier
- ☐ Ordre source logique

### 6.3 Performance - Optimisations

- ☐ Lazy load images: data-src + Intersection Observer
- ☐ Cache vidéos en LocalStorage (si < 5MB)
- ☐ Debounce auto-save (500ms)
- ☐ Minify CSS/JS production
- ☐ SVG optimisé (chemin serpentin)
- ☐ Pas de frameworks (0 dépendances)
- ☐ First Paint < 1s
- ☐ TTI < 2s

---

## 7️⃣ PLAN DE DÉPLOIEMENT {#section-7}

### Checklist Pré-Livraison

**FONCTIONNALITÉS:**
- ☐ Chemin gamifié visible + interactif
- ☐ 5+ chapitres tests (avec exercices)
- ☐ Tous types exercices (QCM, V/F, Gaps, Flashcards)
- ☐ Points système (+10 par exercice)
- ☐ Badges par chapitre
- ☐ Dashboard principal (vue chapitres)
- ☐ Pratique Libre (révisions SM2 visibles)
- ☐ Journal intégré
- ☐ Portfolio intégré
- ☐ Profil avec badges
- ☐ Export/Import JSON

**TECHNIQUE:**
- ☐ LocalStorage OK (test write/read)
- ☐ Responsive testé (320px à 1920px)
- ☐ Pas de console.error
- ☐ Vidéos lazy-load fonctionnelles
- ☐ Zéro frameworks (pur HTML/CSS/JS)
- ☐ RGPD conforme (données locales)
- ☐ Lighthouse score > 85

**DOCUMENTATION:**
- ☐ Code commenté JSDoc complet
- ☐ README.md (installation, features, tech stack)
- ☐ Guide Utilisateur PDF (screenshots)
- ☐ Guide Développeur (architecture, modules)

### Installation pour Apprenant

1. Recevoir dossier "douane-lms/"
2. Double-cliquer "index.html"
3. App se lance (chrome, firefox, safari, edge)
4. ✅ C'est prêt! Zéro installation technique

### Déploiement pour Formateur (Optionnel)

Hébergement statique (si besoin):
- Vercel (drag & drop)
- Netlify (drag & drop)
- GitHub Pages
- Serveur Apache (dossier statique)

**Mais: Usage LOCAL PRIORITAIRE (offline-first)**

---

## 8️⃣ COMPARAISON MIMO vs NOTRE PLATEFORME {#section-8}

| FEATURE | MIMO | NOTRE PLATEFORME | STATUS |
|---------|------|------------------|--------|
| Chemin serpentin | ✅ | ✅ | IDENTIQUE |
| Points/XP | ✅ | ✅ | IDENTIQUE |
| Badges | ✅ | ✅ | IDENTIQUE |
| Vue chapitres list | ✅ | ✅ | ADAPTÉ |
| Pratique libre | ✅ | ✅ | NEW (adapté Mimo) |
| Spaced rep visible | ✅ | ✅ | NEW (visible) |
| Profil | ✅ | ✅ | NEW |
| Journal | ❌ | ✅ | NOTRE PLUS |
| Portfolio | ❌ | ✅ | NOTRE PLUS |
| Data portability | ❌ | ✅ | NOTRE PLUS |
| Offline-first | ❌ | ✅ | NOTRE PLUS |
| RGPD conforme | ❌ | ✅ | NOTRE PLUS |

---

## 9️⃣ FICHE SYNTHÉTIQUE {#section-9}

### Synthèse Projet

```
NOM: Et si on jouait? La Douane en s'amusant!
VERSION: 2.0 (Adaptée Mimo)
PUBLIC: Apprenants Brevet Fédéral (18-45 ans)
PLATEFORME: HTML5 SPA (Local only)
TECHNOS: HTML5 + Vanilla JS + CSS3 + LocalStorage
TIMELINE: 15 jours (décembre 2025)
BUDGET: 0€
DÉPENDANCES: ZÉRO (0 frameworks)
RGPD: ✅ Conforme (données locales)

PAGES PRINCIPALES:
  1. 🏠 Accueil (Dashboard) - Vue d'ensemble
  2. 📚 Mes Chapitres - Chemin serpentin
  3. 🎯 Pratique Libre - Révisions + random quiz
  4. 📔 Mon Journal - Métaréflexion
  5. 👤 Profil - Badges + stats
```

### ✨ ADAPTATIONS MIMO INTÉGRÉES

- ✅ Chemin serpentin (design visual)
- ✅ États exercices visibles (verrouillé/en cours/complété)
- ✅ Dashboard avec vue chapitres
- ✅ Pratique libre avec quiz aléatoires
- ✅ Spaced rep VISIBLE (révisions suggérées du jour)
- ✅ Profil avec badges
- ✅ Statistiques globales

### ✨ NOTRE VALEUR AJOUTÉE (vs Mimo)

- ✨ Journal d'apprentissage (métacognition + verbes Bloom)
- ✨ Portfolio avec autoévaluation (swipe + checkboxes)
- ✨ Offline-first (100% local, zéro serveur)
- ✨ RGPD compliant (données sensibles sécurisées)
- ✨ Zéro dépendances (HTML/CSS/JS pur)
- ✨ Export/Import données (portabilité RGPD)

---

## 🎯 CONCLUSION

Ce cahier des charges v2.0 incorpore **toutes les meilleures pratiques Mimo** tout en conservant nos plus-values pédagogiques et technologiques.

**La plateforme est prête à être développée en 15 jours** avec une excellente expérience utilisateur, une sécurité RGPD garantie, et une véritable valeur pédagogique.

**Commençons! 🚀**

---

**Document généré:** 9 décembre 2025 - 22h50  
**Version:** 2.0 - Complète avec adaptations Mimo  
**Destinataires:** Apprenant + Équipe développement + TFE
