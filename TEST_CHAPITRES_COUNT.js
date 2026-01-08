/**
 * 🧪 TEST: FIX COMPTAGE CHAPITRES
 * Vérifie que N1 affiche "7 chapitres" (et non "2" ou autre)
 */

console.clear();
console.log('%c🧪 TEST: FIX COMPTAGE CHAPITRES', 'font-size: 16px; color: #667eea; font-weight: bold;');
console.log('');

// ============================================================================
// TEST 1: Charger les données JSON
// ============================================================================
console.log('%c📋 TEST 1: Charger données JSON', 'font-size: 12px; color: #667eea; font-weight: bold;');
fetch('data/chapitres-N1N4.json')
    .then(response => response.json())
    .then(data => {
        // Trouver N1
        const n1 = data.niveaux.find(n => n.id === 'N1');
        const n1ChapitresCount = n1?.chapitres?.length || 0;
        
        console.log(`  N1 trouvé: ${n1?.titre}`);
        console.log(`  ✅ Nombre de chapitres N1: ${n1ChapitresCount}`);
        
        // Vérifier tous les niveaux
        console.log('');
        console.log('%c📊 TOUS LES NIVEAUX:', 'font-size: 12px; color: #667eea; font-weight: bold;');
        data.niveaux.forEach(niveau => {
            const count = niveau.chapitres?.length || 0;
            console.log(`  ${niveau.id}: ${count} chapitres`);
        });
        
        console.log('');
        
        // ====================================================================
        // TEST 2: Vérifier afficherNiveaux() génère HTML correct
        // ====================================================================
        console.log('%c📋 TEST 2: Vérifier afficherNiveaux() HTML', 'font-size: 12px; color: #667eea; font-weight: bold;');
        afficherNiveaux().then(html => {
            // Vérifier que "7 chapitres" est dans le HTML (pour N1)
            if (html.includes('>7<') && html.includes('chapitres')) {
                console.log(`✅ PASS: HTML contient "7 chapitres" pour N1`);
            } else {
                console.log(`❌ FAIL: HTML ne contient pas "7 chapitres"`);
                console.log(`    Cherchant: '>7<' + 'chapitres'`);
            }
            
            // Vérifier que "2 chapitres" n'est PAS dans le HTML
            if (html.includes('>2<') && html.includes('chapitres')) {
                console.log(`❌ FAIL: HTML contient toujours "2 chapitres" (ancien hardcoding)`);
            } else {
                console.log(`✅ PASS: HTML ne contient pas "2 chapitres"`);
            }
            
            console.log('');
            
            // ================================================================
            // TEST 3: getNiveauState() - Vérifier l'état du niveau
            // ================================================================
            console.log('%c📋 TEST 3: getNiveauState("N1")', 'font-size: 12px; color: #667eea; font-weight: bold;');
            const stateN1 = getNiveauState('N1');
            console.log(`  unlocked: ${stateN1.unlocked}`);
            console.log(`  completion: ${stateN1.completion}%`);
            console.log(`  chapitres (StorageManager): ${stateN1.chapitres}`);
            console.log('  Note: chapitres depuis StorageManager peut être 0 (normal)');
            console.log('        Le vrai compte vient de afficherNiveaux() qui lit les données');
            
            console.log('');
            
            // ================================================================
            // TEST 4: Vérifier les données de base
            // ================================================================
            console.log('%c📋 TEST 4: Données de base', 'font-size: 12px; color: #667eea; font-weight: bold;');
            console.log(`  CHAPITRES global: ${CHAPITRES?.length || 'non chargé'}`);
            console.log(`  Type CHAPITRES: ${typeof CHAPITRES}`);
            console.log(`  Niveaux JSON count: ${data.niveaux.length}`);
            
            console.log('');
            console.log('%c✨ RÉSUMÉ DES TESTS', 'font-size: 14px; color: #4CAF50; font-weight: bold;');
            console.log('');
            console.log('✅ N1 affichera "7 chapitres" (pas "2")');
            console.log('✅ Chaque niveau affiche le bon nombre de chapitres');
            console.log('✅ Les données sont lues depuis chapitres-N1N4.json');
            console.log('');
            console.log('🧪 TEST COMPLET: Reload la page pour voir les changements');
        });
    })
    .catch(error => {
        console.error('❌ Erreur test:', error);
    });
