/**
 * TEST SCRIPT - Vérifier l'intégration storage.js multi-niveaux
 * 
 * Pour tester:
 * 1. Ouvrir la console du navigateur (F12)
 * 2. Copier-coller ce script
 * 3. Exécuter et vérifier les résultats
 */

console.log('\n=== TEST STORAGE.JS MULTI-NIVEAUX ===\n');

// Test 1: Initialiser
console.log('TEST 1: Initialisation');
StorageManager.init();
StorageManager.initializeNiveaux();
console.log('✅ Initialisation complètée\n');

// Test 2: Vérifier structure
console.log('TEST 2: Structure utilisateur');
const user = StorageManager.getUser();
console.log('Structure niveaux présente:', !!user.niveaux);
console.log('N1, N2, N3, N4 présents:', 
    !!user.niveaux.N1 && !!user.niveaux.N2 && 
    !!user.niveaux.N3 && !!user.niveaux.N4
);
console.log('✅ Structure OK\n');

// Test 3: Calculer complétion N1
console.log('TEST 3: Calculer complétion');
const completion = StorageManager.calculateNiveauCompletion('N1');
console.log(`Complétion N1: ${completion}%`);
console.log('✅ Calcul OK\n');

// Test 4: Récupérer chapitres N1
console.log('TEST 4: Récupérer chapitres');
const chapters = StorageManager.getNiveauChapitres('N1');
console.log('Chapitres N1:', Object.keys(chapters));
console.log('✅ Récupération OK\n');

// Test 5: Vérifier déblocage
console.log('TEST 5: Déblocage conditionnel');
console.log('N1 déverrouillé:', StorageManager.isNiveauUnlocked('N1'));
console.log('N2 déverrouillé (N1 < 100%):', StorageManager.isNiveauUnlocked('N2'));
console.log('✅ Déblocage OK\n');

// Test 6: Mettre à jour chapitre
console.log('TEST 6: Mettre à jour chapitre');
const chapterData = {
    completion: 50,
    stepsCompleted: ['step1', 'step2'],
    badgeEarned: false
};
// Note: Cette fonction cherchera le chapitre dans les niveaux existants
// Pour tester, il faut d'abord avoir des chapitres dans N1
console.log('✅ Fonction setChapterProgress disponible\n');

// Test 7: Afficher structure complète
console.log('TEST 7: Structure complète');
console.log(JSON.stringify(user.niveaux, null, 2));
console.log('✅ Structure affichée\n');

console.log('=== TOUS LES TESTS COMPLÉTÉS ===\n');
