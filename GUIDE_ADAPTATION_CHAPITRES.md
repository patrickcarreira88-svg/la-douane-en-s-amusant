# 🔄 Guide Complet d'Adaptation des Chapitres

## 📌 Situation Actuelle

| Chapitre | Format | État | Action Requise |
|----------|--------|------|---|
| **CH1** | Ancien (choix, question, etc.) | ✅ Fonctionne (converti auto) | ⭕ Optionnel: Adapter |
| **CH2** | Ancien (choix, question, etc.) | ✅ Fonctionne (converti auto) | ⭕ Optionnel: Adapter |
| **CH3** | Ancien (choix, question, etc.) | ✅ Fonctionne (converti auto) | ⭕ Optionnel: Adapter |
| **101BT** | Nouveau (content.options, etc.) | ✅ Fonctionne nativement | ✅ Aucune action |

---

## 🛠️ Comment Adapter un Chapitre

### Étape 1 : Localiser le Chapitre

**Fichier**: `data/chapitres.json`  
**Ligne approximative**:
- CH1: Ligne ~25
- CH2: Ligne ~200
- CH3: Ligne ~400

### Étape 2 : Identifier les Exercices à Convertir

Cherchez les patterns:

```json
// ❌ ANCIEN FORMAT (à convertir)
"exercice": {
  "type": "qcm",
  "question": "...",
  "choix": [...]     // ← À remplacer par "content"
}

// ✅ NOUVEAU FORMAT (ne pas toucher)
"exercice": {
  "type": "qcm",
  "content": {       // ← Déjà correct
    "question": "...",
    "options": [...]
  }
}
```

### Étape 3 : Convertir Manuellement

**Utilisez les templates ci-dessous** pour chaque type d'exercice:

---

## 📝 Templates de Conversion par Type

### 1️⃣ QCM

**❌ AVANT:**
```json
{
  "type": "qcm",
  "question": "Combien de cantons?",
  "choix": [
    { "id": "a", "texte": "24", "correct": false },
    { "id": "b", "texte": "26", "correct": true }
  ],
  "explication": "La Suisse compte 26 cantons."
}
```

**✅ APRÈS:**
```json
{
  "type": "qcm",
  "content": {
    "question": "Combien de cantons?",
    "options": [
      "24",
      "26"
    ],
    "correctAnswer": 1,
    "explanation": "La Suisse compte 26 cantons."
  }
}
```

**Règles de conversion:**
- `question` → reste dans `content.question`
- `choix[].texte` → `options[]` (juste le texte, sans les IDs)
- `choix.findIndex(c => c.correct === true)` → `correctAnswer` (index)
- `explication` → `explanation`

---

### 2️⃣ VRAI/FAUX

**❌ AVANT:**
```json
{
  "type": "true_false",
  "affirmations": [
    { "texte": "La douane protège", "correct": true },
    { "texte": "La douane taxe", "correct": true },
    { "texte": "La douane vole", "correct": false }
  ]
}
```

**✅ APRÈS:**
```json
{
  "type": "true_false",
  "content": {
    "items": [
      { "statement": "La douane protège", "answer": true },
      { "statement": "La douane taxe", "answer": true },
      { "statement": "La douane vole", "answer": false }
    ]
  }
}
```

**Règles de conversion:**
- `affirmations` → `content.items`
- `affirmations[].texte` → `items[].statement`
- `affirmations[].correct` → `items[].answer`

---

### 3️⃣ DRAG-DROP

**❌ AVANT:**
```json
{
  "type": "drag_drop",
  "items": [
    { "id": "1", "label": "Présentation", "correctPosition": 0 },
    { "id": "2", "label": "Déclaration", "correctPosition": 1 }
  ]
}
```

**✅ APRÈS:**
```json
{
  "type": "drag_drop",
  "content": {
    "items": [
      { "id": "1", "label": "Présentation", "correctPosition": 0 },
      { "id": "2", "label": "Déclaration", "correctPosition": 1 }
    ]
  }
}
```

**Règles de conversion:**
- `items` → `content.items` (wrapping simple)
- Le contenu reste identique

---

### 4️⃣ MATCHING

**❌ AVANT:**
```json
{
  "type": "matching",
  "paires": [
    { "left": "Fiscal", "right": "Perception des droits" },
    { "left": "Sécurité", "right": "Protection population" }
  ]
}
```

**✅ APRÈS:**
```json
{
  "type": "matching",
  "content": {
    "pairs": [
      { "left": "Fiscal", "right": "Perception des droits" },
      { "left": "Sécurité", "right": "Protection population" }
    ]
  }
}
```

**Règles de conversion:**
- `paires` → `content.pairs` (wrapping simple)
- Le contenu reste identique

---

### 5️⃣ FLASHCARDS

**❌ AVANT:**
```json
{
  "type": "flashcards",
  "cartes": [
    { "id": "c1", "recto": "Fiscal?", "verso": "Droits" },
    { "id": "c2", "recto": "Sécurité?", "verso": "Protection" }
  ]
}
```

**✅ APRÈS:**
```json
{
  "type": "flashcards",
  "content": {
    "cards": [
      { "id": "c1", "recto": "Fiscal?", "verso": "Droits" },
      { "id": "c2", "recto": "Sécurité?", "verso": "Protection" }
    ]
  }
}
```

**Règles de conversion:**
- `cartes` → `content.cards`
- Le contenu reste identique

---

### 6️⃣ LECTURE

**❌ AVANT:**
```json
{
  "type": "lecture",
  "texte": "La douane suisse remplit...\n\n1. Fiscal: ..."
}
```

**✅ APRÈS:**
```json
{
  "type": "lecture",
  "content": {
    "text": "La douane suisse remplit...\n\n1. Fiscal: ..."
  }
}
```

**Règles de conversion:**
- `texte` → `content.text`
- Le contenu reste identique

---

### 7️⃣ LIKERT SCALE

**❌ AVANT:**
```json
{
  "type": "likert_scale",
  "items": [
    { "id": "i1", "texte": "Je comprends la fiscal" },
    { "id": "i2", "texte": "Je comprends la sécurité" }
  ]
}
```

**✅ APRÈS:**
```json
{
  "type": "likert_scale",
  "content": {
    "items": [
      { "id": "i1", "texte": "Je comprends la fiscal" },
      { "id": "i2", "texte": "Je comprends la sécurité" }
    ]
  }
}
```

**Règles de conversion:**
- `items` → `content.items` (wrapping simple)
- Le contenu reste identique

---

### 8️⃣ QUIZ

**❌ AVANT:**
```json
{
  "type": "quiz",
  "questions": [
    {
      "id": "q1",
      "question": "Qui dirige la douane?",
      "choix": [
        { "id": "a", "texte": "Le Parlement", "correct": false },
        { "id": "b", "texte": "Le DEFR", "correct": true }
      ]
    }
  ]
}
```

**✅ APRÈS:**
```json
{
  "type": "quiz",
  "content": {
    "questions": [
      {
        "id": "q1",
        "question": "Qui dirige la douane?",
        "options": [
          "Le Parlement",
          "Le DEFR"
        ],
        "correctAnswer": 1
      }
    ]
  }
}
```

**Règles de conversion:**
- `questions` → `content.questions`
- Chaque question: convertir `choix` comme pour QCM
- `choix[].texte` → `options[]`

---

## 🚀 Procédure d'Adaptation Pas à Pas

### Exemple: CH1, Step 2 (QCM)

**Étape 1**: Ouvrir `chapitres.json` dans VS Code

**Étape 2**: Localiser la section CH1, étape 2:
```json
{
  "id": "ch1_step2",
  "numero": 2,
  "titre": "Organisation actuelle",
  "type": "qcm",
  "exercice": {
    "type": "qcm",
    "question": "Combien de cantons...",
    "choix": [...]
  }
}
```

**Étape 3**: Remplacer la section `exercice` par:
```json
{
  "id": "ch1_step2",
  "numero": 2,
  "titre": "Organisation actuelle",
  "type": "qcm",
  "exercice": {
    "type": "qcm",
    "content": {
      "question": "Combien de cantons...",
      "options": ["24", "26", "28", "30"],
      "correctAnswer": 1,
      "explanation": "La Suisse compte 26 cantons..."
    }
  }
}
```

**Étape 4**: Sauvegarder et tester dans le navigateur

---

## ✅ Validation

### Avant de considérer une conversion terminée:

**Vérification Console (F12)**:
```
✅ Exercice ch1_step2 normalisé: {
  type: 'qcm',
  content: { question: "...", options: [...], ... }
}
```

**Vérification Visuelle**:
- [ ] Question s'affiche correctement
- [ ] Toutes les options/réponses s'affichent
- [ ] Boutons fonctionnent
- [ ] Validation accepte la bonne réponse
- [ ] Points s'ajoutent

---

## 📊 Progression d'Adaptation

### Phase 1: Sans Adaptation (✅ ACTUELLE)
```
Ancien Format → normalizeExercise() → Format Unifié
                  (Automatique)
```
**Avantage**: Fonctionne tout de suite  
**Inconvénient**: Double conversion à chaque chargement

### Phase 2: Adaptation Progressive
```
Ancien Format → Converti manuellement → Stocké unifié
(source)       (une fois)              (base données)
```
**Avantage**: Plus rapide au chargement  
**Inconvénient**: Travail manuel

### Phase 3: Fully Unified
```
Format Unifié → Chargement direct → Aucune conversion
(tous les fichiers)
```
**Avantage**: Architecture nette, optimal  
**Inconvénient**: Nécessite conversion complète

---

## 🎯 Recommandation

**→ Phase 1 (Automatique)** est suffisante pour la production.  
Migrer vers **Phase 2** progressivement quand vous avez le temps.

Utilisez ce guide comme référence si besoin d'adaptation manuelle.

---

## 📞 Troubleshooting

### Problème: JSON invalide après conversion

**Solution**: Utiliser un validateur JSON en ligne  
- https://jsonlint.com/
- Copier/coller la section modifiée
- Corriger les erreurs signalées

### Problème: Exercice ne s'affiche pas

**Solution**: 
1. Ouvrir Console (F12)
2. Chercher ❌ ou erreur rouge
3. Vérifier que le JSON est valide
4. Vérifier que le type d'exercice existe

### Problème: Points non attribués

**Solution**:
- Vérifier que `correctAnswer` ou `correctPosition` est correct
- Tester une réponse correcte dans l'exercice
- Vérifier les logs de validation en Console

---

## 📌 Checklist Finale

- [ ] Lire ce guide en entier
- [ ] Comprendre les 8 types d'exercices
- [ ] Tester conversion manuelle sur 1 exercice
- [ ] Vérifier fonctionnement dans navigateur
- [ ] Adapter autres exercices du même chapitre
- [ ] Tester tous les chaitres (CH1, CH2, CH3)
- [ ] Considérer Phase 2 si nécessaire

---

**Durée estimée**: 2-3 heures pour 3 chapitres × 5 exercices = 15 exercices
