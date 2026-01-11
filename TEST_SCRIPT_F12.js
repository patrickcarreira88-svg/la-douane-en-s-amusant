// ============================================================================
// SCRIPT COMPLET DE TEST CONSULTATION vs VALIDATION
// Copie-colle ENTIÈREMENT en console F12 et appuie sur ENTER
// ============================================================================

console.log('%c🧪 TESTS COMPLETS: CONSULTATION vs VALIDATION', 'font-size: 18px; font-weight: bold; color: #4A3F87; background: #f0f0f0; padding: 10px;');

// ============================================================================
// PRÉ-TEST: VÉRIFIER QUE LES FONCTIONS EXISTENT
// ============================================================================

console.log('\n%c=== PRÉAMBULE: Vérification des fonctions ===', 'font-size: 14px; font-weight: bold; color: white; background: #333;');

const functionsToCheck = [
  'completerEtapeConsultation',
  'validateStepWithThreshold',
  'submitValidationExercise',
  'validerExercice',
  'calculateQCMScore',
  'calculateFlashcardsScore',
  'calculateMatchingScore'
];

let allFunctionsExist = true;
functionsToCheck.forEach(fnName => {
  const exists = typeof window[fnName] === 'function';
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${fnName}: ${typeof window[fnName]}`);
  if (!exists) allFunctionsExist = false;
});

if (!allFunctionsExist) {
  console.error('%c❌ ERREUR: Certaines fonctions n\'existent pas!', 'color: red; font-weight: bold;');
  console.error('Assurez-toi que app.js a été rechargé correctement. Rafraîchis la page (F5) et réessaye.');
  throw new Error('Fonctions manquantes - impossible de continuer');
}

console.log('%c✅ Toutes les fonctions sont présentes!', 'color: green; font-weight: bold;');

// ============================================================================
// TEST 1: FIND CONSULTATION STEPS
// ============================================================================

console.log('\n%c=== TEST 1: TROUVER LES ÉTAPES CONSULTATION (Vidéo) ===', 'font-size: 14px; font-weight: bold; color: white; background: #90EE90;');

const consultationSteps = [];
CHAPITRES.forEach(ch => {
  ch.etapes.forEach((step, idx) => {
    // Détecter type d'étape de plusieurs façons
    let isConsultation = false;
    
    // Cas 1: Types directs
    if (step.type === 'video' || step.type === 'lecture' || step.type === 'objectives' || step.type === 'portfolio') {
      isConsultation = true;
    }
    // Cas 2: exercise_group avec consultation=true
    else if (step.type === 'exercise_group' && step.consultation === true) {
      isConsultation = true;
    }
    // Cas 3: exercise_group sans exercices de validation
    else if (step.type === 'exercise_group' && step.exercices && !step.exercices.some(e => e.type === 'qcm' || e.type === 'quiz')) {
      isConsultation = true;
    }
    
    if (isConsultation) {
      consultationSteps.push({ chapitreId: ch.id, etapeIndex: idx, titre: step.titre, type: step.type });
      console.log(`✅ FOUND: ${ch.id} Étape ${idx} - "${step.titre}" (${step.type})`);
    }
  });
});

if (consultationSteps.length === 0) {
  console.warn('⚠️ Aucune étape CONSULTATION trouvée! Examinons la structure...');
  console.log('📊 Structure détectée:');
  CHAPITRES.slice(0, 1).forEach(ch => {
    console.log(`  Chapitre ${ch.id}:`);
    ch.etapes.forEach((e, i) => {
      console.log(`    Étape ${i}: type=${e.type}, consultation=${e.consultation}, exercices=${e.exercices?.length || 0}`);
      if (e.exercices && e.exercices.length > 0) {
        console.log(`      → Exercices: ${e.exercices.map(ex => ex.type).join(', ')}`);
      }
    });
  });
}

// ============================================================================
// TEST 2: FIND VALIDATION STEPS
// ============================================================================

console.log('\n%c=== TEST 2: TROUVER LES ÉTAPES VALIDATION (QCM) ===', 'font-size: 14px; font-weight: bold; color: white; background: #87CEEB;');

const validationSteps = [];
CHAPITRES.forEach(ch => {
  ch.etapes.forEach((step, idx) => {
    let isValidation = false;
    
    // Cas 1: Types directs
    if (step.type === 'qcm' || step.type === 'quiz' || step.type === 'assessment') {
      isValidation = true;
    }
    // Cas 2: exercise_group avec validation=true
    else if (step.type === 'exercise_group' && step.validation === true) {
      isValidation = true;
    }
    // Cas 3: exercise_group contenant des QCM
    else if (step.type === 'exercise_group' && step.exercices && step.exercices.some(e => e.type === 'qcm' || e.type === 'quiz')) {
      isValidation = true;
    }
    
    if (isValidation && step.exercices?.length > 0) {
      validationSteps.push({ chapitreId: ch.id, etapeIndex: idx, titre: step.titre, exercices: step.exercices.length });
      console.log(`✅ FOUND: ${ch.id} Étape ${idx} - "${step.titre}" (${step.exercices.length} exercices)`);
    }
  });
});

if (validationSteps.length === 0) {
  console.warn('⚠️ Aucune étape VALIDATION trouvée!');
}

// ============================================================================
// HELPER: CHAPTER VERIFICATION
// ============================================================================

function verifyChapter(chapitreId) {
  const chapitre = CHAPITRES.find(c => c.id === chapitreId);
  
  if (!chapitre) {
    console.error(`❌ Chapitre ${chapitreId} non trouvé dans CHAPITRES`);
    return;
  }
  
  // Progressions ne sont initialisées que si déjà testées
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
}

// ============================================================================
// TEST 5: CHAPTER INTEGRITY (INITIAL STATE)
// ============================================================================

console.log('\n%c=== TEST 5: INTÉGRITÉ CHAPITRE (État initial) ===', 'font-size: 14px; font-weight: bold; color: white; background: #FFB6C1;');

// Vérifier seulement les chapitres qui existent
const existingChapitres = CHAPITRES.map(ch => ch.id);
console.log(`Chapitres trouvés: ${existingChapitres.join(', ')}`);

existingChapitres.forEach(chId => verifyChapter(chId));

// ============================================================================
// INSTRUCTIONS POUR L'UTILISATEUR
// ============================================================================

console.log('\n%c🎯 PROCHAINES ÉTAPES POUR LE TEST MANUEL', 'font-size: 14px; font-weight: bold; color: #4A3F87; background: #FFFF99; padding: 10px;');

console.log(`
📋 TEST 1 - CONSULTATION:
   1. Ouvre une étape vidéo:
      App.afficherEtape('${consultationSteps[0]?.chapitreId || 'ch1'}', ${consultationSteps[0]?.etapeIndex || 0});
   
   2. Vérifie l'état AVANT:
      console.log(StorageManager.getEtapeState('${consultationSteps[0]?.chapitreId || 'ch1'}', ${consultationSteps[0]?.etapeIndex || 0}));
   
   3. Clique le bouton "✅ Marquer comme complété" DANS LA MODAL
      Ou en console:
      completerEtapeConsultation('${consultationSteps[0]?.chapitreId || 'ch1'}', ${consultationSteps[0]?.etapeIndex || 0}, {viewed: true});
   
   4. Vérifie l'état APRÈS:
      console.log(StorageManager.getEtapeState('${consultationSteps[0]?.chapitreId || 'ch1'}', ${consultationSteps[0]?.etapeIndex || 0}));
   
   ✅ Expected: completed=true, score=100

📋 TEST 2 - VALIDATION (≥80%):
   1. Ouvre un QCM:
      App.afficherEtape('${validationSteps[0]?.chapitreId || 'ch1'}', ${validationSteps[0]?.etapeIndex || 1});
   
   2. Réponds CORRECTEMENT dans la modal (vise ≥80%)
   
   3. Soumet:
      submitValidationExercise('${validationSteps[0]?.chapitreId || 'ch1'}', ${validationSteps[0]?.etapeIndex || 1});
   
   4. Attends le message de succès: "✅ RÉUSSI!"
   
   ✅ Expected: Étape marquée completed=true, Points gagnés

📋 TEST 3 - VALIDATION REJEU (<80%):
   1. Ouvre UN AUTRE QCM:
      App.afficherEtape('${validationSteps[1]?.chapitreId || 'ch2'}', ${validationSteps[1]?.etapeIndex || 1});
   
   2. Réponds INCORRECTEMENT (<80%)
   
   3. Soumet:
      submitValidationExercise('${validationSteps[1]?.chapitreId || 'ch2'}', ${validationSteps[1]?.etapeIndex || 1});
   
   4. Tu dois voir: "❌ Score insuffisant ... Tentatives restantes: 2/3"
   
   5. Recommence (App.afficherEtape(...)) et réponds CORRECTEMENT cette fois
   
   6. Soumet à nouveau
   
   ✅ Expected: Score ≥80%, attempts=2

📋 TEST 4 - TENTATIVES ÉPUISÉES:
   ⚠️  À faire 3 fois de suite INCORRECTEMENT sur la même étape
   
📋 TEST 5 - VÉRIFIER INTÉGRITÉ:
   verifyChapter('ch1');
   verifyChapter('ch2');
   verifyChapter('ch3');
   
   ✅ Expected:
   - Completion % correct
   - Points accumulés
   - Pas de trous dans progression
   - Tentatives épuisées = BLOQUÉ
`);

console.log('\n%c✅ Setup complet! Tu es prêt à tester manuellement.', 'font-size: 14px; color: green; font-weight: bold; background: #e0ffe0; padding: 10px;');
console.log('%c📌 N\'oublie pas de vérifier les LOGS en console à chaque action!', 'font-size: 12px; color: blue; font-style: italic;');

// ============================================================================
// RÉSUMÉ POUR COPIER-COLLER
// ============================================================================

console.log('\n%c📊 RÉSUMÉ DES RÉSULTATS', 'font-size: 14px; font-weight: bold; color: white; background: #333; padding: 10px;');
console.log(`
Consultation steps found: ${consultationSteps.length}
Validation steps found: ${validationSteps.length}

✅ COMMANDES PRÊTES À COPIER-COLLER:

TEST 1 - CONSULTATION (Étape 0 de ch1):
   completerEtapeConsultation('ch1', 0, {viewed: true});

TEST 2 - VALIDATION (Étape 1 de ch1 - QCM):
   submitValidationExercise('ch1', 1);

TEST 3 - VALIDATION REJEU (Étape 6 de ch1 - Quiz):
   submitValidationExercise('ch1', 6);

À remplir après tests manuels:
TEST 1 CONSULTATION:       [ ✅ ] ou [ ❌ ]
TEST 2 VALIDATION 100%:    [ ✅ ] ou [ ❌ ]
TEST 3 VALIDATION REJEU:   [ ✅ ] ou [ ❌ ]
TEST 4 TENTATIVES 3x:      [ ✅ ] ou [ ❌ ]
TEST 5 INTÉGRITÉ CHAPITRE: [ ✅ ] ou [ ❌ ]
`);

console.log('\n%c🎬 COMMANDES DE NAVIGATION:', 'font-size: 12px; font-weight: bold; color: white; background: #4A3F87; padding: 10px;');
console.log(`
Ouvrir une étape:
  App.afficherEtape('ch1', 0);

Vérifier état avant:
  console.log(StorageManager.getEtapeState('ch1', 0));

Vérifier points totaux:
  console.log(StorageManager.getUser().totalPoints);

Afficher intégrité de ch1:
  verifyChapter('ch1');
`);
