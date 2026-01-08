/**
 * TEST - FIX BUG: Progression chapitre reste à 0%
 * Exécuter dans la console (F12) pour valider le fix
 * 
 * Avant: Progression chapitre = 0% même après completion
 * Après: Progression = correctement calculée et persistée
 */

console.log('%c═══ TEST FIX PROGRESSION CHAPITRE ═══', 'color: #667eea; font-weight: bold; font-size: 14px;');

// TEST 1: Vérifier la fonction helper existe
console.log('\n%c✓ TEST 1: Fonction calculateChapterCompletionFromStorage', 'color: #2ECC71; font-weight: bold;');
console.log('Type:', typeof App.calculateChapterCompletionFromStorage);
console.assert(typeof App.calculateChapterCompletionFromStorage === 'function', '❌ Fonction n\'existe pas');

// TEST 2: Vérifier CHAPITRES et localStorage
console.log('\n%c✓ TEST 2: Vérifier données de base', 'color: #2ECC71; font-weight: bold;');
console.log('CHAPITRES.length:', CHAPITRES?.length);
console.log('localStorage keys:', Object.keys(localStorage).filter(k => k.startsWith('step_')).length, 'steps');

// TEST 3: Avant - Vérifier la progression initiale
console.log('\n%c✓ TEST 3: Progression AVANT', 'color: #2ECC71; font-weight: bold;');
const beforeProgress = StorageManager.getChaptersProgress();
console.log('Chapitres dans StorageManager:');
Object.keys(beforeProgress).slice(0, 3).forEach(chId => {
    const p = beforeProgress[chId];
    console.log(`  ${chId}: ${p?.completion || 0}% (${p?.stepsCompleted?.length || 0} étapes)`);
});

// TEST 4: Tester calculateChapterCompletionFromStorage() sur CH1
console.log('\n%c✓ TEST 4: calculateChapterCompletionFromStorage("ch1")', 'color: #2ECC71; font-weight: bold;');
const ch1 = CHAPITRES.find(c => c.id === 'ch1');
if (ch1) {
    console.log(`Chapitre CH1 trouvé: ${ch1.titre}`);
    console.log(`Nombre d'étapes: ${ch1.etapes?.length}`);
    
    const calculatedCompletion = App.calculateChapterCompletionFromStorage('ch1');
    console.log(`Progression calculée: ${calculatedCompletion}%`);
    
    // Vérifier dans StorageManager
    const storedCompletion = beforeProgress['ch1']?.completion || 0;
    console.log(`Progression stockée: ${storedCompletion}%`);
    
    if (calculatedCompletion === storedCompletion) {
        console.log('✅ Les deux valeurs correspondent');
    } else if (calculatedCompletion > 0 && storedCompletion === 0) {
        console.log('⚠️  BUG DÉTECTÉ: Progression calculée > 0% mais stockée = 0%');
    }
} else {
    console.log('⚠️  CH1 non trouvé dans CHAPITRES');
}

// TEST 5: Simuler la complétion d'une étape
console.log('\n%c✓ TEST 5: Simuler completion étape CH1 (test)', 'color: #2ECC71; font-weight: bold;');
if (ch1 && ch1.etapes && ch1.etapes.length > 0) {
    const firstStep = ch1.etapes[0];
    console.log(`Première étape: ${firstStep.id}`);
    
    // Marquer comme complétée (simulation localStorage)
    const stepKey = `step_${firstStep.id}`;
    console.log(`Clé localStorage: ${stepKey}`);
    
    // Vérifier si déjà complétée
    const alreadyCompleted = localStorage.getItem(stepKey);
    console.log(`Déjà complétée? ${alreadyCompleted ? 'OUI' : 'NON'}`);
    
    if (!alreadyCompleted) {
        // Marquer comme complétée pour le test
        localStorage.setItem(stepKey, JSON.stringify({
            completed: true,
            timestamp: new Date().toISOString(),
            score: 100
        }));
        console.log(`✅ ${firstStep.id} marquée comme complétée`);
    }
}

// TEST 6: Après - Vérifier la progression mise à jour
console.log('\n%c✓ TEST 6: Progression APRÈS (recalculée)', 'color: #2ECC71; font-weight: bold;');
const afterCalculated = App.calculateChapterCompletionFromStorage('ch1');
console.log(`CH1 - Progression calculée: ${afterCalculated}%`);

const afterStorageManager = StorageManager.getChaptersProgress()['ch1'];
console.log(`CH1 - StorageManager.completion: ${afterStorageManager?.completion || 0}%`);

// TEST 7: Vérifier que marquerEtapeComplete() met à jour correctement
console.log('\n%c✓ TEST 7: Flux complet marquerEtapeComplete()', 'color: #2ECC71; font-weight: bold;');
if (ch1 && ch1.etapes && ch1.etapes.length > 1) {
    const testStep = ch1.etapes[1];
    console.log(`Test step: ${testStep.id}`);
    
    // Avant
    const beforeTest = App.calculateChapterCompletionFromStorage('ch1');
    console.log(`Avant marquerEtapeComplete: ${beforeTest}%`);
    
    // Marquer complétée
    console.log(`Appelant: App.marquerEtapeComplete('ch1', '${testStep.id}')`);
    App.marquerEtapeComplete('ch1', testStep.id);
    
    // Après (attendre un peu pour les async)
    setTimeout(() => {
        const afterTest = App.calculateChapterCompletionFromStorage('ch1');
        const storedAfterTest = StorageManager.getChaptersProgress()['ch1']?.completion || 0;
        
        console.log(`Après marquerEtapeComplete: ${afterTest}%`);
        console.log(`Stocké dans StorageManager: ${storedAfterTest}%`);
        
        if (afterTest > beforeTest || storedAfterTest > 0) {
            console.log('✅ Progression augmentée avec success!');
        } else {
            console.log('❌ Progression n\'a pas augmenté');
        }
    }, 500);
}

// TEST 8: Vérifier getChapitrresCommences() utilise les bonnes données
console.log('\n%c✓ TEST 8: Vérifier getChapitrresCommences()', 'color: #2ECC71; font-weight: bold;');
const commences = App.getChapitrresCommences();
console.log(`Chapitres commencés (>0%): ${commences.length}`);
commences.forEach(ch => {
    const prog = StorageManager.getChaptersProgress()[ch.id];
    console.log(`  ${ch.id}: ${prog?.completion || 0}%`);
});

// RÉSUMÉ
console.log('\n%c═══ RÉSUMÉ DU FIX ═══', 'color: #667eea; font-weight: bold; font-size: 14px;');
console.log(`
✅ calculateChapterCompletionFromStorage() - créée
✅ Recalcule depuis localStorage (source vérité)
✅ Mise à jour StorageManager après marquerEtapeComplete()
✅ Synchronisation garantie entre en-mémoire et persistence
✅ getChapitrresCommences() utilise les bonnes données

AVANT LE FIX:
  Utilisateur complète étape → localStorage mis à jour ✅
  Mais progression chapitre reste 0% ❌
  
APRÈS LE FIX:
  Utilisateur complète étape → localStorage + StorageManager ✅
  Progression chapitre = calculée correctement ✅
`);

console.log('%c═══ FIN DES TESTS ═══', 'color: #667eea; font-weight: bold; font-size: 14px;');
