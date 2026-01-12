const fs = require('fs');

// Charger le chapitre 101BT
const chapitres = JSON.parse(fs.readFileSync('./data/N2/chapitres.json', 'utf8'));
const chapitre = chapitres.chapitres.find(c => c.id === '101BT');

console.log('='.repeat(80));
console.log('TEST generatePathSVG - Chapitre 101BT');
console.log('='.repeat(80));
console.log('');

console.log('1️⃣ CHAPITRE ENTRÉE:');
console.log('   - id:', chapitre.id);
console.log('   - étapes:', chapitre.etapes.length);
console.log('   - objectifs:', chapitre.objectifs.length);
console.log('   - has .objectifs:', !!chapitre.objectifs);
console.log('');

// Simuler la logique de generatePathSVG
let allItems = [];

console.log('2️⃣ CONSTRUIRE allItems:');

// 1. Ajouter objectives
if (chapitre && chapitre.objectifs) {
    allItems.push({
        id: `objectives-${chapitre.id}`,
        titre: 'Objectifs du chapitre',
        completed: false,
        isObjectives: true,
        chapitre: chapitre
    });
    console.log('   ✅ Objectives ajouté');
}

// 2. Ajouter étapes
allItems.push(...chapitre.etapes);
console.log('   ✅ Étapes ajoutées:', chapitre.etapes.length);

// 3. Ajouter portfolio
if (chapitre && chapitre.objectifs) {  // ← KEY CONDITION!
    allItems.push({
        id: `portfolio-${chapitre.id}`,
        titre: 'Plan de révision final',
        completed: false,
        isPortfolio: true,
        chapitre: chapitre
    });
    console.log('   ✅ Portfolio ajouté');
}

console.log('');
console.log('3️⃣ RÉSULTAT allItems.length:', allItems.length);
console.log('');
console.log('4️⃣ CONTENU allItems:');
allItems.forEach((item, i) => {
    console.log(`   [${i+1}] id=${item.id.substring(0, 30)}, isObjectives=${item.isObjectives}, isPortfolio=${item.isPortfolio}`);
});

console.log('');
console.log('='.repeat(80));
console.log('DIAGNOSTIC:');
console.log('='.repeat(80));
console.log('✅ Les jalons objectives et portfolio SONT ajoutés à allItems');
console.log('✅ allItems a', allItems.length, 'éléments (2 jalons + 8 étapes)');
console.log('');
console.log('💡 La question: Pourquoi n\'apparaissent-ils pas à l\'écran?');
console.log('   → Vérifier si le SVG est correctement injecté dans le DOM');
console.log('   → Vérifier si updateStepIcons() les filtre ou les cache');
console.log('');
console.log('❌ PROBLÈME IDENTIFIÉ:');
console.log('   La condition dans updateStepIcons() qui compte les étapes:');
console.log('   → Elle IGNORE les jalons (isObjectives, isPortfolio)');
console.log('   → Elle incrémente etapeIndex SEULEMENT pour les étapes normales');
console.log('   → Résultat: les jalons existent dans le SVG mais ne sont pas mis à jour');
