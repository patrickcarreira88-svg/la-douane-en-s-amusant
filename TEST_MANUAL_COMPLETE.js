// ============================================================================
// SCRIPT COMPLET DE TESTS MANUELS - CONSULTATION vs VALIDATION
// Valide tous les 5 tests avec fonctions globales réutilisables
// ============================================================================

console.log('%c🧪 TESTS MANUELS COMPLETS: CONSULTATION vs VALIDATION', 'font-size: 18px; font-weight: bold; color: #4A3F87; background: #f0f0f0; padding: 10px;');

// ============================================================================
// HELPER FUNCTIONS (GLOBALES)
// ============================================================================

/**
 * Vérifie l'intégrité d'un chapitre (fonction globale)
 */
window.verifyChapter = function(chapitreId) {
  const chapitre = CHAPITRES.find(c => c.id === chapitreId);
  
  if (!chapitre) {
    console.error(`❌ Chapitre ${chapitreId} non trouvé dans CHAPITRES`);
    return;
  }
  
  const allProgress = StorageManager.getChaptersProgress();
  const progress = allProgress?.[chapitreId];
  const totalPoints = StorageManager.getUser()?.totalPoints || 0;

  console.log(`\n📊 === ${chapitreId.toUpperCase()} ===`);
  if (progress) {
    console.log(`   Completion: ${progress.completion}%`);
    console.log(`   Étapes complétées: ${progress.stepsCompleted.length}/${chapitre.etapes.length}`);
  } else {
    console.log(`   Completion: 0% (pas encore testée)`);
    console.log(`   Étapes complétées: 0/${chapitre.etapes.length}`);
  }
  console.log(`   Points totaux: ${totalPoints}`);

  chapitre.etapes.forEach((step, idx) => {
    const state = StorageManager.getEtapeState(chapitreId, idx);
    const completed = state?.completed ? '✅' : '⚡';
    const scoreStr = state?.score !== undefined ? ` (${state.score}%)` : '';
    const attemptsStr = state?.attempts ? ` [${state.attempts}/3]` : '';
    console.log(`   [${completed}] Étape ${idx}: ${step.titre}${scoreStr}${attemptsStr}`);
  });
};

/**
 * Simule un score < 80% (rejeu)
 */
window.testRetryWithLowScore = function(chapitreId, etapeIndex, score = 60) {
  console.log(`\n📋 TEST REJEU - Soumettant score ${score}%...`);
  
  const chapitre = CHAPITRES.find(c => c.id === chapitreId);
  const etape = chapitre?.etapes[etapeIndex];
  
  if (!etape) {
    console.error(`Étape ${chapitreId}:${etapeIndex} non trouvée`);
    return;
  }
  
  // Soumettre via validateStepWithThreshold directement avec score < 80%
  const result = validateStepWithThreshold(chapitreId, etapeIndex, score, { maxPoints: 100 });
  console.log(`Résultat:`, result);
  return result;
};

/**
 * Simule 3 tentatives échouées (épuisement)
 */
window.testExhaustedAttempts = function(chapitreId, etapeIndex) {
  console.log(`\n⚠️ TEST TENTATIVES ÉPUISÉES - 3 tentatives <80%...`);
  
  const results = [];
  for (let i = 1; i <= 3; i++) {
    console.log(`\n📋 Tentative ${i}/3:`);
    const result = validateStepWithThreshold(chapitreId, etapeIndex, 40 + (i * 10), { maxPoints: 100 });
    results.push(result);
    
    if (!result.success || result.passed) {
      console.warn(`⚠️ Test interrompu: étape passée au lieu d'échouer`);
      break;
    }
  }
  
  console.log(`\n📊 Résumé 3 tentatives:`, results);
  return results;
};

/**
 * Affiche l'état d'une étape
 */
window.checkEtapeState = function(chapitreId, etapeIndex) {
  const state = StorageManager.getEtapeState(chapitreId, etapeIndex);
  console.log(`État de ${chapitreId}:${etapeIndex}:`, state);
  return state;
};

/**
 * Affiche les points totaux
 */
window.checkTotalPoints = function() {
  const totalPoints = StorageManager.getUser().totalPoints;
  console.log(`💎 Points totaux: ${totalPoints}`);
  return totalPoints;
};

// ============================================================================
// RÉSUMÉ DES COMMANDES
// ============================================================================

console.log('\n%c✅ FONCTIONS GLOBALES CRÉÉES', 'font-size: 14px; font-weight: bold; color: white; background: #4A3F87; padding: 10px;');
console.log(`
window.verifyChapter(chapitreId)         → Affiche intégrité chapitre
window.testRetryWithLowScore(ch, idx)    → Test rejeu (score < 80%)
window.testExhaustedAttempts(ch, idx)    → Test 3 tentatives épuisées
window.checkEtapeState(ch, idx)          → Vérifier état étape
window.checkTotalPoints()                → Afficher points totaux
`);

console.log('\n%c📊 RÉSUMÉ DE VOS TESTS MANUELS', 'font-size: 14px; font-weight: bold; color: white; background: #333; padding: 10px;');
console.log(`
✅ TEST 1 - CONSULTATION:
   Résultat: SUCCESS ✅
   Commande: completerEtapeConsultation('ch1', 0, {viewed: true});
   Retour: {success: true, message: '✅ Étape de consultation complétée', nextStepUnlocked: true}

✅ TEST 2 - VALIDATION (≥80%):
   Résultat: SUCCESS ✅
   Commande: submitValidationExercise('ch1', 1);
   Score: 100% ✅
   Points gagnés: +100 ✅
   Total points: 345

⚠️ TEST 3 - VALIDATION REJEU (<80%):
   Statut: PARTIELLEMENT TESTÉE
   Observation: Étape 6 verrouillée (accès refusé)
   À faire: testRetryWithLowScore('ch1', 6, 60);

❌ TEST 4 - TENTATIVES ÉPUISÉES:
   Statut: NON TESTÉE
   À faire: testExhaustedAttempts('ch1', 6);

❌ TEST 5 - INTÉGRITÉ CHAPITRE:
   Statut: ERREUR (verifyChapter non défini avant)
   À faire: verifyChapter('ch1');

💎 POINTS APRÈS TESTS:
   Avant: 245
   Après: 545 (+300 points gagnés)
`);

console.log('\n%c🚀 PROCHAINES ÉTAPES', 'font-size: 14px; font-weight: bold; color: white; background: #90EE90; padding: 10px;');
console.log(`
1. Tester REJEU (<80%):
   testRetryWithLowScore('ch1', 6, 60);
   → Expected: Score insuffisant, Tentatives: 2/3

2. Tester TENTATIVES ÉPUISÉES:
   testExhaustedAttempts('ch1', 6);
   → Expected: Tentatives épuisées après 3 échecs

3. Vérifier INTÉGRITÉ:
   verifyChapter('ch1');
   → Affiche completion %, points, état étapes

4. Vérifier POINTS:
   checkTotalPoints();
`);
