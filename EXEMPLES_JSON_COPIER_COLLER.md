# 📋 EXEMPLES JSON RÉELS - À COPIER-COLLER

## ÉTAPE COMPLÈTE FONCTIONNELLE - CH1 STEP 1 (Vidéo YouTube)

```json
{
  "id": "ch1_step1",
  "numero": 1,
  "titre": "Histoire de la Douane suisse",
  "type": "exercise_group",
  "duree": "3 min",
  "contenu": "Découvrez les origines et l'évolution de la douane suisse",
  "completed": false,
  "points": 10,
  "exercices": [
    {
      "id": "ch1_ex_001",
      "type": "video",
      "titre": "[EX 1] Vidéo: Histoire de la Douane suisse",
      "description": "Regardez la vidéo pour comprendre l'histoire de la douane",
      "content": {
        "videoType": "youtube",
        "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        "description": "Première vidéo YouTube - Me at the zoo (1ere video YouTube de l'histoire)"
      },
      "points": 10
    }
  ],
  "consultation": true,
  "validation": false
}
```

---

## ÉTAPE COMPLÈTE FONCTIONNELLE - CH1 STEP 2 (QCM)

```json
{
  "id": "ch1_step2",
  "numero": 2,
  "titre": "Organisation actuelle",
  "type": "exercise_group",
  "duree": "5 min",
  "contenu": "Testez vos connaissances sur l'organisation de la douane",
  "completed": false,
  "points": 10,
  "exercices": [
    {
      "id": "ch1_ex_002",
      "type": "qcm",
      "titre": "[EX 2] QCM: Nombre de cantons",
      "description": "Question sur le nombre de cantons en Suisse",
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
        "correctAnswer": 1,
        "explanation": "La Suisse compte 26 cantons depuis 1975. Le 26ème canton, le Jura, a été créé en 1978."
      },
      "points": 10
    }
  ],
  "consultation": false,
  "validation": true
}
```

---

## ÉTAPE COMPLÈTE FONCTIONNELLE - CH1 STEP 3 (Vidéo Locale)

```json
{
  "id": "ch1_video1",
  "numero": 3,
  "titre": "Qu'est-ce qu'une marchandise commerciale?",
  "type": "exercise_group",
  "duree": "35 sec",
  "contenu": "Découvrez la définition et les caractéristiques d'une marchandise commerciale",
  "completed": false,
  "points": 10,
  "videoId": "video_101_marchandises",
  "videoPath": "/assets/videos/101ab",
  "exercices": [
    {
      "id": "ch1_ex_003",
      "type": "video",
      "titre": "[EX 3] Vidéo: Qu'est-ce qu'une marchandise commerciale?",
      "description": "Regardez la vidéo pour comprendre la différence entre marchandises commerciales et biens personnels",
      "content": {
        "videoType": "local",
        "url": "/assets/videos/Marchandise_Commerciale_-_35s.mp4",
        "description": "Regardez la vidéo pour comprendre la différence entre marchandises commerciales et biens personnels"
      },
      "points": 10
    }
  ],
  "consultation": true,
  "validation": false
}
```

---

## ÉTAPE COMPLÈTE FONCTIONNELLE - CH1 STEP 5 (Lecture)

```json
{
  "id": "ch1_step3",
  "numero": 5,
  "titre": "Rôles et responsabilités",
  "type": "exercise_group",
  "duree": "7 min",
  "contenu": "Texte explicatif sur les missions de la douane",
  "completed": false,
  "points": 10,
  "exercices": [
    {
      "id": "ch1_ex_005",
      "type": "lecture",
      "titre": "[EX 5] Lecture: Les missions de la douane suisse",
      "description": "Lire le texte explicatif sur les missions",
      "content": {
        "text": "La douane suisse remplit plusieurs missions essentielles:\n\n1. FISCALE: Perception des droits et taxes sur les marchandises importées\n\n2. PROTECTION: Lutte contre la contrebande et le trafic illicite\n\n3. SECURITE: Contrôle des marchandises dangereuses et prohibées\n\n4. STATISTIQUE: Collecte de données sur le commerce international\n\n5. ECONOMIQUE: Facilitation du commerce légitime\n\nCes missions font de la douane un acteur clé dans la gestion des frontières suisses."
      },
      "points": 10
    }
  ],
  "consultation": true,
  "validation": false
}
```

---

## ÉTAPE COMPLÈTE FONCTIONNELLE - CH1 STEP 6 (Flashcards)

```json
{
  "id": "ch1_step4",
  "numero": 6,
  "titre": "Les 3 domaines douaniers",
  "type": "exercise_group",
  "duree": "10 min",
  "contenu": "Mémorisez les 3 domaines principaux",
  "completed": false,
  "points": 10,
  "exercices": [
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
            "verso": "La perception des droits de douane et des taxes sur les marchandises importées"
          },
          {
            "id": "card2",
            "recto": "Quel est le domaine de PROTECTION?",
            "verso": "La lutte contre la contrebande, le trafic et la fraude douanière"
          },
          {
            "id": "card3",
            "recto": "Quel est le domaine de SECURITE?",
            "verso": "Le contrôle des marchandises dangereuses et prohibées pour protéger la population"
          }
        ]
      },
      "points": 10
    }
  ],
  "consultation": true,
  "validation": false
}
```

---

## ÉTAPE COMPLÈTE FONCTIONNELLE - CH1 STEP 8 (QUIZ - FINAL)

```json
{
  "id": "ch1_step5",
  "numero": 8,
  "titre": "Quiz: Maîtrise les bases?",
  "type": "exercise_group",
  "duree": "10 min",
  "contenu": "Quiz final du chapitre 1",
  "completed": false,
  "points": 20,
  "exercices": [
    {
      "id": "ch1_ex_007",
      "type": "quiz",
      "titre": "[EX 7] Quiz: Introduction à la Douane",
      "description": "Répondez aux 3 questions pour valider ce chapitre",
      "content": {
        "questions": [
          {
            "id": "q1",
            "question": "La douane suisse dépend de quel département?",
            "options": [
              "Département de la Justice",
              "Département des Finances",
              "Département de l'Intérieur",
              "Département de la Défense"
            ],
            "correctAnswer": 1,
            "explanation": "La douane suisse est sous l'autorité du Département fédéral des finances (DFF)."
          },
          {
            "id": "q2",
            "question": "Quel est le rôle PRINCIPAL de la douane?",
            "options": [
              "Collecter les taxes et protéger les frontières",
              "Gérer les prisons",
              "Émettre les passeports",
              "Gérer les aéroports"
            ],
            "correctAnswer": 0,
            "explanation": "La douane a pour mission principale de collecter les droits et taxes, et de protéger les frontières suisses."
          },
          {
            "id": "q3",
            "question": "En quelle année la Suisse a-t-elle créé le 26ème canton?",
            "options": [
              "1975",
              "1978",
              "1980",
              "1985"
            ],
            "correctAnswer": 1,
            "explanation": "Le Jura, 26ème canton de la Suisse, a été créé en 1978 par la scission d'une partie du canton de Berne."
          }
        ],
        "scoreMin": 2
      },
      "points": 20
    }
  ],
  "consultation": false,
  "validation": true
}
```

---

## RÉCAPITULATIF - STRUCTURE MINIMALE REQUISE

### Pour TYPE A (Consultation - Pas de validation)

```json
{
  "id": "step_id",
  "numero": 1,
  "titre": "Titre de l'étape",
  "type": "exercise_group",
  "duree": "X min",
  "points": 10,
  "exercices": [
    {
      "id": "ex_001",
      "type": "video|lecture|flashcards",
      "titre": "Titre exercice",
      "description": "Description",
      "content": {
        "videoType": "youtube|local",
        "url": "...",
        "text": "...",
        "cards": [...]
      },
      "points": 10
    }
  ],
  "consultation": true,
  "validation": false
}
```

### Pour TYPE B (Validation - Avec scoring)

```json
{
  "id": "step_id",
  "numero": 2,
  "titre": "Titre de l'étape",
  "type": "exercise_group",
  "duree": "X min",
  "points": 10,
  "exercices": [
    {
      "id": "ex_002",
      "type": "qcm|quiz",
      "titre": "Titre exercice",
      "description": "Description",
      "content": {
        "question": "...",
        "options": [...],
        "correctAnswer": 0,
        "explanation": "...",
        "questions": [...]
      },
      "points": 10
    }
  ],
  "consultation": false,
  "validation": true
}
```

---

## POINTS CLÉS À RETENIR

✅ **TOUJOURS inclure**:
- `id` unique pour exercice ET étape
- `type`: video, qcm, flashcards, lecture, quiz
- `titre`, `description`, `content` complet
- `points` à zéro ou positif
- `consultation` OU `validation` (jamais les deux)

✅ **Pour vidéos YouTube**:
- `videoType: "youtube"`
- `url: "https://www.youtube.com/watch?v=VIDEO_ID"`

✅ **Pour vidéos locales**:
- `videoType: "local"`
- `url: "/assets/videos/filename.mp4"`

✅ **Pour QCM**:
- `correctAnswer: INDEX` (0-based)
- Format `options`: array of {label, correct}

✅ **Pour Quiz**:
- `questions: [...]` array
- Chaque question: `id`, `question`, `options`, `correctAnswer`, `explanation`

---

Copie-colle ces structures directement dans chapitres.json!
