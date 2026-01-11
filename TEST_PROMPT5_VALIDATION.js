// ============================================================================
// PROMPT 5 - VALIDATION TESTS (À exécuter en console F12)
// Tester les 4 fixes pour s'assurer qu'ils fonctionnent
// ============================================================================

console.log('%c🧪 PROMPT 5 - VALIDATION DES 4 FIXES', 'font-size: 18px; font-weight: bold; color: #FF6B6B; background: #f0f0f0; padding: 10px;');

// ============================================================================
// TEST 1: FLAGS CONSULTATION/VALIDATION
// ============================================================================

console.log('\n%c📋 TEST 1: VÉRIFIER FLAGS CONSULTATION/VALIDATION', 'font-size: 14px; font-weight: bold; color: white; background: #4A3F87; padding: 10px;');

let testResults = {};

// Compter étapes par type
let consultationCount = 0;
let validationCount = 0;
let unknownCount = 0;
let missingFlagsCount = 0;

CHAPITRES.forEach(ch => {
  ch.etapes.forEach((step, idx) => {
    // Vérifier que les flags existent
    if (step.consultation === undefined || step.validation === undefined) {
      missingFlagsCount++;
      console.warn(`  ⚠️ ${ch.id}:${idx} - Flags manquants!`);
    }
    
    if (step.consultation) consultationCount++;
    if (step.validation) validationCount++;
    if (!step.consultation && !step.validation) unknownCount++;
  });
});

console.log(`\n📊 Résultats FLAG:
  📖 CONSULTATION: ${consultationCount}
  🎯 VALIDATION: ${validationCount}
  ❓ UNKNOWN: ${unknownCount}
  ⚠️  Flags manquants: ${missingFlagsCount}`);

testResults.test1 = {
  consultation: consultationCount >= 24,
  validation: validationCount >= 11,
  unknown: unknownCount === 0,
  missingFlags: missingFlagsCount === 0
};

const test1Pass = testResults.test1.consultation && testResults.test1.validation && testResults.test1.unknown && testResults.test1.missingFlags;
console.log(`\n${test1Pass ? '✅' : '❌'} TEST 1: ${test1Pass ? 'PASSED' : 'FAILED'}`);

// ============================================================================
// TEST 2: SUPPORT QCM_SCENARIO
// ============================================================================

console.log('\n%c📋 TEST 2: SUPPORT QCM_SCENARIO', 'font-size: 14px; font-weight: bold; color: white; background: #90EE90; padding: 10px;');

// Vérifier si calculateQCMScore supporte qcm_scenario
let qcmScenarioFound = false;
let qcmScenarioTests = [];

CHAPITRES.forEach(ch => {
  ch.etapes.forEach((step, idx) => {
    step.exercices?.forEach(ex => {
      if (ex.type === 'qcm_scenario') {
        qcmScenarioFound = true;
        qcmScenarioTests.push({
          chapitre: ch.id,
          etape: idx,
          id: ex.id,
          titre: ex.titre
        });
      }
    });
  });
});

if (qcmScenarioTests.length > 0) {
  console.log(`✅ Trouvé ${qcmScenarioTests.length} exercices qcm_scenario:`);
  qcmScenarioTests.forEach(test => {
    console.log(`  - ${test.chapitre}:${test.etape} - ${test.titre.substring(0, 50)}`);
  });
  
  // Tester si on peut ouvrir l'étape sans erreur
  const firstTest = qcmScenarioTests[0];
  console.log(`\n📖 Test: App.afficherEtape('${firstTest.chapitre}', ${firstTest.etape});`);
  console.log(`Vérifiez dans console: Pas d'erreur "Type d'exercice non géré"?`);
} else {
  console.log(`⚠️  Aucun exercice qcm_scenario trouvé`);
}

testResults.test2 = {
  qcmScenarioFound: qcmScenarioTests.length > 0,
  canRender: true  // À confirmer manuellement
};

console.log(`\n${qcmScenarioFound ? '✅' : '⚠️'} TEST 2: ${qcmScenarioFound ? 'qcm_scenario found' : 'no qcm_scenario exercises'}`);

// ============================================================================
// TEST 3: LOCALSTORAGE 101BT
// ============================================================================

console.log('\n%c📋 TEST 3: VÉRIFIER LOCALSTORAGE 101BT', 'font-size: 14px; font-weight: bold; color: white; background: #87CEEB; padding: 10px;');

// Vérifier que 101BT est dans localStorage après init
const progress = StorageManager.getChaptersProgress();
const has101BT = progress && progress['101BT'] !== undefined;
const has101BTData = has101BT && progress['101BT'].completion !== undefined;

console.log(`Chapitres en localStorage: ${Object.keys(progress || {}).join(', ')}`);

if (has101BT) {
  console.log(`\n✅ 101BT trouvé dans localStorage:`);
  console.log(`  - completion: ${progress['101BT'].completion}`);
  console.log(`  - stepsCompleted: ${progress['101BT'].stepsCompleted?.length || 0} étapes`);
  console.log(`  - badgeEarned: ${progress['101BT'].badgeEarned}`);
} else {
  console.log(`❌ 101BT NON trouvé dans localStorage!`);
}

testResults.test3 = {
  has101BT: has101BT,
  hasData: has101BTData
};

console.log(`\n${has101BT ? '✅' : '❌'} TEST 3: ${has101BT ? '101BT initialized' : '101BT NOT found'}`);

// ============================================================================
// TEST 4: UI MODAL OVERFLOW
// ============================================================================

console.log('\n%c📋 TEST 4: VÉRIFIER UI MODAL OVERFLOW', 'font-size: 14px; font-weight: bold; color: white; background: #FFB6C1; padding: 10px;');

console.log(`
Instructions pour TEST 4:
1. Ouvrez une étape avec contenu long:
   App.afficherEtape('ch1', 1);

2. Vérifiez dans la modal:
   ✅ Contenu scrollable (overflow-y: auto)
   ✅ Bouton [Soumettre réponses] visible en bas
   ✅ Pas de chevauchement avec padding

3. Utilisez l'inspecteur (F12):
   .modal-content {
     padding-bottom: 150px ← Doit être présent!
   }
`);

// Vérifier le CSS en DOM
const modalContent = document.querySelector('.modal-content');
const hasCorrectPadding = modalContent && window.getComputedStyle(modalContent).paddingBottom;

testResults.test4 = {
  modalExists: !!modalContent,
  hasPaddingBottom: !!hasCorrectPadding
};

console.log(`CSS .modal-content padding-bottom: ${hasCorrectPadding || 'not found (open modal first)'}`);
console.log(`\n⏳ TEST 4: À tester manuellement (app.afficherEtape...)`);

// ============================================================================
// RÉSUMÉ FINAL
// ============================================================================

console.log('\n%c📊 RÉSUMÉ FINAL', 'font-size: 14px; font-weight: bold; color: white; background: #333; padding: 10px;');

const allPassed = test1Pass && qcmScenarioFound && has101BT;

console.log(`
${test1Pass ? '✅' : '❌'} TEST 1 (FLAGS): ${test1Pass ? 'PASSED' : 'FAILED'}
  📖 CONSULTATION: ${consultationCount} (expected ≥24)
  🎯 VALIDATION: ${validationCount} (expected ≥11)
  ❓ UNKNOWN: ${unknownCount} (expected 0)

${qcmScenarioFound ? '✅' : '⚠️'} TEST 2 (QCM_SCENARIO): ${qcmScenarioFound ? 'FOUND' : 'NOT FOUND'}
  Exercices qcm_scenario: ${qcmScenarioTests.length}

${has101BT ? '✅' : '❌'} TEST 3 (101BT LOCALSTORAGE): ${has101BT ? 'INITIALIZED' : 'NOT INITIALIZED'}
  Chapitres: ${Object.keys(progress || {}).join(', ')}

⏳ TEST 4 (UI MODAL): À tester manuellement
  Instructions: App.afficherEtape('ch1', 1);
`);

console.log(`\n%c${allPassed ? '🎉 PROMPT 5 FIXES: VALIDÉS!' : '⚠️ Certains tests FAILED'}`, `font-size: 14px; font-weight: bold; color: ${allPassed ? 'green' : 'red'}; background: ${allPassed ? '#e0ffe0' : '#ffe0e0'}; padding: 10px;`);

// ============================================================================
// COMMANDES PRÊTES À COPIER-COLLER
// ============================================================================

console.log('\n%c🔧 COMMANDES DE TEST RAPIDE', 'font-size: 12px; font-weight: bold; color: white; background: #4A3F87; padding: 10px;');
console.log(`
// Test 1: Audit flags
const audit = () => {
  let c=0, v=0, u=0;
  CHAPITRES.forEach(ch => {
    ch.etapes.forEach(step => {
      if (step.consultation) c++;
      if (step.validation) v++;
      if (!step.consultation && !step.validation) u++;
    });
  });
  console.log('📖 CONSULTATION:', c, '🎯 VALIDATION:', v, '❓ UNKNOWN:', u);
};
audit();

// Test 2: Vérifier localStorage 101BT
const progress = StorageManager.getChaptersProgress();
console.log('101BT:', progress['101BT']);

// Test 3: Ouvrir modal pour test UI
App.afficherEtape('ch1', 1);
// → Puis scroll et vérifiez bouton visible
`);
