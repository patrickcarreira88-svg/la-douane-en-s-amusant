# 🧪 TESTS CONSULTATION vs VALIDATION

**Date:** 10 janvier 2026  
**Système:** Architecture unifiée CONSULTATION vs VALIDATION

---

## 📋 PRÉ-TEST : Vérifier que les fonctions existent

Copie-colle en console F12:

```javascript
console.log('=== VÉRIFICATION FONCTIONS ===');
console.log('completerEtapeConsultation:', typeof completerEtapeConsultation);
console.log('validateStepWithThreshold:', typeof validateStepWithThreshold);
console.log('submitValidationExercise:', typeof submitValidationExercise);
console.log('validerExercice:', typeof validerExercice);
console.log('');

// Expected: "function" pour chaque ligne
// Si tu vois "undefined" → PROBLÈME ! Signale-le immédiatement.
```

---

## ✅ TEST 1 : CONSULTATION (Vidéo)

### Étape 1a : Trouver une étape CONSULTATION

```javascript
console.log('\n=== TEST 1: FINDING CONSULTATION STEPS ===');
CHAPITRES.forEach(ch => {
  ch.etapes.forEach((step, idx) => {
    if ((step.type === 'video' || step.type === 'lecture') && !step.validation) {
      console.log(`✅ FOUND: ${ch.id} Étape ${idx} - "${step.titre}"`);
    }
  });
});
```

**À faire:** Note le `chapitreId` et `etapeIndex` du résultat.  
Exemple: `ch1` étape `0`

---

### Étape 1b : Ouvrir l'étape

```javascript
// Remplace 'ch1' et 0 par tes vraies valeurs
App.afficherEtape('ch1', 0);
```

**Expected:** Modal s'ouvre avec vidéo + bouton "✅ Marquer comme complété" ✅

---

### Étape 1c : Vérifier localStorage AVANT

```javascript
console.log('\n[BEFORE] État étape:', StorageManager.getEtapeState('ch1', 0));
```

**Expected:** `completed: false` ou `undefined`

---

### Étape 1d : Cliquer sur le bouton DANS la modal OU en console

En **console F12**:

```javascript
completerEtapeConsultation('ch1', 0, { viewed: true });
```

**Expected dans la console:**

```
[📖 CONSULTATION] Complétant étape ch1:0
[✅] Étape ch1:0 marquée COMPLÉTÉE
[🔓] Étape suivante ch1:1 débloquée
```

---

### Étape 1e : Vérifier localStorage APRÈS

```javascript
console.log('[AFTER] État étape:', StorageManager.getEtapeState('ch1', 0));
```

**Expected:** `completed: true, status: "completed", score: 100`

---

### Étape 1f : Naviguer vers l'étape suivante

```javascript
App.afficherEtape('ch1', 1);
```

**Expected:** Pas d'erreur "Étape verrouillée". L'étape suivante s'ouvre. ✅

---

## ✅ TEST 2 : VALIDATION (QCM ≥ 80%)

### Étape 2a : Trouver une étape VALIDATION avec QCM

```javascript
console.log('\n=== TEST 2: FINDING VALIDATION STEPS (QCM) ===');
CHAPITRES.forEach(ch => {
  ch.etapes.forEach((step, idx) => {
    if ((step.type === 'qcm' || step.validation) && step.exercices?.length > 0) {
      console.log(`✅ FOUND: ${ch.id} Étape ${idx} - "${step.titre}" (${step.exercices.length} questions)`);
    }
  });
});
```

**À faire:** Note le `chapitreId` et `etapeIndex`.  
Exemple: `ch1` étape `1`

---

### Étape 2b : Ouvrir l'étape

```javascript
App.afficherEtape('ch1', 1);  // Remplace avec tes valeurs
```

**Expected:** Modal QCM s'ouvre + bouton "🎯 Soumettre réponses" visible ✅

---

### Étape 2c : Répondre CORRECTEMENT

**Dans la modal:** Clique sur les **bonnes réponses** (vise ≥ 80%).

Pour tester rapidement, tu peux aussi faire en console:

```javascript
// Simuler un score de 100%
submitValidationExercise('ch1', 1);
```

**Expected dans la console:**

```
[📤 SUBMIT] Soumettant réponses pour ch1:1
[📊] Score calculé: 100%
[🎯 VALIDATION] Étape ch1:1 | Score: 100%
[💾] Sauvegardé: score=100%, attempts=1, completed=true
[🎉] SUCCÈS! Score 100% ≥ 80%
[💎] +100 points (Total: XXX)
[🔓] Étape suivante ch1:2 débloquée
[📊] Progression chapitre mise à jour
```

---

### Étape 2e : Vérifier localStorage

```javascript
console.log('[AFTER VALIDATION] État QCM:', StorageManager.getEtapeState('ch1', 1));
```

**Expected:**

```javascript
{
  completed: true,
  status: "completed",
  score: 100,
  attempts: 1,
  lastAttemptAt: "2026-01-10T..."
}
```

---

## ✅ TEST 3 : VALIDATION REJEU (Score < 80%)

### Étape 3a : Ouvrir une étape VALIDATION DIFFÉRENTE

```javascript
console.log('\n=== TEST 3: VALIDATION AVEC REJEU ===');
// Utilise une étape différente de TEST 2!
App.afficherEtape('ch2', 1);  // Ajuste selon tes données
```

---

### Étape 3b : Répondre INCORRECTEMENT

**Dans la modal:** Clique les **mauvaises réponses** pour avoir un score < 80%.

Ou en console:

```javascript
// Simuler un score de 60%
// D'abord, tu dois mettre en place le calcul manuel de score
// Pour tester, regarde calculateQCMScore()
```

---

### Étape 3c : Soumettre

```javascript
submitValidationExercise('ch2', 1);
```

**Expected dans la console:**

```
[📤 SUBMIT] Soumettant réponses pour ch2:1
[📊] Score calculé: 60%
[🎯 VALIDATION] Étape ch2:1 | Score: 60%
[💾] Sauvegardé: score=60%, attempts=1, completed=false
[⚠️] ❌ Score insuffisant: 60% < 80%
Tentatives restantes: 2/3
```

---

### Étape 3d : Recommencer

```javascript
App.afficherEtape('ch2', 1);
```

**Expected:** 
- Réponses ne sont PAS pré-remplies (reset)
- Bouton "🎯 Soumettre réponses" visible
- Compteur de tentatives affichage: "2/3" (optionnel)

---

### Étape 3e : Répondre CORRECTEMENT cette fois

**Dans la modal:** Clique les **bonnes réponses** (≥ 80%).

---

### Étape 3f : Soumettre à nouveau

```javascript
submitValidationExercise('ch2', 1);
```

**Expected:**

```
[🎯 VALIDATION] Étape ch2:1 | Score: 90%
[💾] Sauvegardé: score=90%, attempts=2, completed=true
[🎉] SUCCÈS! Score 90% ≥ 80%
[💎] +90 points
[🔓] Étape suivante ch2:2 débloquée
```

---

### Étape 3g : Vérifier localStorage

```javascript
console.log('[AFTER RETRY] État:', StorageManager.getEtapeState('ch2', 1));
```

**Expected:**

```javascript
{
  completed: true,
  score: 90,
  attempts: 2  // ← IMPORTANT: 2, pas 1 !
}
```

---

## ✅ TEST 4 : VALIDATION (3 Tentatives épuisées)

### Étape 4a-4c : Échouer 3 fois de suite

```javascript
console.log('\n=== TEST 4: 3 TENTATIVES ÉPUISÉES ===');

// TENTATIVE 1: Mauvaise réponse
App.afficherEtape('ch3', 2);
// [Réponds mal dans la modal ou simulé]
submitValidationExercise('ch3', 2);  // Score 50%
// Expected: "Tentatives restantes: 2/3"

// TENTATIVE 2: Mauvaise réponse
App.afficherEtape('ch3', 2);
// [Réponds mal]
submitValidationExercise('ch3', 2);  // Score 40%
// Expected: "Tentatives restantes: 1/3"

// TENTATIVE 3: Mauvaise réponse
App.afficherEtape('ch3', 2);
// [Réponds mal]
submitValidationExercise('ch3', 2);  // Score 30%
// Expected: "Tentatives épuisées"
```

**Expected après 3ème tentative:**

```
[⚠️] ❌ Score insuffisant: 30% < 80%
Tentatives épuisées (3). Contactez l'instructeur.
```

---

### Étape 4d : Vérifier localStorage

```javascript
console.log('[AFTER 3 FAILURES] État:', StorageManager.getEtapeState('ch3', 2));
```

**Expected:**

```javascript
{
  completed: false,
  attempts: 3,
  score: 30  // ou le dernier score
}
```

---

### Étape 4e : Bouton "Recommencer" DÉSACTIVÉ ?

```javascript
App.afficherEtape('ch3', 2);
```

**Expected:**
- Bouton "🎯 Soumettre réponses" est **grisé** ou **caché**
- Message: "Tentatives épuisées (3). Contactez l'instructeur."
- ✅ Impossible de continuer sans intervention de l'instructeur

---

## ✅ TEST 5 : INTÉGRITÉ CHAPITRE

Vérifier que la progression du chapitre est correcte après tous les tests.

```javascript
console.log('\n=== TEST 5: CHAPTER INTEGRITY ===');

function verifyChapter(chapitreId) {
  const progress = StorageManager.getChaptersProgress()[chapitreId];
  const chapitre = CHAPITRES.find(c => c.id === chapitreId);

  if (!progress || !chapitre) {
    console.error(`❌ Chapitre ${chapitreId} non trouvé`);
    return;
  }

  console.log(`\n📊 === ${chapitreId} ===`);
  console.log(`Completion: ${progress.completion}%`);
  console.log(`Completed: ${progress.stepsCompleted.length}/${chapitre.etapes.length}`);
  console.log(`Total Points: ${StorageManager.getTotalPoints()}`);

  chapitre.etapes.forEach((step, idx) => {
    const state = StorageManager.getEtapeState(chapitreId, idx);
    const status = state?.completed ? '✅' : '⚡';
    const score = state?.score ? ` (${state.score}%)` : '';
    console.log(`  [${status}] Étape ${idx}: ${step.titre}${score}`);
  });
}

// Tester tous les chapitres
['ch1', 'ch2', 'ch3'].forEach(ch => verifyChapter(ch));
```

**Expected:**

```
📊 === ch1 ===
Completion: 100%
Completed: 3/3
Total Points: 185

  [✅] Étape 0: Vidéo (100%)
  [✅] Étape 1: QCM (100%)
  [✅] Étape 2: Vidéo (100%)

📊 === ch2 ===
Completion: 66%
Completed: 2/3
Total Points: 275

  [✅] Étape 0: Vidéo (100%)
  [✅] Étape 1: QCM (90%)
  [⚡] Étape 2: Quiz (pas encore)

📊 === ch3 ===
Completion: 66%
Completed: 2/3
Total Points: 275

  [✅] Étape 0: Vidéo (100%)
  [✅] Étape 1: Vidéo (100%)
  [⚡] Étape 2: QCM (tentatives épuisées)
```

**Vérifier:**
- ✅ Pas de trous dans la progression (pas d'étapes sautées)
- ✅ Completion % = (stepsCompleted / totalSteps) × 100
- ✅ Points accumulés correctement
- ✅ Tentatives épuisées = BLOQUÉ (⚡)

---

## 📊 RÉSUMÉ

Après avoir exécuté tous les tests, remplis ce tableau:

```
TEST 1 CONSULTATION:         [ ✅ ] ou [ ❌ ]
TEST 2 VALIDATION 100%:      [ ✅ ] ou [ ❌ ]
TEST 3 VALIDATION REJEU:     [ ✅ ] ou [ ❌ ]
TEST 4 TENTATIVES 3x:        [ ✅ ] ou [ ❌ ]
TEST 5 INTÉGRITÉ CHAPITRE:   [ ✅ ] ou [ ❌ ]
```

**À faire après exécution:**

1. ✅ Si tous les tests passent → On peut passer aux ÉTAPES SUIVANTES
2. ❌ Si un test échoue → Envoie-moi:
   - Les logs console (copie-colle des messages d'erreur)
   - Screenshots F12
   - Le résultat de `verifyChapter()`

---

## 🚀 QUICK START (Copie-colle d'un coup)

Tu peux copier-coller TOUT ce script en console F12 d'un coup:

```javascript
// ============================================================================
// SCRIPT COMPLET DE TEST CONSULTATION vs VALIDATION
// Copie-colle entièrement en console F12 et appuie sur ENTER
// ============================================================================

console.log('%c🧪 TESTS CONSULTATION vs VALIDATION', 'font-size: 16px; font-weight: bold; color: #4A3F87;');

// PRÉAMBULE
console.log('\n=== VÉRIFICATION FONCTIONS ===');
console.log('✓ completerEtapeConsultation:', typeof completerEtapeConsultation);
console.log('✓ validateStepWithThreshold:', typeof validateStepWithThreshold);
console.log('✓ submitValidationExercise:', typeof submitValidationExercise);
console.log('✓ validerExercice:', typeof validerExercice);

// TEST 1
console.log('\n%c=== TEST 1: FINDING CONSULTATION ===', 'background: #90EE90; color: black;');
CHAPITRES.forEach(ch => {
  ch.etapes.forEach((step, idx) => {
    if ((step.type === 'video' || step.type === 'lecture') && !step.validation) {
      console.log(`✅ ${ch.id} Étape ${idx}: ${step.titre}`);
    }
  });
});

// TEST 2
console.log('\n%c=== TEST 2: FINDING VALIDATION ===', 'background: #87CEEB; color: black;');
CHAPITRES.forEach(ch => {
  ch.etapes.forEach((step, idx) => {
    if ((step.type === 'qcm' || step.validation) && step.exercices?.length > 0) {
      console.log(`✅ ${ch.id} Étape ${idx}: ${step.titre}`);
    }
  });
});

// TEST 5: INTÉGRITÉ
console.log('\n%c=== TEST 5: CHAPTER INTEGRITY ===', 'background: #FFB6C1; color: black;');
function verifyChapter(chapitreId) {
  const progress = StorageManager.getChaptersProgress()[chapitreId];
  const chapitre = CHAPITRES.find(c => c.id === chapitreId);
  if (!progress || !chapitre) return;
  
  console.log(`\n📊 ${chapitreId}: ${progress.completion}% (${progress.stepsCompleted.length}/${chapitre.etapes.length})`);
  chapitre.etapes.forEach((step, idx) => {
    const state = StorageManager.getEtapeState(chapitreId, idx);
    const status = state?.completed ? '✅' : '⚡';
    console.log(`  [${status}] ${step.titre}`);
  });
}

CHAPITRES.slice(0, 3).forEach(ch => verifyChapter(ch.id));

console.log('\n%c✅ Setup complet!', 'font-size: 14px; color: green; font-weight: bold;');
console.log('👉 Maintenant, teste manuellement avec:');
console.log('   completerEtapeConsultation("ch1", 0, {viewed: true});');
console.log('   submitValidationExercise("ch1", 1);');
```

---

**Lancé le 10 janvier 2026** ✅

