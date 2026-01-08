/**
 * TEST: Structure vidéo unifiée
 * Vérifie que les 3 vidéos de CH1 ont la bonne structure
 */

const fs = require('fs');
const path = require('path');

// Charger les données
const dataPath = path.join(__dirname, 'data', 'chapitres.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('🧪 TEST: Structure vidéo unifiée\n');

// Chercher les 3 vidéos de CH1
const ch1 = data.chapitres[0]; // CH1 est le premier chapitre
console.log(`📍 Chapitre: ${ch1.id} - ${ch1.titre}\n`);

let videoTests = [
    { id: 'ch1_ex_001', expectedType: 'youtube', expectedKey: 'youtube' },
    { id: 'ch1_ex_003', expectedType: 'local', expectedFile: 'Marchandise' },
    { id: 'ch1_ex_004', expectedType: 'local', expectedFile: 'Dédouanement' }
];

let totalTests = 0;
let passedTests = 0;

// Parcourir les étapes et exercices
ch1.etapes.forEach((etape, idx) => {
    if (etape.exercices) {
        etape.exercices.forEach(exercice => {
            const testConfig = videoTests.find(t => t.id === exercice.id);
            
            if (testConfig && exercice.type === 'video') {
                totalTests++;
                console.log(`\n📹 Test ${totalTests}: ${exercice.id}`);
                console.log(`   Type: ${exercice.type}`);
                
                if (!exercice.content) {
                    console.log(`   ❌ FAIL: Pas de champ 'content'`);
                } else {
                    const content = exercice.content;
                    
                    // Vérifier videoType
                    if (content.videoType === testConfig.expectedType) {
                        console.log(`   ✅ videoType: ${content.videoType}`);
                        passedTests++;
                    } else {
                        console.log(`   ❌ videoType: ${content.videoType} (attendu: ${testConfig.expectedType})`);
                    }
                    
                    // Vérifier URL
                    if (content.url) {
                        console.log(`   ✅ URL présente: ${content.url}`);
                        if (testConfig.expectedType === 'youtube') {
                            if (content.url.includes('youtube')) {
                                console.log(`   ✅ Format YouTube valide`);
                            } else {
                                console.log(`   ❌ URL YouTube invalide`);
                            }
                        } else if (testConfig.expectedType === 'local') {
                            if (content.url.includes(testConfig.expectedFile)) {
                                console.log(`   ✅ Chemin local valide`);
                            } else {
                                console.log(`   ❌ Chemin local incorrect (cherche: ${testConfig.expectedFile})`);
                            }
                        }
                    } else {
                        console.log(`   ❌ URL manquante`);
                    }
                    
                    // Vérifier description
                    if (content.description) {
                        console.log(`   ✅ Description: "${content.description.substring(0, 50)}..."`);
                    }
                }
            }
        });
    }
});

console.log(`\n\n📊 RÉSUMÉ: ${passedTests}/${totalTests} tests passés`);

if (passedTests === totalTests) {
    console.log('✅ Tous les tests sont passés!');
    process.exit(0);
} else {
    console.log('❌ Certains tests ont échoué');
    process.exit(1);
}
