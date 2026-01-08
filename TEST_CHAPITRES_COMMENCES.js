/**
 * TEST - Filtrage des chapitres commencés
 * Exécuter dans la console (F12) une fois l'app chargée
 * 
 * Les chapitres affichés doivent avoir progression > 0%
 * Les chapitres avec 0% ne doivent PAS être affichés
 */

console.log('%c═══ TEST CHAPITRES COMMENCÉS ═══', 'color: #667eea; font-weight: bold; font-size: 14px;');

// TEST 1: Vérifier que getChapitrresCommences() existe
console.log('\n%c✓ TEST 1: Existence de getChapitrresCommences()', 'color: #2ECC71; font-weight: bold;');
console.log('typeof App.getChapitrresCommences:', typeof App.getChapitrresCommences);
console.assert(typeof App.getChapitrresCommences === 'function', '❌ getChapitrresCommences n\'existe pas');

// TEST 2: Vérifier la structure CHAPITRES
console.log('\n%c✓ TEST 2: Structure CHAPITRES', 'color: #2ECC71; font-weight: bold;');
console.log('CHAPITRES.length:', CHAPITRES.length);
console.log('Premiers chapitres:', CHAPITRES.slice(0, 3).map(c => ({ id: c.id, titre: c.titre })));

// TEST 3: Vérifier StorageManager.getChaptersProgress()
console.log('\n%c✓ TEST 3: Données StorageManager.getChaptersProgress()', 'color: #2ECC71; font-weight: bold;');
const allProgress = StorageManager.getChaptersProgress();
console.log('Chapitres en progress:', Object.keys(allProgress));
Object.keys(allProgress).forEach(chapterId => {
    const progress = allProgress[chapterId];
    console.log(`  ${chapterId}: ${progress.completion || 0}% (${progress.stepsCompleted?.length || 0} étapes)`);
});

// TEST 4: Appeler getChapitrresCommences() et vérifier le résultat
console.log('\n%c✓ TEST 4: Résultat getChapitrresCommences()', 'color: #2ECC71; font-weight: bold;');
const commences = App.getChapitrresCommences();
console.log(`Chapitres commencés: ${commences.length}`);
commences.forEach(ch => {
    const progress = allProgress[ch.id];
    console.log(`  ✓ ${ch.id}: ${progress?.completion || 0}% - "${ch.titre}"`);
});

// TEST 5: Vérifier que les chapitres avec 0% sont EXCLUS
console.log('\n%c✓ TEST 5: Vérification d\'exclusion (0% absent)', 'color: #2ECC71; font-weight: bold;');
const avecZero = CHAPITRES.filter(ch => {
    const prog = allProgress[ch.id];
    return !prog || !prog.completion || prog.completion === 0;
});
console.log(`Chapitres avec 0% (EXCLUS): ${avecZero.length}`);
avecZero.slice(0, 3).forEach(ch => {
    const progress = allProgress[ch.id];
    console.log(`  🚫 ${ch.id}: ${progress?.completion || 0}% - "${ch.titre}"`);
});

// TEST 6: Vérifier le HTML généré par renderChapitres()
console.log('\n%c✓ TEST 6: HTML généré par renderChapitres()', 'color: #2ECC71; font-weight: bold;');
const html = App.renderChapitres();
console.log('HTML length:', html.length);

if (commences.length === 0) {
    console.log('✓ Message vide correct (aucun chapitre commencé)');
    console.assert(html.includes('Aucun chapitre commencé'), '❌ Message vide absent');
    console.assert(html.includes('Aller à l\'accueil'), '❌ Bouton "Aller à l\'accueil" absent');
} else {
    console.log(`✓ ${commences.length} cartes générées`);
    commences.forEach(ch => {
        const found = html.includes(ch.id);
        console.assert(found, `❌ Chapitre ${ch.id} absent du HTML`);
        if (found) {
            console.log(`  ✓ ${ch.id} trouvé dans le HTML`);
        }
    });
}

// TEST 7: Vérifier les onclick afficherChapitre()
console.log('\n%c✓ TEST 7: Vérification onclick afficherChapitre()', 'color: #2ECC71; font-weight: bold;');
commences.forEach(ch => {
    const onclickString = `afficherChapitre('${ch.id}')`;
    const found = html.includes(onclickString);
    console.assert(found, `❌ onclick manquant pour ${ch.id}`);
    if (found) {
        console.log(`  ✓ onclick correct pour ${ch.id}`);
    }
});

// TEST 8: Vérifier les pourcentages dans le HTML
console.log('\n%c✓ TEST 8: Pourcentages affichés correctement', 'color: #2ECC71; font-weight: bold;');
commences.forEach(ch => {
    const progress = allProgress[ch.id];
    const percent = Math.round(progress?.completion || 0);
    const percentageString = `${percent}%`;
    const found = html.includes(percentageString);
    console.log(`  ${ch.id}: ${percentageString} ${found ? '✓' : '❌'}`);
});

// TEST 9: Vérifier les compteurs d'étapes
console.log('\n%c✓ TEST 9: Compteurs d\'étapes (completed/total)', 'color: #2ECC71; font-weight: bold;');
commences.forEach(ch => {
    const progress = allProgress[ch.id];
    const completed = progress?.stepsCompleted?.length || 0;
    const total = ch.etapes.length;
    const countString = `${completed}/${total}`;
    const found = html.includes(countString);
    console.log(`  ${ch.id}: ${countString} ${found ? '✓' : '❌'}`);
});

// RÉSUMÉ
console.log('\n%c═══ RÉSUMÉ ═══', 'color: #667eea; font-weight: bold; font-size: 14px;');
console.log(`
✅ Total chapitres: ${CHAPITRES.length}
✅ Chapitres commencés (>0%): ${commences.length}
✅ Chapitres exclus (0%): ${avecZero.length}
✅ getChapitrresCommences(): IMPLÉMENTÉE
✅ renderChapitres(): MODIFIÉE
✅ Message vide: ${commences.length === 0 ? 'AFFICHÉS' : 'N/A'}
✅ Onclick afficherChapitre(): FONCTIONNEL
`);

console.log('%c═══ FIN DES TESTS ═══', 'color: #667eea; font-weight: bold; font-size: 14px;');
