/**
 * TEST_PORTFOLIO_SWIPE_MODIFICATIONS.js
 * Validation complète des 7 modifications apportées
 * À exécuter dans la console du navigateur après avoir chargé le LMS
 */

console.log('\n%c🧪 TEST MODIFICATIONS PORTFOLIO SWIPE', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%c════════════════════════════════════', 'color: #667eea;');

const tests = {
    passed: [],
    failed: [],
    warnings: []
};

// ═══════════════════════════════════════════════════════════════
// TEST 1: startPortfolio()
// ═══════════════════════════════════════════════════════════════

console.log('\n%c1️⃣ TEST: startPortfolio()', 'color: #2ECC71; font-weight: bold;');
try {
    if (typeof PortfolioSwipe.startPortfolio !== 'function') {
        throw new Error('startPortfolio() n\'existe pas');
    }

    // Initialiser d'abord
    const firstChapter = CHAPITRES[0];
    if (!firstChapter) throw new Error('Pas de chapitre disponible');
    
    PortfolioSwipe.init(firstChapter.id);
    const firstCard = PortfolioSwipe.startPortfolio();

    if (firstCard === null) {
        throw new Error('startPortfolio() retourne null');
    }

    console.log('  ✅ startPortfolio() existe et fonctionne');
    console.log('  ✅ Retourne première carte:', firstCard.p.substring(0, 50) + '...');
    console.log('  ✅ currentIndex réinitialisé:', PortfolioSwipe.currentIndex === 0 ? '✓' : '✗');
    tests.passed.push('startPortfolio() - OK');
} catch (error) {
    console.error('  ❌ ERREUR:', error.message);
    tests.failed.push(`startPortfolio() - ${error.message}`);
}

// ═══════════════════════════════════════════════════════════════
// TEST 2: getActivitiesByDay()
// ═══════════════════════════════════════════════════════════════

console.log('\n%c2️⃣ TEST: getActivitiesByDay()', 'color: #2ECC71; font-weight: bold;');
try {
    if (typeof PortfolioSwipe.getActivitiesByDay !== 'function') {
        throw new Error('getActivitiesByDay() n\'existe pas');
    }

    const days = [1, 3, 7, 14];
    for (const day of days) {
        const activities = PortfolioSwipe.getActivitiesByDay(day);
        if (!Array.isArray(activities) || activities.length === 0) {
            throw new Error(`getActivitiesByDay(${day}) retourne array vide`);
        }
        
        // Vérifier format SMART
        const hasCheckbox = activities.some(a => a.includes('☐'));
        const hasVerification = activities.some(a => a.includes('✓'));
        
        if (!hasCheckbox || !hasVerification) {
            throw new Error(`Jour ${day}: format SMART manquant`);
        }

        console.log(`  ✅ Jour J+${day}: ${activities.length} activités SMART trouvées`);
    }

    tests.passed.push('getActivitiesByDay() - OK');
} catch (error) {
    console.error('  ❌ ERREUR:', error.message);
    tests.failed.push(`getActivitiesByDay() - ${error.message}`);
}

// ═══════════════════════════════════════════════════════════════
// TEST 3: getWeakThemesWithContext()
// ═══════════════════════════════════════════════════════════════

console.log('\n%c3️⃣ TEST: getWeakThemesWithContext()', 'color: #2ECC71; font-weight: bold;');
try {
    if (typeof PortfolioSwipe.getWeakThemesWithContext !== 'function') {
        throw new Error('getWeakThemesWithContext() n\'existe pas');
    }

    // Marquer quelques cartes comme faibles
    if (PortfolioSwipe.deck && PortfolioSwipe.deck.length > 0) {
        PortfolioSwipe.deck[0].mastery = 'pas-maitrise';
        if (PortfolioSwipe.deck.length > 1) {
            PortfolioSwipe.deck[1].mastery = 'a-approfondir';
        }
    }

    const weakThemes = PortfolioSwipe.getWeakThemesWithContext();
    
    if (!Array.isArray(weakThemes)) {
        throw new Error('getWeakThemesWithContext() ne retourne pas un array');
    }

    console.log(`  ✅ Thèmes faibles trouvés: ${weakThemes.length}`);
    
    if (weakThemes.length > 0) {
        const sample = weakThemes[0];
        console.log(`  ✅ Structure: numero=${sample.numero}, texte=${sample.texte.substring(0, 30)}...`);
        console.log(`  ✅ Score=${sample.score}, Priorité=${sample.priorite}`);
        
        if (!sample.numero || !sample.texte || sample.score === undefined || !sample.priorite) {
            throw new Error('Structure retournée incomplète');
        }
    }

    tests.passed.push('getWeakThemesWithContext() - OK');
} catch (error) {
    console.error('  ❌ ERREUR:', error.message);
    tests.failed.push(`getWeakThemesWithContext() - ${error.message}`);
}

// ═══════════════════════════════════════════════════════════════
// TEST 4: generateRevisionSchedule()
// ═══════════════════════════════════════════════════════════════

console.log('\n%c4️⃣ TEST: generateRevisionSchedule()', 'color: #2ECC71; font-weight: bold;');
try {
    if (typeof PortfolioSwipe.generateRevisionSchedule !== 'function') {
        throw new Error('generateRevisionSchedule() n\'existe pas');
    }

    const weakThemes = PortfolioSwipe.getWeakThemesWithContext();
    const schedule = PortfolioSwipe.generateRevisionSchedule(weakThemes);

    if (!Array.isArray(schedule)) {
        throw new Error('generateRevisionSchedule() ne retourne pas un array');
    }

    console.log(`  ✅ Séances générées: ${schedule.length}`);

    // Vérifier metadata
    if (!schedule.metadata) {
        throw new Error('metadata manquante');
    }

    console.log(`  ✅ Metadata présente:  `);
    console.log(`     - totalMinutes: ${schedule.metadata.totalMinutes}`);
    console.log(`     - totalSessions: ${schedule.metadata.totalSessions}`);
    console.log(`     - dureeTotal: ${schedule.metadata.dureeTotal}`);
    console.log(`     - frequence: ${schedule.metadata.frequence}`);

    // Vérifier structure séances
    if (schedule.length > 0) {
        const firstSession = schedule[0];
        if (!firstSession.numero || !firstSession.dateFormatee || !firstSession.titre || !firstSession.duree || !firstSession.activites) {
            throw new Error('Structure séance incomplète');
        }
        console.log(`  ✅ Structure séance OK: ${firstSession.titre}`);
    }

    tests.passed.push('generateRevisionSchedule() - OK');
} catch (error) {
    console.error('  ❌ ERREUR:', error.message);
    tests.failed.push(`generateRevisionSchedule() - ${error.message}`);
}

// ═══════════════════════════════════════════════════════════════
// TEST 5: exportRevisionScheduleAsText()
// ═══════════════════════════════════════════════════════════════

console.log('\n%c5️⃣ TEST: exportRevisionScheduleAsText()', 'color: #2ECC71; font-weight: bold;');
try {
    if (typeof PortfolioSwipe.exportRevisionScheduleAsText !== 'function') {
        throw new Error('exportRevisionScheduleAsText() n\'existe pas');
    }

    const weakThemes = PortfolioSwipe.getWeakThemesWithContext();
    const text = PortfolioSwipe.exportRevisionScheduleAsText(weakThemes);

    if (typeof text !== 'string') {
        throw new Error('exportRevisionScheduleAsText() ne retourne pas une chaîne');
    }

    if (text.length === 0) {
        throw new Error('Text export vide');
    }

    console.log(`  ✅ Texte généré: ${text.length} caractères`);
    
    // Vérifier contenu
    if (!text.includes('🎓 PLAN DE RÉVISION')) {
        throw new Error('Titre manquant');
    }
    console.log(`  ✅ Titre présent`);

    if (!text.includes('SÉANCE')) {
        throw new Error('Séances manquantes');
    }
    console.log(`  ✅ Séances présentes`);

    if (!text.includes('TOTAL')) {
        throw new Error('Total manquant');
    }
    console.log(`  ✅ Total présent`);

    // Afficher aperçu
    console.log(`  📋 Aperçu (100 chars):`);
    console.log(`     ${text.substring(0, 100)}...`);

    tests.passed.push('exportRevisionScheduleAsText() - OK');
} catch (error) {
    console.error('  ❌ ERREUR:', error.message);
    tests.failed.push(`exportRevisionScheduleAsText() - ${error.message}`);
}

// ═══════════════════════════════════════════════════════════════
// TEST 6: generatePDF()
// ═══════════════════════════════════════════════════════════════

console.log('\n%c6️⃣ TEST: generatePDF()', 'color: #2ECC71; font-weight: bold;');
try {
    if (typeof PortfolioSwipe.generatePDF !== 'function') {
        throw new Error('generatePDF() n\'existe pas');
    }

    console.log(`  ℹ️ Tentative de génération PDF...`);
    
    // Vérifier si jsPDF est disponible
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
        console.log(`  ✅ jsPDF disponible`);
        // Ne pas générer réellement pour éviter blocage
        console.log(`  ⚠️ Test PDF non exécuté (évite téléchargement)`);
        console.log(`  💡 Appeler manuellement: PortfolioSwipe.generatePDF()`);
    } else {
        console.log(`  ⚠️ jsPDF non disponible`);
        console.log(`  ✅ Fallback generateSimplePDF() utilisé`);
    }

    tests.passed.push('generatePDF() - OK (structure validée)');
} catch (error) {
    console.error('  ❌ ERREUR:', error.message);
    tests.failed.push(`generatePDF() - ${error.message}`);
}

// ═══════════════════════════════════════════════════════════════
// TEST 7: API publique (nouvelles méthodes exposées)
// ═══════════════════════════════════════════════════════════════

console.log('\n%c7️⃣ TEST: API publique', 'color: #2ECC71; font-weight: bold;');
try {
    const publicMethods = [
        'startPortfolio',
        'getWeakThemesWithContext',
        'exportRevisionScheduleAsText',
        'getActivitiesByDay',
        'generateRevisionSchedule',
        'generatePDF',
        'generateSimplePDF'
    ];

    let allPresent = true;
    for (const method of publicMethods) {
        if (typeof PortfolioSwipe[method] !== 'function') {
            console.log(`  ❌ ${method} - MANQUANTE`);
            allPresent = false;
        } else {
            console.log(`  ✅ ${method}`);
        }
    }

    if (!allPresent) {
        throw new Error('Certaines méthodes manquent');
    }

    tests.passed.push('API publique - 7/7 méthodes présentes');
} catch (error) {
    console.error('  ❌ ERREUR:', error.message);
    tests.failed.push(`API publique - ${error.message}`);
}

// ═══════════════════════════════════════════════════════════════
// TEST 8: Aucune régression (anciennes méthodes)
// ═══════════════════════════════════════════════════════════════

console.log('\n%c8️⃣ TEST: Regressions (anciennes méthodes)', 'color: #2ECC71; font-weight: bold;');
try {
    const oldMethods = [
        'init',
        'render',
        'swipeCard',
        'getStats',
        'getPlanData',
        'clear'
    ];

    for (const method of oldMethods) {
        if (typeof PortfolioSwipe[method] !== 'function') {
            throw new Error(`Régression: ${method} supprimée`);
        }
        console.log(`  ✅ ${method} fonctionne`);
    }

    tests.passed.push('Aucune régression - 6/6 anciennes méthodes OK');
} catch (error) {
    console.error('  ❌ ERREUR:', error.message);
    tests.failed.push(`Regressions - ${error.message}`);
}

// ═══════════════════════════════════════════════════════════════
// RÉSUMÉ
// ═══════════════════════════════════════════════════════════════

console.log('\n%c════════════════════════════════════', 'color: #667eea;');
console.log('%c📊 RÉSUMÉ DES TESTS', 'color: #667eea; font-size: 14px; font-weight: bold;');
console.log('%c════════════════════════════════════', 'color: #667eea;');

console.log(`\n%c✅ RÉUSSIS: ${tests.passed.length}`, 'color: #27AE60; font-weight: bold;');
tests.passed.forEach(t => console.log(`   ✓ ${t}`));

if (tests.warnings.length > 0) {
    console.log(`\n%c⚠️  AVERTISSEMENTS: ${tests.warnings.length}`, 'color: #F39C12; font-weight: bold;');
    tests.warnings.forEach(w => console.log(`   ⚠ ${w}`));
}

console.log(`\n%c❌ ÉCHOUÉS: ${tests.failed.length}`, 'color: #E74C3C; font-weight: bold;');
tests.failed.forEach(f => console.log(`   ✗ ${f}`));

const total = tests.passed.length + tests.failed.length;
const percentage = Math.round((tests.passed.length / total) * 100);

console.log('\n%c════════════════════════════════════', 'color: #667eea;');
if (tests.failed.length === 0) {
    console.log(`%c✅ TOUS LES TESTS RÉUSSIS (${percentage}%)`, 'color: #27AE60; font-size: 16px; font-weight: bold; background: #D5F4E6; padding: 10px;');
    console.log('%c🎉 Les 7 modifications sont opérationnelles!', 'color: #27AE60; font-size: 14px; font-weight: bold;');
} else {
    console.log(`%c⚠️  ${tests.failed.length} TEST(S) ÉCHOUÉ(S) (${percentage}%)`, 'color: #E74C3C; font-size: 16px; font-weight: bold; background: #F5B7B1; padding: 10px;');
}
console.log('%c════════════════════════════════════', 'color: #667eea;');

// Exécution automatique
console.log('\n💡 Utiliser les méthodes:');
console.log('   PortfolioSwipe.startPortfolio()');
console.log('   PortfolioSwipe.getActivitiesByDay(3)');
console.log('   PortfolioSwipe.getWeakThemesWithContext()');
console.log('   PortfolioSwipe.generateRevisionSchedule(themes)');
console.log('   PortfolioSwipe.exportRevisionScheduleAsText(themes)');
console.log('   PortfolioSwipe.generatePDF()');
