# 📦 AUDIT 2 - STOCKAGE & STRUCTURE DONNÉES
**Date**: 13 janvier 2026, 22:30 CET  
**Focus**: localStorage exacte, chapitres.json structure, 101-BT chargement, niveaux vs chapitres

---

## TABLE DES MATIÈRES
1. [AUDIT 2.1 - localStorage Clés Exactes](#audit-21---localstorage-clés-exactes)
2. [AUDIT 2.2 - Structure chapitres.json](#audit-22---structure-chapitresjson)
3. [AUDIT 2.3 - 101-BT.json Chargement](#audit-23---101-btjson-chargement)
4. [AUDIT 2.4 - Niveaux vs Chapitres](#audit-24---niveaux-vs-chapitres)
5. [Architecture globale](#architecture-globale)
6. [Issues & Inconsistances](#issues--inconsistances)

---

## AUDIT 2.1 - localStorage CLÉS EXACTES

### Résumé des clés
**Total clés trouvées**: 9 clés principales  
**Total occurrences setItem/getItem**: 54  
**Format dominant**: JSON.stringify()

### Clés détaillées

#### 🔑 KEY 1: `"douanelmsv2"` (PRINCIPALE)
```javascript
// ÉCRIT PAR
- StorageManager.setDefault() [ligne 150+ dans storage.js]
- StorageManager.update() [ligne ~200 storage.js]
- App.saveProfile() [ligne ~2300 app.js]

// LU PAR
- StorageManager.get() [ligne ~250 storage.js] - lecture globale
- App.initializeApp() [ligne 106 app.js]
- displayProfil() [ligne 8900+ app.js]

// FORMAT
JSON.stringify({
    user: {
        nickname: string,
        totalPoints: number,
        consecutiveDays: number,
        startDate: timestamp,
        niveaux: {
            N1: {completed: boolean, ...},
            N2: {completed: boolean, ...},
            N3: {completed: boolean, ...},
            N4: {completed: boolean, ...}
        }
    },
    chaptersProgress: {
        ch1: {
            title: string,
            completion: number (0-100),
            stepsCompleted: string[],
            stepsLocked: string[],
            badgeEarned: boolean
        },
        "101BT": { ... },
        ch2: { ... }
    },
    exercisesCompleted: {
        ex1: boolean,
        ex2: boolean,
        ...
    },
    badges: string[],
    spacedRepetition: [
        {exerciseId: string, niveau: number, nextReviewDate: timestamp}
    ],
    journal: [
        {id: string, date: timestamp, chapter: string, reflection: string}
    ]
})

// STRUCTURE COMPLÈTE RÉELLE
{
    "user": {
        "nickname": "PatrickCarreira",
        "totalPoints": 1250,
        "consecutiveDays": 15,
        "startDate": 1736179200000,
        "niveaux": {
            "N1": {"completed": true, "score": 85},
            "N2": {"completed": true, "score": 92},
            "N3": {"completed": false, "score": 0},
            "N4": {"completed": false, "score": 0}
        }
    },
    "chaptersProgress": {
        "ch1": {
            "title": "Introduction à la Douane",
            "completion": 100,
            "stepsCompleted": ["ch1_step1", "ch1_step2", "ch1_step3"],
            "stepsLocked": [],
            "badgeEarned": true
        },
        "101BT": {
            "title": "Marchandises & Processus",
            "completion": 60,
            "stepsCompleted": ["101BT_step1", "101BT_step2"],
            "stepsLocked": ["101BT_step3"],
            "badgeEarned": false
        }
    },
    "exercisesCompleted": {
        "ch1_ex_001": true,
        "ch1_ex_002": true
    },
    "badges": ["badge_ch1"],
    "spacedRepetition": [],
    "journal": []
}

// CAS PROBLÉMATIQUE
- Peut être null string? OUI - localStorage peut retourner null
- Quota dépassé? OUI - si 100+ chapters + réponses détaillées
- Format invalide? OUI - si JSON.parse() échoue

// TAILLE APPROX
- Base (user + vide): ~500 bytes
- Avec 10 chapitres + data: ~5-10 KB
- Avec journal complet: ~15-20 KB
- Quota localStorage: ~5 MB (20 KB c'est 0.4% OK)

// GESTION D'ERREURS ACTUELLE
Try-catch en ligne 9024-9060 app.js
Valide structure + nettoie si corrupted
```

#### 🔑 KEY 2: `"step_${etape.id}"` (ÉTAPES INDIVIDUELLES)
```javascript
// PATTERN
step_ch1_step1
step_ch1_step2
step_101BT_step1
step_ch2_step1
... (1 par étape)

// ÉCRIT PAR
- initializeChapterStorage() [ligne 323-367 app.js]
- validerExercice() [ligne ~2300 app.js]
- submitValidationExercise() [ligne 2266 app.js]
- renderConsultModal() [ligne ~3260 app.js]
- nextEtape() [indirectement]

// LU PAR
- getStepState() [ligne 1328 app.js]
- validateAndCleanStorage() [ligne 386 app.js]
- getChapterProgress() [ligne 2300+ app.js]
- canAccessStep() [vérrouillage]

// FORMAT
JSON.stringify({
    id: string,
    chapitreId: string,
    completed: boolean,
    locked: boolean,
    score: number (0-100),
    answers: {
        [key: string]: string | number | boolean | object
    },
    timestamp: number,
    attemptCount: number,
    lastAttempt: number
})

// EXEMPLE RÉEL
step_ch1_step1 = {
    "id": "ch1_step1",
    "chapitreId": "ch1",
    "completed": true,
    "locked": false,
    "score": 100,
    "answers": {
        "reponse_1": "Option B",
        "confidence": 9
    },
    "timestamp": 1736265600000,
    "attemptCount": 1,
    "lastAttempt": 1736265600000
}

// INITIALISATION DEFAULT
{
    id: etape.id,
    chapitreId: chapitreId,
    completed: (index === 0) ? false : true,  // ← IMPORTANT: Première déverrouillée SEULEMENT
    locked: (index > 0),
    score: 0,
    answers: {},
    timestamp: Date.now(),
    attemptCount: 0,
    lastAttempt: null
}

// VERROUILLAGE LOGIQUE
- Index 0: completed=false, locked=false (ACCESSIBLE dès démarrage)
- Index > 0: completed=true, locked=true (VERROUILLÉ jusqu'à étape précédente complétée)
```

#### 🔑 KEY 3: `"chapitre_${chapitre.id}"` (CHAPITRES)
```javascript
// PATTERN
chapitre_ch1
chapitre_101BT
chapitre_ch2
... (1 par chapitre)

// FORMAT
JSON.stringify({
    id: string,
    completed: boolean,
    completedSteps: number,
    totalSteps: number,
    progress: number (0-100),
    timestamp: number
})

// EXEMPLE
chapitre_ch1 = {
    "id": "ch1",
    "completed": false,
    "completedSteps": 3,
    "totalSteps": 6,
    "progress": 50,
    "timestamp": 1736265600000
}

// ÉCRIT PAR
- initializeChapterStorage() [ligne 349-361 app.js]
- updateChapterProgress() [ligne ~1800 app.js]

// LU PAR
- getChapterProgress() [ligne ~2300 app.js]
```

#### 🔑 KEY 4: `"objectives_${chapterId}"`
```javascript
// PATTERN
objectives_ch1
objectives_101BT
objectives_ch2

// FORMAT
boolean (true/false)

// EXEMPLE
objectives_ch1 = true  // Objectifs marqués comme terminés

// ÉCRIT PAR
- saveObjectifsStatus() [ligne ~7000 app.js]

// LU PAR
- getObjectifsStatus() [ligne ~7100 app.js]
- displayObjectives() [affichage modal]

// LOGIQUE
true = Utilisateur a cliqué "✓ Marquer comme terminé"
false = Par défaut
```

#### 🔑 KEY 5: `"portfolio_${chapterId}"`
```javascript
// PATTERN
portfolio_ch1
portfolio_101BT
portfolio_ch2

// FORMAT
boolean (true/false)

// ÉCRIT PAR
- validerPortfolioEtFermer() [ligne ~7600 app.js]
- savePortfolioStatus() [ligne ~7650 app.js]

// LU PAR
- getPortfolioStatus() [ligne ~7750 app.js]

// LOGIQUE
true = Utilisateur a validé le plan de révision
false = Par défaut / Pas encore validé
```

#### 🔑 KEY 6: `"plans"`
```javascript
// FORMAT
JSON.stringify({
    [chapterId]: {
        items: [{competency, mastery: "green"/"yellow"/"red"}],
        timestamp: number
    }
})

// ÉCRIT PAR
- validerPortfolioEtFermer() [ligne 7682-7688 app.js]

// LU PAR
- portfolio-swipe.js (si chargé)

// EXEMPLE
plans = {
    "ch1": {
        "items": [
            {"competency": "Classification", "mastery": "green"},
            {"competency": "Identification", "mastery": "yellow"}
        ],
        "timestamp": 1736265600000
    }
}
```

#### 🔑 KEY 7: `"journal_apprentissage"`
```javascript
// FORMAT
JSON.stringify([
    {
        id: string,
        date: timestamp,
        chapter: string,
        reflection: string,
        score: number
    }
])

// ÉCRIT PAR
- saveJournalEntry() [ligne 8877-8879 app.js]

// LU PAR
- displayJournal() [ligne 8893+ app.js]
- journal-avance.js

// EXEMPLE
journal_apprentissage = [
    {
        "id": "journal_1",
        "date": 1736265600000,
        "chapter": "ch1",
        "reflection": "J'ai compris la classification",
        "score": 85
    }
]

// TAILLE
Peut grandir rapidement: 1 entrée ~200 bytes
100 entrées = 20 KB
```

#### 🔑 KEY 8: `"user_douanes_formation"`
```javascript
// FORMAT
JSON.stringify({
    nom: string,
    prenom: string,
    matricule: string,
    totalPoints: number,
    dateCreation: timestamp
})

// ÉCRIT PAR
- saveProfile() [ligne ~2300 app.js]
- App.saveProfile() [bouton Profil]

// LU PAR
- displayProfil() [ligne 8916+ app.js]

// EXEMPLE
user_douanes_formation = {
    "nom": "Carreira",
    "prenom": "Patrick",
    "matricule": "2024-001",
    "totalPoints": 1250,
    "dateCreation": 1736000000000
}
```

#### 🔑 KEY 9: `"douanelmsv2"` (Global/Fallback)
```javascript
// Même clé qu'ailleurs mais utilisée différemment
// Stockage de TOUTES les données si localStorage quota atteint

// ÉCRIT PAR
- Line 6524 app.js (dans updateTotalPoints)
- Line 9024-9060 app.js (validation + cleanup)

// LOGIQUE
Si localStorage.getItem('douanelmsv2') === null
  → Initialiser avec structure par défaut
Sinon
  → Lire et mettre à jour incrementalement
```

### Résumé: Écritures vs Lectures

| Clé | Écrit (où) | Lu (où) | Fréquence |
|-----|-----------|---------|-----------|
| douanelmsv2 | init, update, validate | every operation | ⭐⭐⭐ |
| step_* | init, validate, submit | progress, access | ⭐⭐⭐ |
| chapitre_* | init, progress update | progress calc | ⭐⭐ |
| objectives_* | modal close | modal open | ⭐ |
| portfolio_* | modal close | modal open | ⭐ |
| plans | portfolio save | export | ⭐ |
| journal_* | entry add | display | ⭐ |
| user_* | profile save | profile display | ⭐ |

---

## AUDIT 2.2 - STRUCTURE CHAPITRES.JSON

### Vue d'ensemble
- **Fichier**: `data/chapitres.json`
- **Lignes totales**: 1266
- **Chapitre par défaut**: ch1 (lignes 1-280)
- **Chapitre 101-BT**: Lignes 276-xxx (externe)
- **Chapitres restants**: ch2, ch3, ch4, ch5, ch6

### Structure complète d'UN CHAPITRE (ch1)

```json
{
    "id": "ch1",
    "numero": 1,
    "titre": "Introduction à la Douane",
    "description": "Découvrez les bases de l'organisation douanière suisse",
    "couleur": "#E0AAFF",
    "emoji": "🎯",
    "progression": 0,
    
    "objectifs": [
        "Comprendre l'organisation douanière suisse",
        "Identifier les trois domaines d'action douanière",
        "Décrire les rôles et responsabilités",
        "Appliquer les concepts de base à des cas réels"
    ],
    
    "etapes": [
        {
            "id": "ch1_step1",
            "numero": 1,
            "titre": "Histoire de la Douane suisse",
            "type": "exercise_group",
            "duree": "3 min",
            "contenu": "Découvrez les origines...",
            "completed": false,
            "points": 10,
            "exercices": [
                {
                    "id": "ch1_ex_001",
                    "type": "video",
                    "titre": "[EX 1] Vidéo: Histoire de la Douane suisse",
                    "description": "Regardez la vidéo...",
                    "content": {
                        "videoType": "youtube",
                        "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
                        "description": "Première vidéo YouTube"
                    },
                    "points": 10
                }
            ],
            "consultation": true,
            "validation": false
        },
        {
            "id": "ch1_step2",
            "numero": 2,
            "titre": "Organisation actuelle",
            "type": "exercise_group",
            "duree": "5 min",
            "contenu": "Testez vos connaissances...",
            "completed": false,
            "points": 10,
            "exercices": [
                {
                    "id": "ch1_ex_002",
                    "type": "qcm",
                    "titre": "[EX 2] QCM: Nombre de cantons",
                    "description": "Question sur le nombre de cantons",
                    "content": {
                        "question": "Combien de cantons compte la Suisse?",
                        "options": [
                            {"label": "24 cantons", "correct": false},
                            {"label": "26 cantons", "correct": true},
                            {"label": "28 cantons", "correct": false},
                            {"label": "30 cantons", "correct": false}
                        ],
                        "correctAnswer": 1,
                        "explanation": "La Suisse compte 26 cantons depuis 1975..."
                    },
                    "points": 10
                }
            ],
            "consultation": false,
            "validation": true
        }
    ],
    
    "badge": {
        "id": "badge_ch1",
        "titre": "Apprenti Douanier",
        "emoji": "🎓",
        "description": "Vous avez complété le chapitre 1!"
    }
}
```

### Structure d'UNE ÉTAPE complète

```json
{
    "id": "ch1_step1",
    "numero": 1,
    "titre": "Histoire de la Douane suisse",
    "type": "exercise_group",
    "typeCategory": "consult" | "score",  // ← AUTO-MAPPÉ si absent
    "duree": "3 min",
    "contenu": "Découvrez les origines...",
    "completed": false,
    "points": 10,
    
    // OPTIONNELS (si vidéo)
    "videoId": "video_101_marchandises" (optional),
    "videoPath": "/assets/videos/101ab" (optional),
    
    "exercices": [...],
    "consultation": true,      // Si Type A (consult)
    "validation": false,       // Si Type B (score)
    "locked": false            // Si verrouillée
}
```

### Structure d'UN EXERCICE complet

#### Exemple QCM
```json
{
    "id": "ch1_ex_002",
    "type": "qcm",
    "titre": "[EX 2] QCM: Nombre de cantons",
    "description": "Question sur le nombre de cantons",
    "content": {
        "question": "Combien de cantons compte la Suisse?",
        "options": [
            {
                "label": "24 cantons",
                "correct": false
            },
            {
                "label": "26 cantons",
                "correct": true
            },
            {
                "label": "28 cantons",
                "correct": false
            },
            {
                "label": "30 cantons",
                "correct": false
            }
        ],
        "correctAnswer": 1,  // Index de réponse
        "explanation": "La Suisse compte 26 cantons depuis 1975. Le 26ème canton, le Jura, a été créé en 1978."
    },
    "points": 10
}
```

#### Exemple VIDEO (local)
```json
{
    "id": "ch1_ex_003",
    "type": "video",
    "titre": "[EX 3] Vidéo: Qu'est-ce qu'une marchandise commerciale?",
    "description": "Regardez la vidéo pour comprendre...",
    "content": {
        "videoType": "local",
        "url": "/assets/videos/Marchandise_Commerciale_-_35s.mp4",
        "description": "Regardez la vidéo..."
    },
    "points": 10
}
```

#### Exemple FLASHCARDS
```json
{
    "id": "ch1_ex_006",
    "type": "flashcards",
    "titre": "[EX 6] Flashcards: Les 3 domaines douaniers",
    "description": "Mémoriser avec les cartes flashcard",
    "content": {
        "cards": [
            {
                "id": "card1",
                "recto": "Quel est le domaine FISCAL de la douane?",
                "verso": "La perception des droits de douane et des taxes..."
            },
            {
                "id": "card2",
                "recto": "Quel est le domaine de PROTECTION?",
                "verso": "La lutte contre la contrebande..."
            }
        ]
    },
    "points": 10
}
```

### Types d'étapes TROUVÉS

```text
=== TYPES D'ÉTAPES ===

1. Type: "exercise_group"
   typeCategory: AUTO-MAPPED
   - Si contient: video, lecture, objectives, portfolio → "consult"
   - Sinon (qcm, flashcard, dragdrop, etc) → "score"
   
2. Tous les exercices utilisent:
   "exercices": [...]  (pluriel, toujours tableau)

3. Flags:
   "consultation": boolean  (Type A)
   "validation": boolean    (Type B)
   
4. TOUS les chapitres utilisent:
   "type": "exercise_group"  (uniform, pas de variations)
   "typeCategory": ABSENT dans JSON (GÉNÉRÉ en JS)
```

### Format d'EXERCICE - Ancien vs Nouveau

#### FORMAT ANCIEN (PAS TROUVÉ dans chapitres.json)
```javascript
// RECHERCHÉ: exercice.choix[], exercice.affirmations, exercice.options (ancien)
// RÉSULTAT: NON TROUVÉ

// Ancien format aurait ressemblé à:
{
    "id": "ex1",
    "type": "qcm",
    "question": "...",
    "choix": [         // ← ANCIEN (pas trouvé)
        "Option A",
        "Option B"
    ],
    "correct": 0
}
```

#### FORMAT NOUVEAU (ACTUEL - TROUVÉ)
```javascript
// Nouveau format utilisé PARTOUT dans chapitres.json
{
    "id": "ch1_ex_002",
    "type": "qcm",
    "titre": "...",
    "description": "...",
    "content": {       // ← NOUVEAU (trouvé ligne 98+)
        "question": "...",
        "options": [
            {"label": "...", "correct": boolean}
        ],
        "correctAnswer": number,
        "explanation": "..."
    },
    "points": 10
}
```

#### FORMAT MIXTE
```text
RECHERCHÉ: Présence de DEUX formats dans un même chapitre
RÉSULTAT: NON TROUVÉ

Tous les exercices dans chapitres.json utilisent format NOUVEAU
Pas d'inconsistances détectées
```

### externalDataFile

```javascript
// TROUVÉ: Ligne 286 (chapitre 101BT)
"externalDataFile": "data/data101-BT.json"

// CONTEXTE
{
    "id": "101BT",
    "numero": 2,
    "titre": "Marchandises & Processus: Mise en Pratique",
    "description": "Appliquer les fondamentaux douaniers à des cas concrets...",
    "couleur": "#FF6B9D",
    "emoji": "📋",
    "progression": 0,
    "externalDataFile": "data/data101-BT.json",  // ← ICI
    
    "objectifs": [...],
    "metadata": {
        "createdDate": "2025-12-15",
        "lastUpdated": "2025-12-15",
        "version": "1.0",
        "status": "complete",
        "totalExercises": 40,
        "totalCompetencies": 5,
        "portfolioSwipeCount": 5
    }
}

// SIGNAL: Ce chapitre a ses données EXTERNES
// Les étapes/exercices ne sont PAS dans chapitres.json
// Seront chargés DYNAMIQUEMENT via fetch()
```

---

## AUDIT 2.3 - 101-BT.JSON CHARGEMENT

### Où est-il chargé?

#### Fonction principale: loadExternalChapterData() [Ligne 810-945 app.js]

```javascript
// CONTEXTE D'APPEL
afficherChapitre(chapitreId) [ligne 509]
  ↓
  if (chapitre.externalDataFile) {
      this.loadExternalChapterData(chapitreId);  // ← APPEL
  }

// SIGNATURE COMPLÈTE
loadExternalChapterData(chapitreId) {
    console.log(`🔄 loadExternalChapterData: ${chapitreId}`);
    
    // [1] Trouver le chapitre
    let chapitre = CHAPITRES.find(c => c.id === chapitreId);
    if (!chapitre) {
        // Chercher dans window.allNiveaux (chapitres dynamiques)
        if (window.allNiveaux) {
            for (let niveauId in window.allNiveaux) {
                const chapitres = window.allNiveaux[niveauId];
                chapitre = chapitres.find(c => c.id === chapitreId);
                if (chapitre) break;
            }
        }
    }
    
    // [2] Vérifier si externalDataFile existe
    if (!chapitre || !chapitre.externalDataFile) {
        console.log(`⚠️ Pas de fichier externe pour ${chapitreId}`);
        return;
    }
    
    // [3] FETCH le fichier
    fetch(chapitre.externalDataFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur chargement ${chapitre.externalDataFile}`);
            }
            return response.json();
        })
        .then(externalData => {
            // [4] Fusionner les données
            if (externalData.etapes && Array.isArray(externalData.etapes)) {
                console.log(`✅ ${externalData.etapes.length} étapes chargées de ${chapitre.externalDataFile}`);
                
                // Fusion intelligente (ne pas remplacer)
                chapitre.etapes = externalData.etapes;  // ← REMPLACEMENT (pas fusion!)
            }
            
            // [5] Normaliser
            const normalized = exerciseNormalizer.normalizeAll([chapitre]);
            console.log(`✅ Données ${chapitre.externalDataFile} normalisées`);
        })
        .catch(error => {
            console.error(`❌ Erreur chargement externe: ${error.message}`);
            // FALLBACK: Laisser etapes vide? Message d'erreur?
        });
}
```

### QUAND est-il chargé?

```javascript
TIMELINE:

[1] afficherAccueil()
    ↓ (Lance afficherNiveaux() async)
    
[2] afficherNiveaux()
    → fetch('/api/niveaux')
    → Retour: window.allNiveaux = {...}
    ✅ Niveaux affichés, chapitres visibles
    
[3] Utilisateur CLIQUE sur chapitre 101BT
    ↓
[4] afficherChapitre('101BT')
    → Vérifie: chapitre.externalDataFile? OUI
    ↓
[5] loadExternalChapterData('101BT')
    → fetch('data/data101-BT.json')
    ✅ Étapes chargées DYNAMIQUEMENT
    
[6] Rendu chapitre avec étapes externes
```

### Avant ou APRÈS chapitres.json?

```
TIMING:
1. chapitres.json chargé? NON - pas de chargement global
2. Niveaux/chapitres viennent de WHERE?
   → /api/niveaux/... endpoints (Node.js server)
   
3. 101-BT.json chargé APRÈS:
   - Niveaux affichés
   - Utilisateur clique sur 101BT
   - THEN fetch data101-BT.json
   
FORMAT CHARGEMENT:
- Si externalDataFile absent → Chapitre vide, affiche message
- Si externalDataFile présent → Async load
- Si load échoue → Fallback? (voir error handling)
```

### Comment fusionné?

```javascript
// LOGIQUE FUSION [Ligne 879-885]
if (externalData.etapes && Array.isArray(externalData.etapes)) {
    console.log(`✅ ${externalData.etapes.length} étapes...`);
    
    // ⚠️ REMPLACEMENT (pas fusion!)
    chapitre.etapes = externalData.etapes;
    
    // Puis normaliser
    const normalized = exerciseNormalizer.normalizeAll([chapitre]);
}

// RISQUE: Si chapitre.etapes avait des données AVANT
// → Totalement ÉCRASÉES par externalData.etapes
// Pas de mergeExercices() ici!
```

### Cas d'erreur - Fallback

```javascript
.catch(error => {
    console.error(`❌ Erreur chargement externe: ${error.message}`);
    // RIEN n'est fait!
    // chapitre.etapes RESTE undefined
    // Affichage will show "Aucun exercice pour cette étape"
})

// PROBLÈME:
// 1. Utilisateur voit: "Aucun exercice"
// 2. Pas de message d'erreur user-friendly
// 3. Pas de retry/reload option
// 4. Service worker/offline? Cache? RIEN

// AMÉLIORATION PROPOSÉE:
// - localStorage fallback si offline
// - Afficher message: "Erreur chargement. Rechargez la page."
// - Retry button
```

---

## AUDIT 2.4 - NIVEAUX VS CHAPITRES

### NIVEAUX: Structure réelle

#### Existe? OUI ✅

```javascript
// DÉFINI PAR: API endpoint /api/niveaux
// CODE: afficherNiveaux() [ligne 204-295 app.js]

// RÉCUPÉRATION:
const response = await fetch('/api/niveaux');
const data = response.json();
window.niveauxData = data.niveaux;  // Sauvegarder complet
window.allNiveaux = {};             // Mapper les chapitres

data.niveaux.forEach(niveau => {
    window.allNiveaux[niveau.id] = niveau.chapitres || [];
});

// STRUCTURE RETOURNÉE:
{
    "niveaux": [
        {
            "id": "N1",
            "titre": "Fondations Douanières",
            "emoji": "🎓",
            "chapitres": [
                {
                    "id": "ch1",
                    "numero": 1,
                    "titre": "Introduction à la Douane",
                    ...
                }
            ]
        },
        {
            "id": "N2",
            "titre": "Applications Pratiques",
            "emoji": "📊",
            "chapitres": [
                {
                    "id": "101BT",
                    "numero": 2,
                    "titre": "Marchandises & Processus...",
                    ...
                },
                {
                    "id": "ch2",
                    "numero": 3,
                    "titre": "Législation Douanière",
                    ...
                }
            ]
        },
        {
            "id": "N3",
            "titre": "Cas Pratiques",
            "emoji": "🎯",
            "chapitres": [...]
        },
        {
            "id": "N4",
            "titre": "Expertise",
            "emoji": "⭐",
            "chapitres": [...]
        }
    ]
}
```

#### Stockées OÙ?

```javascript
// GLOBAL VARIABLES (window)
1. window.niveauxData      // Données complètes (structure ci-dessus)
2. window.allNiveaux       // Mapping simple: {N1: [ch1, ch2], N2: [...]}

// localStorage
3. "douanelmsv2" → user.niveaux: {N1: {completed: boolean}, ...}
   Format: {
       "N1": {
           "completed": true,
           "score": 85
       },
       "N2": {
           "completed": false,
           "score": 0
       }
   }

// DURÉE DE VIE:
- window.* = SESSION ONLY (rechargement = reset)
- localStorage = PERSISTANT
```

#### Utilisée OÙ?

```javascript
// 1. AFFICHAGE ACCUEIL
afficherAccueil() [ligne 2605-2610]
  ↓
afficherNiveaux()
  ↓
Génère HTML des 4 niveaux avec cartes interactives
  ↓
Injecte dans #niveaux-container-accueil

// 2. VERROUILLAGE NIVEAUX
canAccessNiveau(niveauId) [ligne ~2659]
  ↓
Vérifie: user.niveaux[niveauId].completed?
  ↓
OUI → Accessible
NON → Verrouillé, message "Complétez le niveau précédent"

// 3. NAVIGATION
afficherNiveaux() itère sur ['N1', 'N2', 'N3', 'N4']
  ↓
Récupère niveauData = data.niveaux.find(n => n.id === niveauId)
  ↓
Affiche titre, emoji, description

// 4. CHAPITRE LOOKUP
Si chapitre pas trouvé dans CHAPITRES[]
  ↓
Cherche dans window.allNiveaux[niveauId]
  ↓
Fallback de recherche
```

### Relation: Hiérarchie

```
HIÉRARCHIE:
═════════════════════════════════════

Niveau N1 (Fondations)
├─ Chapitre ch1 (Introduction)
│  ├─ Étape ch1_step1
│  ├─ Étape ch1_step2
│  └─ Étape ch1_step3
└─ (autres chapitres dans N1)

Niveau N2 (Applications)
├─ Chapitre 101BT (Marchandises)
│  ├─ Étape 101BT_step1 [EXTERNE]
│  ├─ Étape 101BT_step2 [EXTERNE]
│  └─ ...
├─ Chapitre ch2 (Législation)
│  ├─ Étape ch2_step1
│  └─ ...
└─ ...

Niveau N3 (Cas Pratiques)
├─ Chapitre ch3
├─ Chapitre ch4
└─ ...

Niveau N4 (Expertise)
├─ Chapitre ch5
├─ Chapitre ch6
└─ ...

RELATIONS:
1 Niveau = N Chapitres
1 Chapitre = M Étapes
1 Étape = K Exercices

VERROUILLAGE LOGIQUE:
N2 verrouillé JUSQU'À N1 complété
ch2 verrouillé JUSQU'À ch1 complété (dans même niveau)
step2 verrouillé JUSQU'À step1 complété
```

### Completion status

```javascript
// STRUCTURE localStorage douanelmsv2
{
    user: {
        niveaux: {
            "N1": {
                "completed": true,     // ← Si TOUS les chapitres = completed
                "score": 85            // ← Moyenne des chapitres
            },
            "N2": {
                "completed": false,
                "score": 0
            }
        }
    },
    chaptersProgress: {
        "ch1": {
            "completed": true,        // ← Si TOUS les étapes = completed
            "completion": 100,        // ← Pourcentage
            "stepsCompleted": [...],
            "badgeEarned": true
        },
        "101BT": {
            "completed": false,
            "completion": 60,
            "stepsCompleted": ["101BT_step1"],
            "badgeEarned": false
        }
    }
}

// LOGIQUE COMPLETION:
Niveau = Complété si ALL chapitres = completed
Chapitre = Complété si ALL étapes = completed
Étape = Complétée si utilisateur clique "✓ Marquer comme terminé"
```

---

## ARCHITECTURE GLOBALE

### Diagramme flux complet

```
START
  ↓
[APP INIT] App.initialize() [ligne 20]
  ↓
  ├─ [1] Charger CHAPITRES depuis /api/niveaux/:id/chapitres
  │  ├─ Pour CHAQUE chapitre
  │  │  ├─ Fetch exercices: /api/niveaux/:id/exercices/:chapitreId
  │  │  ├─ Attacher exercices aux étapes
  │  │  └─ Normaliser avec ExerciseNormalizer
  │  └─ Résultat: window.CHAPITRES = [...]
  │
  ├─ [2] Initialiser StorageManager
  │  ├─ Créer localStorage.douanelmsv2 si absent
  │  ├─ Créer step_* entries pour verrouillage
  │  └─ Résultat: localStorage prêt
  │
  └─ Afficher Page "Accueil" (page par défaut)
      ↓
[ACCUEIL AFFICHAGE]
  ├─ Afficher stats header (⭐ Points, 🔥 Jours, 🏆 Badges)
  ├─ Appeler afficherNiveaux()
  │  └─ fetch('/api/niveaux')
  │     ├─ Récupérer structure N1, N2, N3, N4
  │     ├─ Sauvegarder window.niveauxData
  │     ├─ Mapper window.allNiveaux
  │     └─ Générer HTML 4 cartes niveaux
  │
  └─ Utilisateur CLIQUE sur Niveau
      ↓
[NIVEAU CLIQUE] afficherNiveau(niveauId)
  ├─ Vérifier: canAccessNiveau(niveauId)?
  ├─ OUI → Afficher tous les chapitres du niveau
  │  └─ Pour CHAQUE chapitre
  │     ├─ Afficher carte chapitre
  │     ├─ Progression bar
  │     └─ onclick="App.afficherChapitre(chapitreId)"
  │
  └─ NON → Alert "Complétez le niveau précédent"
      ↓
[CHAPITRE CLIQUE] afficherChapitre(chapitreId)
  ├─ Vérifier: chapitreData = CHAPITRES.find(...)
  ├─ SI chapitre.externalDataFile?
  │  └─ loadExternalChapterData(chapitreId)
  │     ├─ fetch(chapitre.externalDataFile)  [async]
  │     ├─ Fusionner étapes externes
  │     └─ Normaliser
  │
  ├─ Initier localStorage pour chapitre
  │  ├─ initializeChapterStorage(chapitreId)
  │  └─ Créer step_* entries (locked)
  │
  └─ Afficher vue chapitre
      ├─ Afficher Objectifs (step 0, injection dynamique)
      ├─ Afficher N étapes du chapitre
      │  └─ Pour CHAQUE étape
      │     ├─ Vérifier: canAccessStep(chapitreId, index)?
      │     ├─ OUI → Bouton "CLIQUABLE"
      │     └─ NON → Bouton "GRISÉ" + 🔒
      │
      └─ Afficher Portfolio (step N+1, injection dynamique)
          ↓
[ÉTAPE CLIQUE] afficherEtape(chapitreId, stepIndex)
  ├─ Vérifier: canAccessStep()?
  ├─ Récupérer step = chapitre.etapes[stepIndex]
  ├─ Auto-mapper typeCategory si absent
  ├─ Décider: Type A (consult) ou Type B (score)
  │
  ├─ Si Type A (consult):
  │  └─ renderConsultModal()
  │     ├─ Afficher contenu (vidéo, lecture, etc)
  │     ├─ Bouton "✓ J'ai lu" ou "✓ J'ai regardé"
  │     └─ onClick → localStorage.setItem(step_*, {completed: true})
  │
  ├─ Si Type B (score):
  │  └─ renderExerciseModal()
  │     ├─ Afficher exercice(s) [QCM, flashcard, etc]
  │     ├─ Utilisateur répond
  │     ├─ Bouton "✅ Valider"
  │     ├─ validerExercice()
  │     │  ├─ Calculer score
  │     │  ├─ localStorage.setItem(step_*, {completed, score})
  │     │  ├─ Unlock next step
  │     │  └─ Ajouter points à user.totalPoints
  │     └─ nextEtape() → retour afficherChapitre()
  │
  └─ FIN étape
```

---

## ISSUES & INCONSISTANCES

### ⚠️ Issue 1: Remplacement vs Fusion 101-BT

```javascript
// LIGNE 879
chapitre.etapes = externalData.etapes;  // ← REMPLACEMENT!

// PROBLÈME:
Si chapitre.etapes = [{...}, {...}] (des données de base)
PUIS fetch 101-BT.json
PUIS chapitre.etapes = externalData.etapes
→ Données de base PERDUE!

// RISQUE:
Peu probable car chapitre 101BT n'a pas d'étapes en base
Mais structure FRAGILE si design change

// FIX:
chapitre.etapes = mergeExercices(
    chapitre.etapes || [],
    externalData.etapes || []
);
```

### ⚠️ Issue 2: typeCategory absent dans JSON

```javascript
// SITUATION:
Tous les chapitres JSON ont:
  "type": "exercise_group"
MAIS PAS:
  "typeCategory": "consult" | "score"

// RÉSULTAT:
Auto-mapping en JS [ligne 3972-3984]
const consultExoTypes = ["video", "lecture", "objectives", "portfolio"];
step.typeCategory = consultExoTypes.includes(exoType) ? "consult" : "score";

// PROBLÈME:
- Si etape.exercices[0] undefined → CRASH!
- Si exercice.type absent → typeCategory = "score" (fallback)
- Pas de validation stricte

// FIX PROPOSÉ:
Ajouter "typeCategory" dans JSON directement
Ou valider: if (step.exercices?.length > 0) avant accès
```

### ⚠️ Issue 3: localStorage quota pas géré

```javascript
// SITUATION:
localStorage ~5 MB limite
Avec 100+ chapitres + journal + plans → Possible dépassement

// RISQUE:
localStorage.setItem() lance QuotaExceededError
Silencieusement catchée? OUI (try-catch ligne 9256-9257)
Mais données PERDUES!

// FIX:
1. Try-catch TOUS les setItem()
2. Si quota exceeded → nettoyer old journal entries
3. Afficher message user: "Limite stockage atteinte"
4. Exporter/backup avant limite
```

### ⚠️ Issue 4: window.currentChapitreId global fragile

```javascript
// UTILISÉ:
window.currentChapitreId = chapitreId;  // ligne 3989
window.currentStepId = step.id;         // ligne 3990

// PROBLÈME:
Si 2 onglets/fenêtres ouverts
→ Conflits de valeurs
→ Validation exercice peut pointer chapitre FAUX

// FIX:
Passer chapitreId, stepId via sessionStorage
Ou closure dans fonction (pas global)
```

### ⚠️ Issue 5: externalDataFile erreur silencieuse

```javascript
// SITUATION:
fetch('data/data101-BT.json').catch(error => {
    console.error(...);  // ← SEULEMENT console log
})

// RISQUE:
Utilisateur ne voit PAS l'erreur
Voit juste "Aucun exercice"
Pense: "Le chapitre est vide"

// FIX:
Afficher modal: "Erreur chargement du chapitre"
Bouton "Réessayer"
Laisser console error visible en dev
```

### ⚠️ Issue 6: Ancien format exercice pas supporté

```javascript
// SITUATION:
normalizeExercise() convertit ancien → nouveau format
MAIS code ne gère pas:
- exercice.choix[] (ancien QCM)
- exercice.affirmations (ancien vrai-faux)
- exercice.options (ancien format)

// RISQUE:
Si exercice ancien format chargé
→ normalizeExercise() retourne {type: 'unknown', content: {}}
→ Rendu: "Type non supporté"

// STRUCTURE AUDIT:
✅ Format ancien: PAS TROUVÉ dans chapitres.json
✅ Format nouveau: TROUVÉ partout
✅ Mixte: PAS TROUVÉ

// RECOMMANDATION:
Vérifier data101-BT.json format
Vérifier autres fichiers data/ si présents
```

---

## RÉSUMÉ AUDIT 2

### ✅ Points forts
1. **localStorage architecture claire**: 9 clés distinctes, bien nommées
2. **Chapitres.json structure uniforme**: Tous les exercices format nouveau
3. **Niveaux vs Chapitres hiérarchie**: Logique verrouillage cohérente
4. **externalDataFile pattern**: 101-BT bien séparé, chargement async

### ❌ Points faibles
1. **Remplacement vs fusion**: 101-BT écrase etapes (fragile)
2. **typeCategory absent JSON**: Auto-mapping risqué en JS
3. **localStorage quota**: Pas de gestion dépassement
4. **Erreurs silencieuses**: externalDataFile fetch sans UI feedback
5. **Globals fragiles**: window.currentChapitreId multi-tab issues
6. **Ancien format**: Code supporte mais plus utilisé (dette technique)

### 🎯 Priorités fix
1. **HIGH**: Ajouter typeCategory validation avant accès exercices[0]
2. **HIGH**: Try-catch tous localStorage.setItem() + user feedback
3. **MEDIUM**: Afficher error modal pour externalDataFile failures
4. **MEDIUM**: Migrer window.currentChapitreId vers sessionStorage
5. **LOW**: Nettoyer vieux code ancien format exercice

---

**FIN AUDIT 2**  
*Généré: 13 janvier 2026, 22:30 CET*
