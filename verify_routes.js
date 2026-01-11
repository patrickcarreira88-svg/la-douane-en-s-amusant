#!/usr/bin/env node

/**
 * VÉRIFICATION RAPIDE - 15 ROUTES IMPLÉMENTÉES
 * Script de validation du serveur.js
 */

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
const content = fs.readFileSync(serverPath, 'utf8');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('✅ VÉRIFICATION IMPLÉMENTATION - 15 ROUTES');
console.log('═══════════════════════════════════════════════════════════\n');

// Vérifications
const checks = [
    { name: 'Dépendance execSync', pattern: /const.*execSync.*require.*child_process/ },
    { name: 'Constante DATA_DIR', pattern: /const.*DATA_DIR.*=.*path\.join/ },
    { name: 'ROUTE 1: GET /api/niveaux', pattern: /app\.get\('\/api\/niveaux'/ },
    { name: 'ROUTE 2: GET /api/niveaux/:niveauId/chapitres', pattern: /app\.get\('\/api\/niveaux\/:niveauId\/chapitres'/ },
    { name: 'ROUTE 3: POST /api/niveaux/:niveauId/chapitres', pattern: /app\.post\('\/api\/niveaux\/:niveauId\/chapitres'/ },
    { name: 'ROUTE 4: GET /api/chapitre/:chapterId', pattern: /app\.get\('\/api\/chapitre\/:chapterId'/ },
    { name: 'ROUTE 5: PUT /api/chapitre/:chapterId', pattern: /app\.put\('\/api\/chapitre\/:chapterId'/ },
    { name: 'ROUTE 6: DELETE /api/chapitre/:chapterId', pattern: /app\.delete\('\/api\/chapitre\/:chapterId'/ },
    { name: 'ROUTE 7: POST /api/chapitre/:chapterId/etape', pattern: /app\.post\('\/api\/chapitre\/:chapterId\/etape'/ },
    { name: 'ROUTE 8: GET /api/etape/:etapeId', pattern: /app\.get\('\/api\/etape\/:etapeId'/ },
    { name: 'ROUTE 9: PUT /api/etape/:etapeId', pattern: /app\.put\('\/api\/etape\/:etapeId'/ },
    { name: 'ROUTE 10: DELETE /api/etape/:etapeId', pattern: /app\.delete\('\/api\/etape\/:etapeId'/ },
    { name: 'ROUTE 11: POST /api/etape/:etapeId/reorder', pattern: /app\.post\('\/api\/etape\/:etapeId\/reorder'/ },
    { name: 'ROUTE 12: POST /api/etape/:etapeId/exercice', pattern: /app\.post\('\/api\/etape\/:etapeId\/exercice'/ },
    { name: 'ROUTE 13: GET /api/exercice/:exerciceId', pattern: /app\.get\('\/api\/exercice\/:exerciceId'/ },
    { name: 'ROUTE 14: PUT /api/exercice/:exerciceId', pattern: /app\.put\('\/api\/exercice\/:exerciceId'/ },
    { name: 'ROUTE 15: DELETE /api/exercice/:exerciceId', pattern: /app\.delete\('\/api\/exercice\/:exerciceId'/ },
];

let passed = 0;
let failed = 0;

checks.forEach((check, index) => {
    const isFound = check.pattern.test(content);
    const status = isFound ? '✅' : '❌';
    const statusText = isFound ? 'OK' : 'MANQUANT';
    
    console.log(`${status} ${String(index + 1).padStart(2, '0')}. ${check.name.padEnd(50)} [${statusText}]`);
    
    if (isFound) {
        passed++;
    } else {
        failed++;
    }
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log(`RÉSULTATS: ${passed} PASSÉS / ${failed} ÉCHOUÉS`);

if (failed === 0) {
    console.log('✅ TOUS LES CONTRÔLES RÉUSSIS - PRÊT POUR L\'ÉTAPE 3!');
} else {
    console.log('❌ CERTAINS CONTRÔLES ONT ÉCHOUÉ');
    process.exit(1);
}

console.log('═══════════════════════════════════════════════════════════\n');

// Afficher les stats du fichier
const lineCount = content.split('\n').length;
const routeCount = (content.match(/app\.(get|post|put|delete)\(/g) || []).length;

console.log('📊 STATISTIQUES DU FICHIER:');
console.log(`   - Lignes de code: ${lineCount}`);
console.log(`   - Routes définie: ${routeCount}`);
console.log(`   - Taille: ${(Buffer.byteLength(content) / 1024).toFixed(2)} KB\n`);
