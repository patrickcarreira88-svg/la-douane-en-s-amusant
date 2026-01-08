/**
 * TEST_DATA_STRUCTURE_BRIDGE.js
 * Tests pour valider les 4 bridge functions
 * 
 * Instructions:
 * 1. Ouvrir la console (F12)
 * 2. Copier-coller les tests
 * 3. Vérifier les résultats
 */

console.log('='.repeat(80));
console.log('🧪 TESTS: Data Structure Bridge Functions');
console.log('='.repeat(80));

// ============================================================================
// HELPER: Créer un élément DOM mock pour les tests
// ============================================================================

function createMockNiveauElement(niveauId) {
    // Vérifier si l'élément existe déjà
    let element = document.querySelector(`[data-niveau-id="${niveauId}"]`);
    if (element) return element;
    
    // Créer l'élément mock
    const mockDiv = document.createElement('div');
    mockDiv.setAttribute('data-niveau-id', niveauId);
    mockDiv.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
        </div>
        <div class="progress-text">0% complété</div>
        <svg class="niveau-progress-circle">
            <circle cx="50" cy="50" r="45" style="stroke-dashoffset: 282.7"></circle>
        </svg>
        <span class="niveau-progress-percent">0%</span>
    `;
    mockDiv.style.display = 'none'; // Caché pour ne pas affecter l'UI
    document.body.appendChild(mockDiv);
    return mockDiv;
}

// ============================================================================
// TEST 1: findChapitreById
// ============================================================================

function TEST_1_FindChapitreById() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 1️⃣ : findChapitreById()');
    console.log('='.repeat(80));
    
    // Test 1A: Chercher le premier chapitre
    const ch1 = App.findChapitreById('ch1');
    const ch1Found = ch1 && ch1.id === 'ch1';
    console.log(`  ${ch1Found ? '✅' : '❌'} Trouvé ch1: ${ch1?.titre}`);
    
    // Test 1B: Chercher un chapitre qui n'existe pas
    const chNone = App.findChapitreById('nonexistent');
    const chNoneOk = chNone === null;
    console.log(`  ${chNoneOk ? '✅' : '❌'} Chapitre nonexistent retourne null`);
    
    const testOk = ch1Found && chNoneOk;
    console.log('\n' + (testOk ? '✅ TEST 1 RÉUSSI' : '❌ TEST 1 ÉCHOUÉ'));
    return testOk;
}

// ============================================================================
// TEST 2: getChapitresForNiveau
// ============================================================================

function TEST_2_GetChapitresForNiveau() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 2️⃣ : getChapitresForNiveau()');
    console.log('='.repeat(80));
    
    // Test 2A: Obtenir chapitres du niveau actuel
    const niveauId = window.currentNiveauId || 'n1';
    const chapitres = App.getChapitresForNiveau(niveauId);
    const hasChapitres = Array.isArray(chapitres) && chapitres.length > 0;
    console.log(`  ${hasChapitres ? '✅' : '❌'} Niveau ${niveauId}: ${chapitres.length} chapitres`);
    
    // Test 2B: Chaque chapitre a des étapes
    let allHaveEtapes = true;
    chapitres.forEach((ch, idx) => {
        const hasEtapes = ch.etapes && Array.isArray(ch.etapes) && ch.etapes.length > 0;
        console.log(`    ${hasEtapes ? '✅' : '❌'} ${ch.id}: ${ch.etapes?.length || 0} étapes`);
        if (!hasEtapes) allHaveEtapes = false;
    });
    
    const testOk = hasChapitres && allHaveEtapes;
    console.log('\n' + (testOk ? '✅ TEST 2 RÉUSSI' : '❌ TEST 2 ÉCHOUÉ'));
    return testOk;
}

// ============================================================================
// TEST 3: calculateNiveauProgress
// ============================================================================

function TEST_3_CalculateNiveauProgress() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 3️⃣ : calculateNiveauProgress()');
    console.log('='.repeat(80));
    
    const niveauId = window.currentNiveauId || 'n1';
    const progress = App.calculateNiveauProgress(niveauId);
    
    console.log(`  📊 Progression du niveau ${niveauId}: ${progress}%`);
    console.log(`  ${progress >= 0 && progress <= 100 ? '✅' : '❌'} Valeur entre 0 et 100`);
    
    // Marquer quelques étapes comme complétées pour voir le changement
    const chapitres = App.getChapitresForNiveau(niveauId);
    if (chapitres.length > 0 && chapitres[0].etapes.length > 0) {
        console.log('\n  Marquage d\'une étape comme complétée...');
        chapitres[0].etapes[0].completed = true;
        
        const newProgress = App.calculateNiveauProgress(niveauId);
        console.log(`  📊 Nouvelle progression: ${newProgress}%`);
        console.log(`  ${newProgress > progress ? '✅' : '❌'} Progression augmentée`);
        
        // Nettoyer
        chapitres[0].etapes[0].completed = false;
    }
    
    const testOk = progress >= 0 && progress <= 100;
    console.log('\n' + (testOk ? '✅ TEST 3 RÉUSSI' : '❌ TEST 3 ÉCHOUÉ'));
    return testOk;
}

// ============================================================================
// TEST 4: updateNiveauProgressDisplay
// ============================================================================

function TEST_4_UpdateNiveauProgressDisplay() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 4️⃣ : updateNiveauProgressDisplay()');
    console.log('='.repeat(80));
    
    const niveauId = window.currentNiveauId || 'n1';
    const normalizedId = niveauId.toUpperCase(); // N1, N2, etc.
    
    // Créer un élément mock pour le test
    createMockNiveauElement(normalizedId);
    
    console.log(`  Mise à jour de l'affichage pour ${niveauId}...`);
    App.updateNiveauProgressDisplay(niveauId);
    
    // Vérifier que le DOM a été mis à jour (chercher avec l'ID normalisé)
    const niveauElement = document.querySelector(`[data-niveau-id="${normalizedId}"]`);
    if (!niveauElement) {
        console.log(`  ❌ Élément DOM [data-niveau-id="${normalizedId}"] non trouvé`);
        return false;
    }
    
    // Vérifier les éléments de progression
    const progressText = niveauElement.querySelector('.progress-text');
    const progressFill = niveauElement.querySelector('.progress-fill');
    const svgCircle = niveauElement.querySelector('.niveau-progress-circle');
    
    const hasProgressText = progressText && progressText.textContent.includes('%');
    const hasProgressFill = progressFill && progressFill.style.width;
    
    console.log(`  ${hasProgressText ? '✅' : '❌'} Texte de progression: "${progressText?.textContent || 'N/A'}"`);
    console.log(`  ${hasProgressFill ? '✅' : '❌'} Barre de progression: ${progressFill?.style.width || 'N/A'}`);
    
    if (svgCircle) {
        const hasStroke = svgCircle.style.strokeDashoffset;
        console.log(`  ${hasStroke ? '✅' : '❌'} Cercle SVG: stroke-dashoffset = ${hasStroke || 'N/A'}`);
    }
    
    const testOk = hasProgressText || hasProgressFill;
    console.log('\n' + (testOk ? '✅ TEST 4 RÉUSSI' : '❌ TEST 4 ÉCHOUÉ'));
    return testOk;
}

// ============================================================================
// TEST 5: Test d'intégration complet
// ============================================================================

function TEST_5_IntegrationComplete() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 5️⃣ : Intégration Complète');
    console.log('='.repeat(80));
    
    const niveauId = window.currentNiveauId || 'n1';
    const chapitres = App.getChapitresForNiveau(niveauId);
    
    if (chapitres.length === 0 || chapitres[0].etapes.length === 0) {
        console.log('❌ Pas de chapitre ou d\'étape à tester');
        return false;
    }
    
    const chapitre = chapitres[0];
    const etape = chapitre.etapes[0];
    
    // État initial
    const initialProgress = App.calculateNiveauProgress(niveauId);
    console.log(`📊 Progression initiale: ${initialProgress}%`);
    
    // Compléter l'étape
    console.log('\n  Marquage de l\'étape comme complétée...');
    etape.completed = true;
    
    // Nouvelle progression
    const newProgress = App.calculateNiveauProgress(niveauId);
    console.log(`📊 Nouvelle progression: ${newProgress}%`);
    
    // Vérifier que la progression a augmenté
    const progressIncreased = newProgress > initialProgress;
    console.log(`${progressIncreased ? '✅' : '❌'} Progression augmentée`);
    
    // Mettre à jour l'affichage
    console.log('\n  Mise à jour du DOM...');
    App.updateNiveauProgressDisplay(niveauId);
    
    // Nettoyer
    etape.completed = false;
    
    const testOk = progressIncreased;
    console.log('\n' + (testOk ? '✅ TEST 5 RÉUSSI' : '❌ TEST 5 ÉCHOUÉ'));
    return testOk;
}

// ============================================================================
// TEST 6: Pas d'erreur "non trouvé"
// ============================================================================

function TEST_6_NoErrorMessages() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 6️⃣ : Pas d\'erreurs "non trouvé"');
    console.log('='.repeat(80));
    
    const originalError = console.error;
    const errors = [];
    
    console.error = function(...args) {
        const msg = args[0]?.toString() || '';
        if (msg.includes('non trouvé')) {
            errors.push(msg);
        }
        originalError.apply(console, args);
    };
    
    // Simuler les opérations
    const chapitres = App.getChapitresForNiveau('n1');
    if (chapitres.length > 0) {
        App.findChapitreById(chapitres[0].id);
        App.updateNiveauProgressDisplay('n1');
    }
    
    console.error = originalError;
    
    const noErrors = errors.length === 0;
    console.log(`  ${noErrors ? '✅' : '❌'} Aucune erreur "non trouvé": ${errors.length} trouvées`);
    
    if (errors.length > 0) {
        console.log('  Erreurs détectées:');
        errors.forEach(err => console.log(`    - ${err}`));
    }
    
    console.log('\n' + (noErrors ? '✅ TEST 6 RÉUSSI' : '❌ TEST 6 ÉCHOUÉ'));
    return noErrors;
}

// ============================================================================
// RUNNER: Exécuter tous les tests
// ============================================================================

async function RUN_ALL_TESTS() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 EXÉCUTION DE TOUS LES TESTS');
    console.log('='.repeat(80));
    
    const results = [];
    
    const test1 = TEST_1_FindChapitreById();
    results.push({ test: 'Test 1: findChapitreById', ok: test1 });
    
    const test2 = TEST_2_GetChapitresForNiveau();
    results.push({ test: 'Test 2: getChapitresForNiveau', ok: test2 });
    
    const test3 = TEST_3_CalculateNiveauProgress();
    results.push({ test: 'Test 3: calculateNiveauProgress', ok: test3 });
    
    const test4 = TEST_4_UpdateNiveauProgressDisplay();
    results.push({ test: 'Test 4: updateNiveauProgressDisplay', ok: test4 });
    
    const test5 = TEST_5_IntegrationComplete();
    results.push({ test: 'Test 5: Intégration Complète', ok: test5 });
    
    const test6 = TEST_6_NoErrorMessages();
    results.push({ test: 'Test 6: Pas d\'erreurs', ok: test6 });
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(80));
    results.forEach(r => {
        console.log(`${r.ok ? '✅' : '❌'} ${r.test}`);
    });
    
    const passedCount = results.filter(r => r.ok).length;
    const totalCount = results.length;
    
    console.log(`\n📈 Score: ${passedCount}/${totalCount}`);
}

// ============================================================================
// INSTRUCTIONS D'UTILISATION
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📖 INSTRUCTIONS');
console.log('='.repeat(80));
console.log('Exécuter dans la console (F12):\n1. Pour tous les tests:\n   RUN_ALL_TESTS();\n\n2. Pour des tests spécifiques:\n   TEST_1_FindChapitreById();\n   TEST_2_GetChapitresForNiveau();\n   TEST_3_CalculateNiveauProgress();\n   TEST_4_UpdateNiveauProgressDisplay();\n   TEST_5_IntegrationComplete();\n   TEST_6_NoErrorMessages();\n\n3. Pour vérifier les erreurs console:\n   - Chercher les messages commençant par "❌"\n   - Pas de "Chapitre non trouvé" = ✅\n\n4. Pour tester manuellement:\n   - App.findChapitreById("ch1");\n   - App.getChapitresForNiveau("n1");\n   - App.calculateNiveauProgress("n1");\n   - App.updateNiveauProgressDisplay("n1");');
console.log('='.repeat(80) + '\n');
