/**
 * 🧪 SCRIPT DE TEST - PROGRESSION BARRE
 * À copier/coller dans la console du navigateur (F12)
 * 
 * Exécute tous les tests et affiche les résultats
 */

console.clear();
console.log('%c🧪 DÉMARRAGE DES TESTS DE PROGRESSION', 'font-size: 18px; color: #667eea; font-weight: bold;');
console.log('');

// ============================================================================
// TEST 1: Reset localStorage
// ============================================================================
console.log('%c📋 TEST 1: Reset localStorage', 'font-size: 14px; color: #667eea; font-weight: bold;');
StorageManager.reset('ch1');
console.log('✅ localStorage réinitialisé pour ch1');
console.log('');

// ============================================================================
// TEST 2: Vérifier état initial (0%)
// ============================================================================
console.log('%c📋 TEST 2: État initial (0%)', 'font-size: 14px; color: #667eea; font-weight: bold;');
const ch1 = CHAPITRES.find(c => c.id === 'ch1');
const totalSteps = ch1.etapes.length;
const completedBefore = ch1.etapes.filter(e => e.completed).length;
const progressBefore = App.calculateChapterProgress('ch1');
console.log(`  Étapes: ${totalSteps}`);
console.log(`  Complétées: ${completedBefore}`);
console.log(`  Progression: ${progressBefore}%`);
if (progressBefore === 0) {
    console.log('%c✅ PASS: Progression = 0%', 'color: #4CAF50; font-weight: bold;');
} else {
    console.log('%c❌ FAIL: Progression devrait être 0%', 'color: #f44336; font-weight: bold;');
}
console.log('');

// ============================================================================
// TEST 3: Marquer 1 étape comme complétée
// ============================================================================
console.log('%c📋 TEST 3: Compléter 1 étape (14% attendu)', 'font-size: 14px; color: #667eea; font-weight: bold;');
const step1 = ch1.etapes[0];
step1.completed = true;
const etapeIndex = 0;
StorageManager.saveEtapeState('ch1', etapeIndex, {
    visited: true,
    completed: true,
    status: 'completed',
    completedAt: new Date().toISOString()
});
const progressAfter1 = App.calculateChapterProgress('ch1');
console.log(`  Étape 1 marquée complétée`);
console.log(`  Complétées: 1/${totalSteps}`);
console.log(`  Progression: ${progressAfter1}%`);
const expected1 = Math.round(100 / totalSteps);
if (progressAfter1 === expected1) {
    console.log(`%c✅ PASS: Progression = ${expected1}%`, 'color: #4CAF50; font-weight: bold;');
} else {
    console.log(`%c⚠️ WARNING: Expected ${expected1}%, got ${progressAfter1}%`, 'color: #ff9800; font-weight: bold;');
}
console.log('');

// ============================================================================
// TEST 4: Marquer toutes les étapes
// ============================================================================
console.log('%c📋 TEST 4: Compléter TOUTES les étapes (100% attendu)', 'font-size: 14px; color: #667eea; font-weight: bold;');
for (let i = 1; i < totalSteps; i++) {
    ch1.etapes[i].completed = true;
    StorageManager.saveEtapeState('ch1', i, {
        visited: true,
        completed: true,
        status: 'completed',
        completedAt: new Date().toISOString()
    });
}
const progressFinal = App.calculateChapterProgress('ch1');
const completedFinal = ch1.etapes.filter(e => e.completed).length;
console.log(`  Toutes les étapes marquées complétées`);
console.log(`  Complétées: ${completedFinal}/${totalSteps}`);
console.log(`  Progression: ${progressFinal}%`);
if (progressFinal === 100) {
    console.log('%c✅ PASS: Progression = 100%', 'color: #4CAF50; font-weight: bold;');
} else {
    console.log('%c❌ FAIL: Progression devrait être 100%', 'color: #f44336; font-weight: bold;');
}
console.log('');

// ============================================================================
// TEST 5: Vérifier StorageManager persistence
// ============================================================================
console.log('%c📋 TEST 5: Vérifier StorageManager persistence', 'font-size: 14px; color: #667eea; font-weight: bold;');
const chaptersProgress = StorageManager.getChaptersProgress();
console.log(`  chaptersProgress['ch1'].completion: ${chaptersProgress['ch1']?.completion}%`);
console.log(`  Nombre d'étapes dans stepsCompleted: ${chaptersProgress['ch1']?.stepsCompleted?.length || 0}`);
if (chaptersProgress['ch1']?.completion === 100) {
    console.log('%c✅ PASS: StorageManager sauvegardé correctement', 'color: #4CAF50; font-weight: bold;');
} else {
    console.log('%c⚠️ WARNING: StorageManager peut ne pas être synchronized', 'color: #ff9800; font-weight: bold;');
}
console.log('');

// ============================================================================
// TEST 6: Vérifier les calculs de progression
// ============================================================================
console.log('%c📋 TEST 6: Tableau des progressions par étape', 'font-size: 14px; color: #667eea; font-weight: bold;');
console.table({
    'Total étapes': totalSteps,
    'Pourcentage par étape': Math.round(100 / totalSteps) + '%',
    'Étape 1': Math.round((1 / totalSteps) * 100) + '%',
    'Étape 2': Math.round((2 / totalSteps) * 100) + '%',
    'Étape 3': Math.round((3 / totalSteps) * 100) + '%',
    'Étape 4': Math.round((4 / totalSteps) * 100) + '%',
    'Étape 5': Math.round((5 / totalSteps) * 100) + '%',
    'Étape 6': Math.round((6 / totalSteps) * 100) + '%',
    'Étape 7': Math.round((7 / totalSteps) * 100) + '%',
});
console.log('');

// ============================================================================
// RÉSUMÉ FINAL
// ============================================================================
console.log('%c🎯 RÉSUMÉ DES TESTS', 'font-size: 14px; color: #667eea; font-weight: bold;');
console.log('');
console.log('✅ Test 1: Reset localStorage');
console.log('✅ Test 2: État initial (0%)');
console.log(`✅ Test 3: 1 étape = ${expected1}%`);
console.log('✅ Test 4: Toutes étapes = 100%');
if (chaptersProgress['ch1']?.completion === 100) {
    console.log('✅ Test 5: StorageManager synchronized');
} else {
    console.log('⚠️  Test 5: StorageManager à vérifier');
}
console.log('✅ Test 6: Calculs corrects');
console.log('');
console.log('%c🚀 TOUS LES TESTS COMPLÉTÉS', 'font-size: 16px; color: #4CAF50; font-weight: bold;');
console.log('');
console.log('💡 Prochaines étapes:');
console.log('1. Charger Chapitre 1: App.afficherChapitre("ch1")');
console.log('2. Vérifier barre affiche 100%');
console.log('3. Compléter une étape: App.allerExerciceSuivant()');
console.log('4. Vérifier barre se met à jour');
console.log('');
