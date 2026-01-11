const fs = require('fs');
const path = require('path');

// Charger tous les fichiers de chapitres
const dataDir = './data';
const levels = ['N1', 'N2', 'N3', 'N4'];

console.log('🔄 NORMALISATION DES IDS D\'ÉTAPES\n');

levels.forEach(level => {
    const chapFile = path.join(dataDir, level, 'chapitres.json');
    
    if (!fs.existsSync(chapFile)) {
        console.log(`⏭️  ${level}: Fichier inexistant, skipping\n`);
        return;
    }
    
    const data = JSON.parse(fs.readFileSync(chapFile, 'utf8'));
    let modified = false;
    
    console.log(`📖 ${level}/chapitres.json:`);
    
    // Pour chaque chapitre
    data.chapitres.forEach(chapitre => {
        if (!chapitre.etapes) return;
        
        console.log(`   ├─ ${chapitre.id}:`);
        
        // Pour chaque étape, normaliser l'ID
        chapitre.etapes.forEach((etape, index) => {
            const oldId = etape.id;
            
            // Extraire le numéro de l'étape
            let stepNum = etape.ordre || etape.numero || (index + 1);
            
            // Construire le nouvel ID normalisé
            const chId = chapitre.id.replace(/^N\d_/, ''); // 'ch1'
            const newId = `${level}_${chId}_step${String(stepNum).padStart(2, '0')}`;
            
            if (oldId !== newId) {
                console.log(`       ✏️  "${oldId}" → "${newId}"`);
                etape.id = newId;
                modified = true;
            }
            
            // Normaliser aussi le champ: numero → ordre
            if (etape.numero !== undefined && etape.ordre === undefined) {
                console.log(`       🔧 Renommer: numero=${etape.numero} → ordre`);
                etape.ordre = etape.numero;
                delete etape.numero;
                modified = true;
            }
        });
    });
    
    if (modified) {
        fs.writeFileSync(chapFile, JSON.stringify(data, null, 2));
        console.log(`   ✅ ${level}/chapitres.json SAUVEGARDÉ\n`);
    } else {
        console.log(`   ✓ Aucun changement nécessaire\n`);
    }
});

console.log('🎉 NORMALISATION COMPLÈTE!\n');
