# Guide Formateurs - LMS Brevet Fédéral v2.1

**Document de Référence | Janvier 2026**

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Système](#architecture-système)
3. [Guide d'Utilisation - Apprenant](#guide-dutilisation---apprenant)
4. [Guide d'Utilisation - Formateur](#guide-dutilisation---formateur)
5. [Création d'Exercices](#création-dexercices)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)
8. [Support](#support)

---

## 1. Vue d'Ensemble

### Objectif Pédagogique

Le LMS Brevet Fédéral est une plateforme d'apprentissage interactive conçue pour préparer les candidats à l'examen du Brevet Fédéral en Douane suisse. Le système propose une progression structurée de la découverte à la maîtrise complète des compétences douanières.

### Publics Cibles

- **Candidats au Brevet Fédéral** (tous niveaux)
- **Agents douaniers en formation continue**
- **Formateurs et superviseurs** (administration)

### Résultats Attendus

- Compréhension de l'organisation douanière suisse
- Maîtrise des classifications tarifaires
- Application correcte de la législation douanière
- Pratique des procédures opérationnelles
- **Taux de réussite objectif:** 85%+ à la certification finale

### Caractéristiques Principales

| Aspect | Détail |
|--------|--------|
| **Langues** | Français |
| **Chapitres** | 6 (5 N1 + 1 N2) |
| **Exercices** | 60 (27 N1 + 33 N2) |
| **Types** | 5 (vidéo, lecture, flashcards, QCM, quiz) |
| **Points Totaux** | 420+ |
| **Format** | Web (HTML5/JavaScript) |
| **Stockage** | localStorage (local) |
| **Sauvegarde** | Automatique |

---

## 2. Architecture Système

### Structure Hiérarchique N1-N4

```
NIVEAUX
├── N1: Introduction & Fondamentaux
│   ├── Chapitre 1: Organisation Douanière
│   ├── Chapitre 2: Législation
│   ├── Chapitre 3: Classification
│   ├── Chapitre 4: Procédures
│   └── Chapitre 5: Cas Pratiques
│
├── N2: Spécialisation (101BT)
│   └── Chapitre 1: Brevet Fédéral Technique
│
├── N3: (Réservé pour futures extensions)
└── N4: (Réservé pour futures extensions)
```

### Composants Système

**Backend (Node.js/Express)**
- 15 API routes RESTful
- Gestion des niveaux, chapitres, exercices
- Synchronisation Git optionnelle

**Frontend (JavaScript Vanilla)**
- Interface responsive
- 5 onglets principaux
- localStorage pour persistance

**Stockage Données**
```
/data/
├── N1/
│   ├── chapitres.json (métadonnées)
│   └── exercices/
│       ├── ch1.json (7 exercices)
│       ├── ch2.json (7 exercices)
│       └── ... (ch3-ch5)
│
├── N2/
│   ├── chapitres.json (métadonnées)
│   └── exercices/
│       └── 101BT.json (33 exercices)
│
├── N3/ (vide)
└── N4/ (vide)
```

### Technologie Stack

| Couche | Technologie |
|--------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Base Données** | JSON (fichiers) |
| **Stockage Client** | localStorage |
| **Synchronisation** | Git (optionnel) |
| **Serveur** | Port 5000 (localhost:5000) |

---

## 3. Guide d'Utilisation - Apprenant

### 3.1 Interface Principale

**Accueil (Onglet 1)**
- Vue d'ensemble des chapitres disponibles
- Affichage progression globale (%)
- Accès rapide aux derniers chapitres consulés
- Badges et réalisations obtenus

**Apprentissage (Onglet 2)**
- Navigation par chapitre
- Contenu éducatif (vidéos, lectures)
- Flashcards pour mémorisation
- Sous-sections par étape pédagogique

**Révision (Onglet 3)**
- QCM interactifs
- Quiz de validation
- Correction immédiate
- Tracking des scores

**Journal (Onglet 4)**
- Historique des activités
- Dates de complément par chapitre
- Statistiques personnelles
- Export progression

**Profil (Onglet 5)**
- Paramètres utilisateur
- Réinitialisation progression
- Gestion données locales
- Préférences d'affichage

### 3.2 Indicateurs de Progression

**États Chapitre**

| Symbole | État | Description |
|---------|------|-------------|
| 🔒 | Verrouillé | Prérequis non complétés |
| ⚡ | En Cours | Progression > 0% et < 100% |
| ✅ | Complété | Progression = 100% |

**Étapes Pédagogiques (dans chaque chapitre)**

1. **Diagnostic** - Évaluation de départ
2. **Apprentissage** - Contenus théoriques
3. **Entraînement** - Exercices pratiques
4. **Évaluation** - Validation compétences

### 3.3 Types d'Exercices - Guide Apprenant

#### 📹 Vidéo
- **Durée:** 30s à 2min
- **Action:** Regarder et comprendre
- **Validation:** Automatique (consultation)
- **Points:** 10 par vidéo

**Exemple:** "Qu'est-ce qu'une marchandise commerciale?" (55s)

#### 📖 Lecture
- **Durée:** 3-10 min
- **Action:** Lire attentivement
- **Validation:** Automatique
- **Points:** 10 par lecture

**Exemple:** "Sources du droit douanier" (Constitution, lois, ordonnances)

#### 🎴 Flashcards
- **Format:** Cartes recto-verso
- **Action:** Cliquer pour révéler réponse
- **Durée:** 5-15 min par set
- **Points:** 1 point par carte révisée

**Exemple:** 
```
Recto: "Énumarez les 3 domaines douaniers"
Verso: "1. Commerce 2. Sécurité 3. Fiscalité"
```

#### ❓ QCM (Question à Choix Multiples)
- **Format:** 1 question, 4 options
- **Validation:** Réponse unique exacte
- **Score Requis:** ≥ 80%
- **Tentatives:** Illimitées
- **Points:** 10-20 points

**Exemple:**
```
Q: "Combien de cantons en Suisse?"
A) 24 cantons
B) ✓ 26 cantons
C) 28 cantons  
D) 30 cantons
```

#### 🧪 Quiz
- **Format:** 5+ questions
- **Validation:** Score global ≥ 70%
- **Durée:** 10-20 min
- **Tentatives:** 2 par session
- **Points:** 20-50 points

**Exemple:**
```
Q1: Organisation douanière (1pt)
Q2: Classification tarifaire (2pts)
Q3: Droit applicable (2pts)
Q4: Procédure pratique (5pts)
Score requis: 70% (7/10)
```

### 3.4 Progression et Points

**Accumulation Points**

| Exercice | Points | Cumul 1 Chapitre |
|----------|--------|-------------------|
| 7 Vidéos | 70 | 70 |
| 2 Lectures | 20 | 90 |
| 3 Flashcards | 3 | 93 |
| 1 QCM | 10 | 103 |
| 1 Quiz | 20 | 123 |

**Déblocage Automatique**

- N1 Ch1 → Gratuit (premier chapitre)
- N1 Ch2+ → Débloquer après Ch1 à 100%
- N2 → Débloquer après N1 complète à 100%

**Badges & Certificats**

- 🎓 Apprenti Douanier (Ch1 complété)
- ⚖️ Expert Légal (Ch2 complété)
- 🎯 Spécialiste Classification (Ch3 complété)
- ... (1 badge par chapitre)
- 🏆 Brevet Fédéral (N1 + N2 complétés)

---

## 4. Guide d'Utilisation - Formateur

### 4.1 Accès Outil Auteur

**URL:** `http://localhost:5000/authoring-tool-v2.html`

**Prérequis:**
- Serveur lancé: `npm start` (port 5000)
- Navigateur moderne (Chrome, Firefox, Safari)
- Droits d'accès réseau

### 4.2 Interface Authoring Tool

**Layout Principal:**

```
┌─────────────────────────────────────────────────────┐
│ OUTIL AUTEUR LMS BREVET FÉDÉRAL                    │
├──────────┬──────────────────────────────────────────┤
│ SIDEBAR  │ ZONE ÉDITION PRINCIPALE                  │
│          │                                          │
│ N1       │ ┌──────────────────────────────────────┐ │
│ ├─ ch1   │ │ Chapitre: Introduction à la Douane   │ │
│ ├─ ch2   │ │ ├─ step1: Histoire (7 exercices)    │ │
│ ├─ ch3   │ │ ├─ step2: Organisation (5 ex)       │ │
│ ├─ ch4   │ │ └─ [Nouveau Exercice]                │ │
│ ├─ ch5   │ │                                      │ │
│ │        │ │ [Sauvegarder] [Annuler] [Supprimer] │ │
│ N2       │ └──────────────────────────────────────┘ │
│ ├─ 101BT │                                          │
│ │        │                                          │
│ [+] Nv Ch│                                          │
└──────────┴──────────────────────────────────────────┘
```

### 4.3 Créer un Nouveau Chapitre

**Étapes:**

1. **Accéder Authoring Tool**
   ```
   http://localhost:5000/authoring-tool-v2.html
   ```

2. **Cliquer "[+] Nouveau Chapitre"**

3. **Remplir formulaire:**
   ```
   Niveau: N1
   Titre: "Ma Nouveau Chapitre"
   Description: "Description complète"
   Couleur: "FF5733" (hex color)
   Emoji: "📚" (optionnel)
   Objectifs: (liste, séparés par ;)
   ```

4. **Cliquer "Créer Chapitre"**
   - Crée `/data/N1/chapitres.json` entry
   - Crée `/data/N1/exercices/{chapterId}.json` (vide)
   - Crée 4 étapes par défaut

5. **Vérifier création**
   - Chapitre apparaît dans le sidebar
   - Peut accéder immédiatement

### 4.4 Créer une Étape

**Procédure:**

1. **Sélectionner chapitre** (sidebar)

2. **Cliquer "Ajouter Étape"**

3. **Remplir:**
   ```
   Titre: "Diagnostic Initial"
   Type: "diagnostic|apprentissage|entrainement|evaluation"
   Description: (optionnel)
   ```

4. **Sauvegarder**
   - Ajoute à `chapitre.etapes[]`
   - Réassigne IDs séquentiels

### 4.5 Créer un Exercice

**Procédure Générale:**

1. **Sélectionner:** Niveau → Chapitre → Étape

2. **Cliquer "Ajouter Exercice"**

3. **Choisir Type** (voir section 5)

4. **Remplir Contenu** (dépend du type)

5. **Sauvegarder**
   - Ajoute à `/data/N{level}/exercices/{chapterId}.json`
   - Incrémente compteur exercices

---

## 5. Création d'Exercices

### 5.1 Template Vidéo

**Cas d'Usage:** Contenu vidéo YouTube, Vimeo, ou web

**Formulaire:**

```
Type:        video
Titre:       "Qu'est-ce qu'une marchandise?"
Description: (optionnel)
Points:      10
Content:     {
  videoType: "youtube",  // youtube, vimeo, custom
  url:       "https://www.youtube.com/watch?v=...",
  duration:  "55 sec",
  thumbnail: "url" (optionnel)
}
```

**Validation:** Automatique (juste consulter)

**Exemple JSON Complet:**

```json
{
  "id": "ch1_step1_ex001",
  "type": "video",
  "titre": "Histoire de la Douane suisse",
  "description": "Vidéo introductive sur les origines",
  "content": {
    "videoType": "youtube",
    "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    "duration": "35 sec"
  },
  "points": 10,
  "createdAt": "2026-01-11T10:00:00Z"
}
```

### 5.2 Template Lecture

**Cas d'Usage:** Contenu textuel, articles, explications

**Formulaire:**

```
Type:        lecture
Titre:       "Sources du droit douanier"
Description: "Hiérarchie des normes"
Points:      10
Content:     {
  text:      "Long texte HTML ou markdown...",
  sections:  ["S1", "S2", "S3"],
  duration:  "8 min"
}
```

**Validation:** Automatique

**Exemple JSON:**

```json
{
  "id": "ch2_step1_ex002",
  "type": "lecture",
  "titre": "Cadre légal suisse",
  "content": {
    "text": "<h3>Sources du droit:</h3><ul><li>Constitution fédérale</li><li>Lois fédérales</li><li>Ordonnances</li><li>Traités internationaux</li></ul>",
    "duration": "5 min"
  },
  "points": 10
}
```

### 5.3 Template Flashcards

**Cas d'Usage:** Mémorisation, vocabulaire, définitions

**Formulaire:**

```
Type:        flashcards
Titre:       "Vocabulaire Douanier"
Description: "Termes essentiels"
Points:      1 (par carte)
Content:     {
  cards: [
    {id: "c1", recto: "Q1", verso: "R1"},
    {id: "c2", recto: "Q2", verso: "R2"},
    ...
  ]
}
```

**Validation:** Automatique

**Exemple JSON:**

```json
{
  "id": "ch3_step2_ex005",
  "type": "flashcards",
  "titre": "Classification Tarifaire",
  "content": {
    "cards": [
      {
        "id": "c1",
        "recto": "Énumérez les 5 chiffres du code HS",
        "verso": "1. Chapitre (2)\n2. Position (2)\n3. Sous-position (1)"
      },
      {
        "id": "c2",
        "recto": "Exemple du code HS 6204.62",
        "verso": "Vêtements féminins, tissus synthétiques"
      }
    ]
  },
  "points": 1
}
```

### 5.4 Template QCM

**Cas d'Usage:** Questions simples, validation d'une seule réponse

**Formulaire:**

```
Type:           qcm
Titre:          "Test Compréhension - Cantons"
Points:         10
ScoreMin:       80  // % requis
Content:        {
  question:     "Combien de cantons compte la Suisse?",
  options: [
    {label: "24 cantons", correct: false},
    {label: "26 cantons", correct: true},
    {label: "28 cantons", correct: false},
    {label: "30 cantons", correct: false}
  ],
  correctAnswer: 1,  // Index (0-based)
  explanation: "Depuis 1975..."
}
```

**Validation:** 
- Réponse exacte requise (100%)
- Tentatives illimitées
- Points: 0 ou maximum

**Exemple JSON Complet:**

```json
{
  "id": "ch1_step4_ex010",
  "type": "qcm",
  "titre": "Structure douanière suisse",
  "content": {
    "question": "Quel organisme supervise l'administration douanière?",
    "options": [
      {"label": "Parlement fédéral", "correct": false},
      {"label": "Département des douanes", "correct": true},
      {"label": "Gouvernement cantonal", "correct": false},
      {"label": "Ministère de l'Économie", "correct": false}
    ],
    "correctAnswer": 1,
    "explanation": "L'Administration fédérale des douanes (AFD) relève du Département fédéral des finances (DFF)."
  },
  "points": 10
}
```

### 5.5 Template Quiz

**Cas d'Usage:** Questions multiples, validation d'un score

**Formulaire:**

```
Type:           quiz
Titre:          "Quiz Complet - Législation"
Points:         50
ScoreMin:       70  // % requis (ex: 70% = 7/10 pts)
Content:        {
  questions: [
    {
      question: "Q1",
      options: ["A", "B", "C"],
      correctAnswer: 0,
      points: 2,
      explanation: "..."
    },
    ...
  ],
  passingScore: 70,
  timeLimit: 900  // 15 min (optionnel)
}
```

**Validation:** 
- Score global ≥ passingScore
- Tentatives: 2 par session
- Points partiels possibles

**Exemple JSON Complet:**

```json
{
  "id": "ch2_step4_ex050",
  "type": "quiz",
  "titre": "Validation Législation Douanière",
  "content": {
    "questions": [
      {
        "question": "Citez 3 sources du droit douanier",
        "options": [
          "Constitution, lois, ordonnances",
          "Traités, contrats, accords",
          "Directives, circulaires, notes"
        ],
        "correctAnswer": 0,
        "points": 2,
        "explanation": "La hiérarchie légale: Constitution > Lois > Ordonnances"
      },
      {
        "question": "Classifiez le code HS: 6204.62",
        "options": [
          "Chapître 62: Vêtements",
          "Chapitre 62: Chaussures",
          "Chapitre 64: Vêtements"
        ],
        "correctAnswer": 0,
        "points": 2,
        "explanation": "Position 6204 = Vêtements femme"
      },
      {
        "question": "Valeur en douane = ?",
        "options": [
          "Prix facturé + emballage",
          "Prix au détail",
          "Valeur de remplacement"
        ],
        "correctAnswer": 0,
        "points": 3,
        "explanation": "Selon ACC (Accord sur l'évaluation en douane)"
      }
    ],
    "passingScore": 70
  },
  "points": 50
}
```

### 5.6 Bonnes Pratiques Création

**✅ À Faire**

1. **Titres Clairs**
   ```
   ✅ "QCM: Classification - Code HS 62"
   ❌ "Test 1"
   ```

2. **Explications Détaillées**
   ```
   ✅ "La valeur en douane comprend: prix facturé + emballage"
   ❌ "C'est la bonne réponse"
   ```

3. **Points Appropriés**
   ```
   ✅ Vidéo 10pts, Quiz 50pts
   ❌ Vidéo 100pts
   ```

4. **Contenu Validé**
   - Vérifier exactitude juridique
   - Citer sources légales
   - Tester chaque exercice

5. **Uniformité Format**
   - Longueur similaire par type
   - Termes consistent (ex: "code HS" vs "HS")
   - Même structure dans chaque catégorie

**❌ À Éviter**

1. Erreurs légales ou obsolètes
2. Questions ambiguës ou piégées
3. Trop d'exercices par étape (max 10)
4. Durations non réalistes
5. Points mal calibrés

---

## 6. Troubleshooting

### Problème 1: "Chapitre n'apparaît pas après création"

**Symptômes:**
- Chapitre créé via authoring tool
- N'apparaît pas dans le sidebar
- Erreur console potentielle

**Solutions:**

**Étape 1:** Vérifier le fichier
```powershell
Test-Path "c:\...\data\N1\chapitres.json"
# Doit retourner True
```

**Étape 2:** Vérifier le format JSON
```powershell
$content = Get-Content "data\N1\chapitres.json" | ConvertFrom-Json
# Doit avoir $content.chapitres array
```

**Étape 3:** Vérifier l'API
```
GET http://localhost:5000/api/niveaux/N1/chapitres
# Doit retourner le chapitre créé
```

**Étape 4:** Recharger page
- F5 (refresh navigateur)
- Ctrl+Shift+R (force refresh)
- Vider cache localStorage si nécessaire

### Problème 2: "Exercice ne sauvegarde pas"

**Symptômes:**
- Clique "Sauvegarder"
- Pas d'erreur visible
- Exercice n'apparaît pas après rafraîchissement

**Solutions:**

**Étape 1:** Vérifier backend
```powershell
Get-Process node
# Si aucun processus, serveur n'est pas lancé
# Lancer: npm start
```

**Étape 2:** Vérifier URL API
```javascript
// Console navigateur (F12)
console.log(API_URL);
// Doit afficher: http://localhost:5000/api
```

**Étape 3:** Vérifier réponse API
```
POST http://localhost:5000/api/etape/ch1_step1/exercice
Body: {type: "video", titre: "Test", ...}
# Doit retourner {success: true, ...}
```

**Étape 4:** Vérifier fichier créé
```powershell
cat "data\N1\exercices\ch1.json" | ConvertFrom-Json
# Doit contenir l'exercice créé
```

### Problème 3: "QCM accepte mauvaise réponse"

**Symptômes:**
- QCM avec réponse B correcte
- Système accepte réponse A
- Apprenant confus

**Cause Probable:** Mauvais index `correctAnswer`

**Solution:**

**Vérifie le JSON:**
```json
{
  "type": "qcm",
  "content": {
    "question": "La bonne réponse est B?",
    "options": [
      {"label": "A", "correct": false},
      {"label": "B", "correct": true},     // ← C'est la bonne
      {"label": "C", "correct": false}
    ],
    "correctAnswer": 1    // ← Index (0=A, 1=B, 2=C)
  }
}
```

**Index Mapping:**
```
options[0] = Réponse A → correctAnswer: 0
options[1] = Réponse B → correctAnswer: 1
options[2] = Réponse C → correctAnswer: 2
options[3] = Réponse D → correctAnswer: 3
```

### Problème 4: "Points ne s'accumulent pas"

**Symptômes:**
- Apprenant complète exercice
- Points n'augmentent pas
- localStorage vide

**Solutions:**

**Étape 1:** Vérifier localStorage
```javascript
// Console (F12)
localStorage.getItem('progression');
// Doit retourner objet JSON, pas null
```

**Étape 2:** Vérifier les points dans exercice
```json
{
  "id": "ch1_ex001",
  "points": 10,    // ← Doit être présent et > 0
  "type": "video"
}
```

**Étape 3:** Vérifier type exercice
- Vidéo/Lecture: Points automatiques
- QCM/Quiz: Points si correctAnswer ≥ 80%

**Étape 4:** Réinitialiser si nécessaire
```javascript
// Dans console
localStorage.clear();
location.reload();
// Remet progression à 0
```

### Problème 5: "Authoring tool ne charge pas"

**Symptômes:**
- URL: http://localhost:5000/authoring-tool-v2.html
- Page blanche ou erreur 404
- Console pleine d'erreurs

**Solutions:**

**Étape 1:** Vérifier serveur
```powershell
$resp = Invoke-WebRequest http://localhost:5000/api/niveaux
# Si erreur: serveur ne tourne pas
# Lancer: npm start
```

**Étape 2:** Vérifier fichier existe
```powershell
Test-Path "authoring-tool-v2.html"
# Doit retourner True
```

**Étape 3:** Vérifier console navigateur (F12)
```javascript
// Erreurs réseau?
// Erreurs JavaScript?
// API calls qui échouent?
```

**Étape 4:** Hard refresh
```
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

### Problème 6: "Erreur lors du chargement chapitres"

**Symptômes:**
- App.js s'ouvre mais aucun chapitre
- Console: "Error loading chapitres"
- Onglets vides

**Solutions:**

**Étape 1:** Vérifier API réponse
```javascript
fetch('http://localhost:5000/api/niveaux/N1/chapitres')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))
```

**Étape 2:** Vérifier fichiers données
```powershell
Test-Path "data\N1\chapitres.json"
cat "data\N1\chapitres.json" | ConvertFrom-Json
# Doit contenir array "chapitres"
```

**Étape 3:** Vérifier format JSON
```json
{
  "chapitres": [
    {"id": "ch1", "titre": "...", "etapes": []},
    ...
  ]
}
```

**Étape 4:** Redémarrer serveur
```powershell
Get-Process node | Stop-Process
Start-Sleep 1
npm start
```

---

## 7. Maintenance

### Sauvegarde des Données

**Localisation Fichiers Critiques:**
```
/data/N1/chapitres.json
/data/N1/exercices/*.json
/data/N2/chapitres.json
/data/N2/exercices/*.json
```

**Stratégie Recommandée:**

| Fréquence | Méthode | Destination |
|-----------|---------|-------------|
| Quotidienne | Copie locale | Dossier backup/ |
| Hebdomadaire | Git commit | Repository distant |
| Mensuelle | Archive ZIP | Stockage cloud |

**Script Sauvegarde:**
```powershell
# backup.ps1
$source = "c:\...\data\"
$dest = "c:\...\backup\$(Get-Date -Format 'yyyyMMdd_HHmmss')\"
Copy-Item -Path $source -Destination $dest -Recurse
Write-Host "✅ Backup créé: $dest"
```

### Nettoyage localStorage Apprenant

**Cas d'Usage:** Apprenant veut recommencer depuis 0

**Procédure (pour apprenant):**

1. Ouvrir app.js
2. F12 (ouvrir console développeur)
3. Onglet "Application"
4. localStorage
5. Cliquer sur chaque entrée et supprimer
6. Rafraîchir (F5)

**Résultat:** Progression remise à 0

**Script Automatisé (pour formateur):**
```javascript
// Ouvrir console navigateur (F12) et exécuter:
Object.keys(localStorage).forEach(key => {
  if (key.includes('progression') || key.includes('chapitre')) {
    localStorage.removeItem(key);
  }
});
location.reload();
console.log('✅ localStorage nettoyé');
```

### Mise à Jour Contenu

**Méthode 1: Via Interface (Authoring Tool)**

1. Ouvrir http://localhost:5000/authoring-tool-v2.html
2. Sélectionner exercice à modifier
3. Faire changements
4. Cliquer "Sauvegarder"
5. Fichier JSON mis à jour automatiquement

**Avantages:** Interface visuelle, validation intégrée

**Méthode 2: Édition Directe (JSON)**

1. Éditer `/data/N1/exercices/ch1.json` directement
2. Valider format JSON (commandes ci-dessus)
3. Redémarrer serveur (optionnel)
4. Recharger navigateur

**Avantages:** Modification en masse, batch edits

**Méthode 3: Script Python**

```python
import json

# Charger
with open('data/N1/exercices/ch1.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Modifier
for exercice in data['exercices']:
    if exercice['type'] == 'video':
        exercice['points'] = 15  # Augmenter points vidéos

# Sauvegarder
with open('data/N1/exercices/ch1.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ Modification appliquée")
```

### Monitoring Santé Système

**Vérifications Régulières:**

| Aspect | Commande | Fréquence |
|--------|----------|-----------|
| Serveur | `npm start` → Doit afficher "LANCÉ" | Quotidienne |
| API | `GET /api/niveaux` → Doit avoir 4 niveaux | Quotidienne |
| Fichiers | `ls -la data/` → Tous fichiers présents | Hebdomadaire |
| Points | Vérifier somme total exercices | Mensuelle |
| Git | `git log` → Commits jour-à-jour | Hebdomadaire |

**Script Monitoring:**
```powershell
# health_check.ps1
$health = @{}

# Test 1: Serveur
try {
    $resp = Invoke-WebRequest http://localhost:5000/api/niveaux -ErrorAction Stop
    $health.Server = "✅ OK"
} catch {
    $health.Server = "❌ ERREUR"
}

# Test 2: Données
$niveaux = @('N1', 'N2', 'N3', 'N4')
foreach ($n in $niveaux) {
    $path = "data\$n\chapitres.json"
    if (Test-Path $path) {
        $health."$n" = "✅ OK"
    } else {
        $health."$n" = "❌ MANQUANT"
    }
}

# Afficher résultats
$health | ConvertTo-Json
```

---

## 8. Support

### Documentation Technique

| Document | Contenu |
|----------|---------|
| [TEMPLATE_EXERCICE_UNIVERSEL...md](docs/) | Spécifications complètes types |
| [GUIDE_DEBOGAGE...md](docs/) | Debug troubleshooting détaillé |
| [ÉTAPE_4B_ADAPTATIONS...md](docs/) | Architecture système API |

### Canaux Support

**Email:** support@lms-douane.ch
**Chat:** Slack #lms-support
**Docs Wiki:** https://wiki.internal/lms-brevet
**Tickets:** https://issues.internal/lms

### FAQ Rapide

**Q: Comment ajouter 10 nouveaux exercices?**
A: Via authoring-tool-v2.html → Chapitre → Étape → [+] Exercice × 10

**Q: Les points ne sont pas justes**
A: Vérifier JSON: "points": X et "correctAnswer": index

**Q: Apprenant a perdu sa progression**
A: localStorage supprimé accidentellement. Recréer via authoring.

**Q: Comment exporter toutes les données?**
A: `cp -r data/ data_backup_$(date +%s).zip`

**Q: Serveur ne démarre pas**
A: `npm start` dans dossier projet. Port 5000 libre? `netstat -an | grep 5000`

---

## Conclusion

Ce guide couvre l'utilisation complète du LMS Brevet Fédéral pour formateurs et apprenants. Pour questions spécifiques, consultez la documentation technique ou contactez le support.

**Dernière mise à jour:** 11 janvier 2026  
**Version:** 2.1.0  
**Statut:** Production-Ready ✅

