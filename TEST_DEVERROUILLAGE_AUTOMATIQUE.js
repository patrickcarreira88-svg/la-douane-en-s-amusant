/**
 * TEST_DEVERROUILLAGE_AUTOMATIQUE.js
 * Tests pour valider le système de déverrouillage automatique des étapes
 * 
 * Instructions:
 * 1. Ouvrir la console (F12)
 * 2. Copier-coller chaque test
 * 3. Vérifier les logs
 */

console.log('='.repeat(80));
console.log('🧪 TESTS: Déverrouillage Automatique des Étapes');
console.log('='.repeat(80));

// ============================================================================
// TEST 1: Initialisation du verrouillage
// ============================================================================

async function TEST_1_InitChapitreProgress() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 1️⃣ : Initialisation du verrouillage');
    console.log('='.repeat(80));
    
    // Reset localStorage
    localStorage.clear();
    console.log('✅ localStorage clearé');
    
    // Charger les chapitres
    if (!CHAPITRES || CHAPITRES.length === 0) {
        console.error('❌ CHAPITRES non chargés');
        return;
    }
    
    const chapitreId = CHAPITRES[0].id;
    console.log(`📖 Chapitre testé: ${chapitreId}`);
    
    // Initialiser les locks
    App.initChapitreProgress(chapitreId);
    
    // Vérifier les états
    console.log('\n📋 Vérification des états StorageManager:');
    
    const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
    let allGood = true;
    
    chapitre.etapes.forEach((etape, idx) => {
        const state = StorageManager.getEtapeState(chapitreId, idx);
        const isFirstStep = idx === 0;
        const expectedLock = !isFirstStep;
        
        const lockOk = state?.isLocked === expectedLock;
        const accessOk = state?.isAccessible === isFirstStep;
        
        const status = (lockOk && accessOk) ? '✅' : '❌';
        console.log(`  ${status} Étape ${idx}: isLocked=${state?.isLocked}, isAccessible=${state?.isAccessible} (attendu: ${expectedLock}, ${isFirstStep})`);
        
        if (!lockOk || !accessOk) allGood = false;
    });
    
    console.log('\n' + (allGood ? '✅ TEST 1 RÉUSSI' : '❌ TEST 1 ÉCHOUÉ'));
    return allGood;
}

// ============================================================================
// TEST 2: Accès à une étape verrouillée
// ============================================================================

function TEST_2_AccesEtapeVerrouille() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 2️⃣ : Accès à une étape verrouillée');
    console.log('='.repeat(80));
    
    const chapitreId = CHAPITRES[0].id;
    
    // Vérifier que l'écran affichera le message "🔒"
    console.log(`📖 Chapitre: ${chapitreId}`);
    console.log('Tentative d\'accès à étape 1 (verrouillée)...');
    
    App.afficherEtape(chapitreId, 1);
    
    // Vérifier le contenu du DOM
    const appContent = document.getElementById('app-content');
    const hasLocked = appContent?.textContent?.includes('Étape verrouillée');
    const hasLockEmoji = appContent?.textContent?.includes('🔒');
    
    console.log(`  ${hasLocked ? '✅' : '❌'} Message "Étape verrouillée" affiché`);
    console.log(`  ${hasLockEmoji ? '✅' : '❌'} Emoji 🔒 présent`);
    
    const testOk = hasLocked && hasLockEmoji;
    console.log('\n' + (testOk ? '✅ TEST 2 RÉUSSI' : '❌ TEST 2 ÉCHOUÉ'));
    return testOk;
}

// ============================================================================
// TEST 3: Complétion de l'étape 0 → Déverrouillage de l'étape 1
// ============================================================================

function TEST_3_DeverrouillageAutomatique() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 3️⃣ : Complètion étape 0 → Déverrouillage étape 1');
    console.log('='.repeat(80));
    
    const chapitreId = CHAPITRES[0].id;
    const etape0 = CHAPITRES[0].etapes[0];
    
    console.log(`📖 Chapitre: ${chapitreId}`);
    console.log(`📝 Étape 0: ${etape0.id}`);
    
    // Marquer étape 0 comme complétée
    console.log('\nMarquage de l\'étape 0 comme complétée...');
    App.marquerEtapeComplete(chapitreId, etape0.id);
    
    // Attendre un instant pour que les logs s'affichent
    setTimeout(() => {
        // Vérifier que l'étape 0 est marquée complétée
        const state0 = StorageManager.getEtapeState(chapitreId, 0);
        const step0Ok = state0?.completed === true;
        console.log(`  ${step0Ok ? '✅' : '❌'} Étape 0 marquée complétée: ${state0?.completed}`);
        
        // Vérifier que l'étape 1 est déverrouillée
        const state1 = StorageManager.getEtapeState(chapitreId, 1);
        const step1Unlocked = state1?.isLocked === false;
        console.log(`  ${step1Unlocked ? '✅' : '❌'} Étape 1 déverrouillée: isLocked=${state1?.isLocked}`);
        
        // Essayer d'accéder à l'étape 1
        console.log('\nTentative d\'accès à étape 1 (maintenant déverrouillée)...');
        App.afficherEtape(chapitreId, 1);
        
        const appContent = document.getElementById('app-content');
        const noLockedMsg = !appContent?.textContent?.includes('Étape verrouillée');
        const hasContent = appContent?.textContent?.includes('Étape 2 /'); // "Étape 2 / X"
        
        console.log(`  ${noLockedMsg ? '✅' : '❌'} Pas de message "Étape verrouillée"`);
        console.log(`  ${hasContent ? '✅' : '❌'} Contenu normal affiché`);
        
        const testOk = step0Ok && step1Unlocked && noLockedMsg && hasContent;
        console.log('\n' + (testOk ? '✅ TEST 3 RÉUSSI' : '❌ TEST 3 ÉCHOUÉ'));
    }, 500);
}

// ============================================================================
// TEST 4: Persistence après reload
// ============================================================================

function TEST_4_PersistenceReload() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 4️⃣ : Persistence après reload (F5)');
    console.log('='.repeat(80));
    
    const chapitreId = CHAPITRES[0].id;
    const state1 = StorageManager.getEtapeState(chapitreId, 1);
    
    console.log(`📖 Chapitre: ${chapitreId}`);
    console.log(`\nÉtat actuel de l'étape 1:`);
    console.log(`  isLocked: ${state1?.isLocked}`);
    console.log(`  isAccessible: ${state1?.isAccessible}`);
    console.log(`\n💾 Recharger la page (F5) pour tester la persistence...`);
    console.log(`\n📝 Après reload, vérifier que l'étape 1 reste déverrouillée:`);
    console.log(`  - App.afficherEtape('${chapitreId}', 1);`);
    console.log(`  - Devrait afficher le contenu normal, pas le message 🔒`);
}

// ============================================================================
// TEST 5: Vérification complète (suite)
// ============================================================================

function TEST_5_VerificationComplete() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 5️⃣ : Vérification complète du système');
    console.log('='.repeat(80));
    
    const chapitreId = CHAPITRES[0].id;
    const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
    
    console.log(`📖 Chapitre: ${chapitreId} (${chapitre.etapes.length} étapes)`);
    
    console.log('\n📊 État de toutes les étapes:');
    console.log('Étape | isLocked | isAccessible | completed');
    console.log('------|----------|--------------|----------');
    
    let allGood = true;
    chapitre.etapes.forEach((etape, idx) => {
        const state = StorageManager.getEtapeState(chapitreId, idx);
        const lock = state?.isLocked ? '✅' : '❌';
        const access = state?.isAccessible ? '✅' : '❌';
        const comp = state?.completed ? '✅' : '❌';
        
        console.log(`  ${idx}   | ${lock}       | ${access}            | ${comp}`);
    });
    
    console.log('\n✅ Vérifications effectuées!');
}

// ============================================================================
// RUNNER: Exécuter tous les tests
// ============================================================================

async function RUN_ALL_TESTS() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 EXÉCUTION DE TOUS LES TESTS');
    console.log('='.repeat(80));
    
    const results = [];
    
    // Test 1
    const test1 = await TEST_1_InitChapitreProgress();
    results.push({ test: 'Test 1', ok: test1 });
    
    // Test 2
    const test2 = TEST_2_AccesEtapeVerrouille();
    results.push({ test: 'Test 2', ok: test2 });
    
    // Test 3
    TEST_3_DeverrouillageAutomatique();
    // Note: Test 3 est asynchrone, attendre un peu
    
    // Test 5 (après Test 3)
    setTimeout(() => {
        TEST_5_VerificationComplete();
        
        // Résumé
        console.log('\n' + '='.repeat(80));
        console.log('📊 RÉSUMÉ DES TESTS');
        console.log('='.repeat(80));
        results.forEach(r => {
            console.log(`${r.ok ? '✅' : '❌'} ${r.test}`);
        });
        
        const allPass = results.every(r => r.ok);
        console.log('\n' + (allPass ? '🎉 TOUS LES TESTS RÉUSSIS!' : '⚠️ CERTAINS TESTS ONT ÉCHOUÉ'));
    }, 1000);
    
    console.log('\nPour tester la persistence (Test 4), recharger la page (F5)');
}

// ============================================================================
// INSTRUCTIONS D'UTILISATION
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📖 INSTRUCTIONS');
console.log('='.repeat(80));
console.log(`
Exécuter dans la console (F12):

1. Pour tous les tests:
   RUN_ALL_TESTS();

2. Pour des tests spécifiques:
   TEST_1_InitChapitreProgress();      // Initialisation
   TEST_2_AccesEtapeVerrouille();      // Accès verrouillé
   TEST_3_DeverrouillageAutomatique(); // Déverrouillage
   TEST_4_PersistenceReload();         // Info pour reload
   TEST_5_VerificationComplete();      // Vérification complète

3. Pour nettoyer localStorage:
   localStorage.clear();

4. Pour vérifier l'état d'une étape:
   StorageManager.getEtapeState('ch1', 0);  // État de l'étape 0
`);

console.log('='.repeat(80) + '\n');
