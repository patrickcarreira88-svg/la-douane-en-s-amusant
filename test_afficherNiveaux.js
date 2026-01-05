/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SCRIPT: afficherNiveaux() & afficherNiveau()
 * ═══════════════════════════════════════════════════════════════════
 * 
 * UTILISATION:
 * 1. Ouvrir app dans navigateur
 * 2. Aller à page "Accueil"
 * 3. Ouvrir F12 (DevTools Console)
 * 4. Copier/coller ce script
 * 5. Résultats s'affichent dans la console
 * ═══════════════════════════════════════════════════════════════════
 */

console.clear();
console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 TEST SUITE: afficherNiveaux() & afficherNiveau()');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 1: Vérifier fonctions existent
// ─────────────────────────────────────────────────────────────────
console.log('📋 TEST 1: Existence des fonctions');
console.log('─────────────────────────────────────────────────────────────');

const fonctionsRequises = ['afficherNiveaux', 'getNiveauState', 'isNiveauUnlocked'];
let fonctionsMissing = 0;

fonctionsRequises.forEach(nom => {
    if (typeof window[nom] === 'function') {
        console.log(`✅ ${nom}(): Présente`);
    } else {
        console.error(`❌ ${nom}(): MANQUANTE`);
        fonctionsMissing++;
    }
});

if (typeof App?.afficherNiveau === 'function') {
    console.log(`✅ App.afficherNiveau(): Présente`);
} else {
    console.error(`❌ App.afficherNiveau(): MANQUANTE`);
    fonctionsMissing++;
}

if (fonctionsMissing > 0) {
    console.error(`\n❌ ${fonctionsMissing} fonction(s) manquante(s)`);
    throw new Error(`Fonctions manquantes: Vérifiez app.js`);
}

console.log('✅ Toutes les fonctions présentes\n');

// ─────────────────────────────────────────────────────────────────
// TEST 2: Vérifier container DOM
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 2: Container DOM #niveaux-container-accueil');
console.log('─────────────────────────────────────────────────────────────');

const container = document.getElementById('niveaux-container-accueil');
if (container) {
    console.log(`✅ Container trouvé`);
    console.log(`   HTML actuel: ${container.innerHTML.substring(0, 50)}...`);
} else {
    console.warn(`⚠️  Container #niveaux-container-accueil non trouvé`);
    console.log('   → Assurez-vous d\'être sur la page "Accueil"');
}
console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 3: Tester afficherNiveaux() - Génération HTML
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 3: afficherNiveaux() - Génération HTML');
console.log('─────────────────────────────────────────────────────────────');
console.log('Appel async en cours...\n');

afficherNiveaux().then(html => {
    console.log(`✅ HTML généré avec succès`);
    console.log(`   Length: ${html.length} caractères`);
    
    // Vérifier structure
    let testsPassed = 0;
    const totalTests = 6;
    
    if (html.includes('niveaux-grid')) {
        console.log(`✅ Contient class 'niveaux-grid'`);
        testsPassed++;
    } else {
        console.error(`❌ Manque class 'niveaux-grid'`);
    }
    
    if (html.includes('niveau-card')) {
        console.log(`✅ Contient class 'niveau-card'`);
        testsPassed++;
    } else {
        console.error(`❌ Manque class 'niveau-card'`);
    }
    
    if (html.includes('progress-ring')) {
        console.log(`✅ Contient SVG 'progress-ring'`);
        testsPassed++;
    } else {
        console.error(`❌ Manque SVG 'progress-ring'`);
    }
    
    // Vérifier 4 niveaux
    const niveauxCount = (html.match(/data-niveau="/g) || []).length;
    if (niveauxCount === 4) {
        console.log(`✅ Contient 4 niveaux (N1-N4)`);
        testsPassed++;
    } else {
        console.error(`❌ Trouvé ${niveauxCount} niveaux (attendu: 4)`);
    }
    
    // Vérifier locked/unlocked
    if (html.includes('data-locked="false"') && html.includes('data-locked="true"')) {
        console.log(`✅ Contient data-locked attributes`);
        testsPassed++;
    } else {
        console.error(`❌ Manque data-locked attributes`);
    }
    
    // Vérifier boutons
    if (html.includes('Commencer') && html.includes('Verrouillé')) {
        console.log(`✅ Contient boutons Commencer/Verrouillé`);
        testsPassed++;
    } else {
        console.error(`❌ Manque boutons Commencer/Verrouillé`);
    }
    
    console.log(`\n✅ Résultat: ${testsPassed}/${totalTests} assertions OK`);
    
}).catch(error => {
    console.error(`❌ Erreur afficherNiveaux():`, error);
});

console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 4: Vérifier cartes dans DOM (si accueil chargée)
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 4: Cartes niveaux dans DOM');
console.log('─────────────────────────────────────────────────────────────');

setTimeout(() => {
    const cartes = document.querySelectorAll('.niveau-card');
    
    if (cartes.length === 0) {
        console.warn('⚠️  Aucune carte trouvée dans DOM');
        console.log('   → Les cartes se chargent async, patientez ou rechargez');
    } else {
        console.log(`✅ ${cartes.length} cartes trouvées\n`);
        
        cartes.forEach(carte => {
            const niveauId = carte.dataset.niveau;
            const locked = carte.dataset.locked;
            const statusEmoji = locked === 'true' ? '🔒' : '✅';
            
            console.log(`   ${statusEmoji} ${niveauId}: locked=${locked}`);
        });
        
        // Vérifier valeurs correctes
        console.log('\n✅ Validation locked/unlocked:');
        const carte_N1 = document.querySelector('[data-niveau="N1"]');
        if (carte_N1?.dataset.locked === 'false') {
            console.log(`   ✅ N1 = unlocked`);
        } else {
            console.error(`   ❌ N1 = ${carte_N1?.dataset.locked} (attendu: false)`);
        }
        
        const carte_N2 = document.querySelector('[data-niveau="N2"]');
        if (carte_N2?.dataset.locked === 'true') {
            console.log(`   ✅ N2 = locked`);
        } else {
            console.error(`   ❌ N2 = ${carte_N2?.dataset.locked} (attendu: true)`);
        }
    }
}, 1000);

console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 5: Vérifier buttons
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 5: Boutons dans les cartes');
console.log('─────────────────────────────────────────────────────────────');

setTimeout(() => {
    const btn_N1 = document.querySelector('[data-niveau="N1"] button');
    const btn_N2 = document.querySelector('[data-niveau="N2"] button');
    
    if (btn_N1) {
        console.log(`✅ N1 button: "${btn_N1.textContent.trim()}"`);
        console.log(`   Disabled: ${btn_N1.disabled}`);
    } else {
        console.error(`❌ N1 button non trouvé`);
    }
    
    if (btn_N2) {
        console.log(`✅ N2 button: "${btn_N2.textContent.trim()}"`);
        console.log(`   Disabled: ${btn_N2.disabled}`);
    } else {
        console.error(`❌ N2 button non trouvé`);
    }
}, 1000);

console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 6: État des niveaux
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 6: État des niveaux (getNiveauState)');
console.log('─────────────────────────────────────────────────────────────');

['N1', 'N2', 'N3', 'N4'].forEach(niveauId => {
    const state = getNiveauState(niveauId);
    const statusIcon = state.unlocked ? '✅' : '🔒';
    
    console.log(`${statusIcon} ${niveauId}:`);
    console.log(`   unlocked: ${state.unlocked}`);
    console.log(`   completion: ${state.completion}%`);
    console.log(`   chapitres: ${state.chapitres}`);
});

console.log('');

// ─────────────────────────────────────────────────────────────────
// TEST 7: Simulation clics (optionnel)
// ─────────────────────────────────────────────────────────────────
console.log('📝 TEST 7: Simulation clics boutons');
console.log('─────────────────────────────────────────────────────────────');
console.log('Pour tester les clics manuellement:');
console.log('');
console.log('// Clic N1 "Commencer":');
console.log('document.querySelector("[data-niveau=\'N1\'] button").click();');
console.log('');
console.log('// Clic N2 "Verrouillé":');
console.log('document.querySelector("[data-niveau=\'N2\'] button").click();');
console.log('// Output attendu: Alerte "niveau N2 est verrouillé"');
console.log('');

// ─────────────────────────────────────────────────────────────────
// RÉSUMÉ FINAL
// ─────────────────────────────────────────────────────────────────
setTimeout(() => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ SUITE DE TESTS COMPLÉTÉE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 RÉSULTATS ATTENDUS:');
    console.log('   ✅ 4 cartes niveau affichées');
    console.log('   ✅ N1: data-locked="false" + bouton "Commencer"');
    console.log('   ✅ N2-N4: data-locked="true" + bouton "Verrouillé"');
    console.log('   ✅ SVG progress rings visibles');
    console.log('   ✅ Clic N1 charge chapitres');
    console.log('   ✅ Clic N2-N4 affiche alerte');
    console.log('');
    console.log('💡 NEXT STEPS:');
    console.log('   1. Vérifier styles CSS (.niveau-card visible)');
    console.log('   2. Tester navigation complète');
    console.log('   3. Tester déblocage progressif');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
}, 2000);
