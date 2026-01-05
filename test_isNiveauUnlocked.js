/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SCRIPT: isNiveauUnlocked() & getNiveauState()
 * ═══════════════════════════════════════════════════════════════════
 * 
 * UTILISATION:
 * 1. Ouvrir app dans navigateur
 * 2. Ouvrir F12 (DevTools Console)
 * 3. Copier/coller ce script complet dans la console
 * 4. Résultats s'affichent dans la console
 * 
 * RÉSULTATS ATTENDUS:
 * ✅ N1: TRUE (toujours déverrouillé)
 * ❌ N2: FALSE (verrouillé - N1 pas 100%)
 * ❌ N3: FALSE (verrouillé)
 * ❌ N4: FALSE (verrouillé)
 * ═══════════════════════════════════════════════════════════════════
 */

console.clear();
console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 SUITE DE TESTS: isNiveauUnlocked() & getNiveauState()');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 1: Vérifier que fonctions existent
// ─────────────────────────────────────────────────────────────────
console.log('📋 TEST 1: Vérifier existence des fonctions');
console.log('─────────────────────────────────────────────────────────────');

const fonctionsRequises = ['isNiveauUnlocked', 'getNiveauState', 'StorageManager'];
const fonctionsMissingOK = [];

fonctionsRequises.forEach(nom => {
    if (nom === 'StorageManager') {
        if (typeof StorageManager !== 'undefined') {
            console.log(`✅ ${nom}: Présent`);
        } else {
            console.error(`❌ ${nom}: MANQUANT`);
            fonctionsMissingOK.push(nom);
        }
    } else if (typeof window[nom] === 'function') {
        console.log(`✅ ${nom}(): Présent`);
    } else {
        console.error(`❌ ${nom}(): MANQUANT`);
        fonctionsMissingOK.push(nom);
    }
});

if (fonctionsMissingOK.length > 0) {
    console.error(`\n❌ ${fonctionsMissingOK.length} fonction(s) manquante(s). Arrêt des tests.`);
    console.log('═══════════════════════════════════════════════════════════════');
    throw new Error(`Fonctions manquantes: ${fonctionsMissingOK.join(', ')}`);
}

console.log('✅ Toutes les fonctions présentes\n');

// ─────────────────────────────────────────────────────────────────
// TEST 2: isNiveauUnlocked() - N1
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 2: isNiveauUnlocked("N1")');
console.log('─────────────────────────────────────────────────────────────');
console.log('Résultat attendu: TRUE (N1 toujours déverrouillé)\n');

try {
    const resultN1 = isNiveauUnlocked('N1');
    if (resultN1 === true) {
        console.log(`✅ PASS: N1 = ${resultN1} (Correct)`);
    } else {
        console.error(`❌ FAIL: N1 = ${resultN1} (Attendu: true)`);
    }
} catch (error) {
    console.error(`❌ ERREUR: ${error.message}`);
}
console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 3: isNiveauUnlocked() - N2, N3, N4
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 3: isNiveauUnlocked("N2", "N3", "N4")');
console.log('─────────────────────────────────────────────────────────────');
console.log('Résultat attendu: FALSE (N1 pas 100%)\n');

const niveauxTestN234 = ['N2', 'N3', 'N4'];
let passN234 = 0;

niveauxTestN234.forEach(id => {
    try {
        const result = isNiveauUnlocked(id);
        if (result === false) {
            console.log(`✅ PASS: ${id} = ${result} (Correct)`);
            passN234++;
        } else {
            console.error(`❌ FAIL: ${id} = ${result} (Attendu: false)`);
        }
    } catch (error) {
        console.error(`❌ ERREUR ${id}: ${error.message}`);
    }
});
console.log(`\nRésultat: ${passN234}/${niveauxTestN234.length} niveaux correct\n`);

// ─────────────────────────────────────────────────────────────────
// TEST 4: getNiveauState() - Structure
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 4: getNiveauState() - Structure de retour');
console.log('─────────────────────────────────────────────────────────────');
console.log('Résultat attendu: {unlocked, completion, chapitres}\n');

try {
    const state = getNiveauState('N1');
    const requiredKeys = ['unlocked', 'completion', 'chapitres'];
    const hasAllKeys = requiredKeys.every(key => key in state);
    
    if (hasAllKeys) {
        console.log('✅ PASS: Structure complète');
        console.log(`   - unlocked: ${state.unlocked} (type: ${typeof state.unlocked})`);
        console.log(`   - completion: ${state.completion} (type: ${typeof state.completion})`);
        console.log(`   - chapitres: ${state.chapitres} (type: ${typeof state.chapitres})`);
    } else {
        console.error('❌ FAIL: Clés manquantes');
        console.log('   Keys présentes:', Object.keys(state));
    }
} catch (error) {
    console.error(`❌ ERREUR: ${error.message}`);
}
console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 5: getNiveauState() - Valeurs N1
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 5: getNiveauState("N1") - Valeurs');
console.log('─────────────────────────────────────────────────────────────');
console.log('Résultat attendu: {unlocked: true, completion: 0-100, chapitres: 7}\n');

try {
    const stateN1 = getNiveauState('N1');
    console.table(stateN1);
    
    let passN1Tests = 0;
    if (stateN1.unlocked === true) {
        console.log(`✅ PASS: unlocked = true`);
        passN1Tests++;
    } else {
        console.error(`❌ FAIL: unlocked = ${stateN1.unlocked}`);
    }
    
    if (typeof stateN1.completion === 'number' && stateN1.completion >= 0 && stateN1.completion <= 100) {
        console.log(`✅ PASS: completion = ${stateN1.completion}% (valid)`);
        passN1Tests++;
    } else {
        console.error(`❌ FAIL: completion = ${stateN1.completion} (invalid)`);
    }
    
    if (stateN1.chapitres === 7) {
        console.log(`✅ PASS: chapitres = 7`);
        passN1Tests++;
    } else {
        console.warn(`⚠️  WARNING: chapitres = ${stateN1.chapitres} (attendu: 7)`);
    }
    
    console.log(`\nRésultat: ${passN1Tests}/3 assertions OK`);
} catch (error) {
    console.error(`❌ ERREUR: ${error.message}`);
}
console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 6: getNiveauState() - Valeurs N2 (Vide)
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 6: getNiveauState("N2") - Valeurs (Shell vide)');
console.log('─────────────────────────────────────────────────────────────');
console.log('Résultat attendu: {unlocked: false, completion: 0, chapitres: 0}\n');

try {
    const stateN2 = getNiveauState('N2');
    console.table(stateN2);
    
    let passN2Tests = 0;
    if (stateN2.unlocked === false) {
        console.log(`✅ PASS: unlocked = false`);
        passN2Tests++;
    } else {
        console.error(`❌ FAIL: unlocked = ${stateN2.unlocked}`);
    }
    
    if (stateN2.completion === 0) {
        console.log(`✅ PASS: completion = 0`);
        passN2Tests++;
    } else {
        console.warn(`⚠️  WARNING: completion = ${stateN2.completion} (attendu: 0)`);
    }
    
    if (stateN2.chapitres === 0) {
        console.log(`✅ PASS: chapitres = 0`);
        passN2Tests++;
    } else {
        console.error(`❌ FAIL: chapitres = ${stateN2.chapitres} (attendu: 0)`);
    }
    
    console.log(`\nRésultat: ${passN2Tests}/3 assertions OK`);
} catch (error) {
    console.error(`❌ ERREUR: ${error.message}`);
}
console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 7: Tous les niveaux en tableau
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 7: État de tous les niveaux (Tableau)');
console.log('─────────────────────────────────────────────────────────────\n');

try {
    const allNiveaux = {};
    ['N1', 'N2', 'N3', 'N4'].forEach(id => {
        allNiveaux[id] = getNiveauState(id);
    });
    
    console.table(allNiveaux);
    
    console.log('\n📊 Résumé:');
    Object.entries(allNiveaux).forEach(([id, state]) => {
        const status = state.unlocked ? '✅' : '🔒';
        console.log(`   ${status} ${id}: ${state.completion}% | ${state.chapitres} chapitres`);
    });
} catch (error) {
    console.error(`❌ ERREUR: ${error.message}`);
}
console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 8: Gestion erreurs
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 8: Gestion des erreurs (Niveau inexistant)');
console.log('─────────────────────────────────────────────────────────────');
console.log('Résultat attendu: {unlocked: false, completion: 0, chapitres: 0}\n');

try {
    const stateInvalid = getNiveauState('N99');
    if (stateInvalid.unlocked === false && stateInvalid.completion === 0) {
        console.log(`✅ PASS: Gère niveau inexistant correctement`);
        console.table(stateInvalid);
    } else {
        console.error(`❌ FAIL: Valeurs inattendues`);
        console.table(stateInvalid);
    }
} catch (error) {
    console.error(`❌ ERREUR: ${error.message}`);
}
console.log('');

// ─────────────────────────────────────────────────────────────────
// RÉSUMÉ FINAL
// ─────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ SUITE DE TESTS COMPLÉTÉE');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('📋 RÉSULTATS ATTENDUS:');
console.log('   ✅ N1: Toujours déverrouillé');
console.log('   ❌ N2: Verrouillé (N1 pas 100%)');
console.log('   ❌ N3: Verrouillé');
console.log('   ❌ N4: Verrouillé');
console.log('');
console.log('💡 POUR DÉBLOQUER N2:');
console.log('   1. Compléter TOUS les chapitres de N1 (100%)');
console.log('   2. StorageManager.calculateNiveauCompletion("N1") === 100');
console.log('   3. isNiveauUnlocked("N2") retournera TRUE');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
