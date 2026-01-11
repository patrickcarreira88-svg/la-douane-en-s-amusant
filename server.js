/**
 * Backend Node.js pour LMS Douane
 * Serveur Express pour gestion des données et API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '::1';
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Routes API
app.get('/api/health', (req, res) => {
    res.json({
        status: '✅ Server running',
        version: '2.1.0',
        timestamp: new Date().toISOString()
    });
});

// Route pour servir les chapitres
app.get('/api/chapitres', (req, res) => {
    try {
        const chapitres = require('./data/chapitres.json');
        res.json(chapitres);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la lecture des chapitres' });
    }
});

// Route pour servir les exercices
app.get('/api/exercises/:type', (req, res) => {
    try {
        const type = req.params.type;
        const exercises = require(`./data/exercises/${type}.json`);
        res.json(exercises);
    } catch (error) {
        res.status(404).json({ error: `Exercices ${type} non trouvés` });
    }
});

// ============================================
// ENDPOINT: Sauvegarder un nouvel exercice
// ============================================
app.post('/api/save-exercise', (req, res) => {
    try {
        const newExercise = req.body;
        
        // Validation minimale
        if (!newExercise.id || !newExercise.type) {
            return res.status(400).json({ 
                error: 'ID et type requis' 
            });
        }
        
        // Déterminer le type d'exercice
        const exerciseType = newExercise.type;
        const exercisePath = path.join(__dirname, `data/${exerciseType}.json`);
        let exercises = { exercises: [] };
        
        // Charger les exercices existants
        try {
            const data = fs.readFileSync(exercisePath, 'utf8');
            exercises = JSON.parse(data);
        } catch (e) {
            // Fichier n'existe pas ou JSON invalide, on démarre vide
            exercises = { exercises: [] };
        }
        
        // Vérifier que l'ID n'existe pas déjà
        const exists = exercises.exercises.some(ex => ex.id === newExercise.id);
        if (exists) {
            return res.status(409).json({ 
                error: `L'exercice ${newExercise.id} existe déjà` 
            });
        }
        
        // Ajouter le nouvel exercice
        exercises.exercises.push(newExercise);
        
        // Sauvegarder dans le fichier
        fs.writeFileSync(
            exercisePath,
            JSON.stringify(exercises, null, 2),
            'utf8'
        );
        
        console.log(`✅ Exercice sauvegardé: ${newExercise.id}`);
        
        res.json({
            success: true,
            message: `Exercice ${newExercise.id} sauvegardé`,
            exercise: newExercise
        });
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        res.status(500).json({ 
            error: 'Erreur serveur lors de la sauvegarde' 
        });
    }
});

// ===================================
// ✅ 15 ROUTES AUTHORING SYSTEM
// ===================================

// ✅ ROUTE 1: Charger tous les niveaux (N1, N2, N3, N4)
app.get('/api/niveaux', (req, res) => {
    try {
        const validNiveaux = ['N1', 'N2', 'N3', 'N4'];
        const niveaux = [];
        
        // Charger chaque niveau
        for (const niveauId of validNiveaux) {
            const niveauPath = path.join(DATA_DIR, niveauId, 'chapitres.json');
            
            if (fs.existsSync(niveauPath)) {
                try {
                    const content = fs.readFileSync(niveauPath, 'utf8');
                    const data = JSON.parse(content);
                    const chapitres = data.chapitres || [];
                    
                    niveaux.push({
                        id: niveauId,
                        nom: `Niveau ${niveauId}`,
                        chapitres: chapitres.length,
                        status: 'chargé'
                    });
                } catch (e) {
                    console.warn(`⚠️ Erreur lecture ${niveauId}:`, e.message);
                    niveaux.push({
                        id: niveauId,
                        nom: `Niveau ${niveauId}`,
                        chapitres: 0,
                        status: 'erreur'
                    });
                }
            } else {
                niveaux.push({
                    id: niveauId,
                    nom: `Niveau ${niveauId}`,
                    chapitres: 0,
                    status: 'vide'
                });
            }
        }
        
        res.json({
            success: true,
            niveaux: niveaux,
            count: niveaux.length,
            message: 'Niveaux chargés avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur chargement niveaux:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur chargement niveaux: ' + error.message
        });
    }
});

// ✅ ROUTE 2: Charger les chapitres d'un niveau
// Route pour charger les exercices d'un chapitre spécifique
app.get('/api/niveaux/:niveauId/exercices/:chapterId', (req, res) => {
    try {
        const niveauId = req.params.niveauId.toUpperCase();
        const chapterId = req.params.chapterId;
        
        // Charger depuis /data/N1/exercices/ch1.json, etc.
        const exercicesPath = path.join(DATA_DIR, niveauId, 'exercices', `${chapterId}.json`);
        
        if (!fs.existsSync(exercicesPath)) {
            return res.json({
                success: true,
                exercices: [],
                count: 0,
                message: `Aucun exercice trouvé pour ${niveauId}/${chapterId}`
            });
        }
        
        try {
            const content = fs.readFileSync(exercicesPath, 'utf8');
            const data = JSON.parse(content);
            const exercices = data.exercices || [];
            
            res.json({
                success: true,
                exercices: exercices,
                count: exercices.length,
                message: `Exercices ${chapterId} chargés avec succès`
            });
        } catch (parseError) {
            console.error(`❌ Erreur parsing ${exercicesPath}:`, parseError.message);
            return res.status(500).json({
                success: false,
                error: 'Erreur parsing JSON: ' + parseError.message
            });
        }
    } catch (error) {
        console.error('❌ Erreur chargement exercices:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/niveaux/:niveauId/chapitres', (req, res) => {
    try {
        const niveauId = req.params.niveauId.toUpperCase();
        
        // Valider niveau
        const validNiveaux = ['N1', 'N2', 'N3', 'N4'];
        if (!validNiveaux.includes(niveauId)) {
            return res.status(400).json({
                success: false,
                error: `Niveau invalide: ${niveauId}. Niveaux acceptés: ${validNiveaux.join(', ')}`
            });
        }
        
        // Charger depuis /data/N1/chapitres.json, /data/N2/chapitres.json, etc.
        const chapitresPath = path.join(DATA_DIR, niveauId, 'chapitres.json');
        
        if (!fs.existsSync(chapitresPath)) {
            return res.json({
                success: true,
                chapitres: [],
                count: 0,
                message: `Aucun chapitre trouvé pour ${niveauId}`
            });
        }
        
        try {
            const content = fs.readFileSync(chapitresPath, 'utf8');
            const data = JSON.parse(content);
            const chapitres = data.chapitres || [];
            
            res.json({
                success: true,
                chapitres: chapitres,
                count: chapitres.length,
                message: `Chapitres ${niveauId} chargés avec succès`
            });
        } catch (parseError) {
            console.error(`❌ Erreur parsing ${chapitresPath}:`, parseError.message);
            return res.status(500).json({
                success: false,
                error: 'Erreur parsing JSON: ' + parseError.message
            });
        }
    } catch (error) {
        console.error('❌ Erreur chargement chapitres:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur chargement chapitres: ' + error.message
        });
    }
});

// ✅ ROUTE 2.5: Charger les exercices d'un chapitre
app.get('/api/niveaux/:niveauId/exercices/:chapterId', (req, res) => {
    try {
        const niveauId = req.params.niveauId.toUpperCase();
        const chapterId = req.params.chapterId;
        
        // Charger depuis /data/N1/exercices/ch1.json, etc.
        const exercicesPath = path.join(DATA_DIR, niveauId, 'exercices', `${chapterId}.json`);
        
        if (!fs.existsSync(exercicesPath)) {
            return res.json({
                success: true,
                exercices: [],
                count: 0,
                message: `Aucun exercice trouvé pour ${niveauId}/${chapterId}`
            });
        }
        
        try {
            const content = fs.readFileSync(exercicesPath, 'utf8');
            const data = JSON.parse(content);
            const exercices = data.exercices || [];
            
            res.json({
                success: true,
                exercices: exercices,
                count: exercices.length,
                message: `Exercices de ${chapterId} chargés avec succès`
            });
        } catch (parseError) {
            console.error(`❌ Erreur parsing ${exercicesPath}:`, parseError.message);
            return res.status(500).json({
                success: false,
                error: 'Erreur parsing JSON: ' + parseError.message
            });
        }
    } catch (error) {
        console.error('❌ Erreur chargement exercices:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur chargement exercices: ' + error.message
        });
    }
});

// ✅ ROUTE 3: Créer un nouveau chapitre
// ✅ ROUTE 3: Créer un nouveau chapitre
app.post('/api/niveaux/:niveauId/chapitres', (req, res) => {
    try {
        const niveauId = req.params.niveauId.toUpperCase();
        const { titre, description } = req.body;
        
        // Validation
        const validNiveaux = ['N1', 'N2', 'N3', 'N4'];
        if (!validNiveaux.includes(niveauId)) {
            return res.status(400).json({ success: false, error: `Niveau invalide: ${niveauId}` });
        }
        if (!titre || titre.trim() === '') {
            return res.status(400).json({ success: false, error: 'Titre requis' });
        }
        
        const niveauDir = path.join(DATA_DIR, niveauId);
        const chapitresPath = path.join(niveauDir, 'chapitres.json');
        
        // Créer dossier niveau s'il n'existe pas
        if (!fs.existsSync(niveauDir)) {
            fs.mkdirSync(niveauDir, { recursive: true });
        }
        
        // Créer dossier exercices
        const exercicesDir = path.join(niveauDir, 'exercices');
        if (!fs.existsSync(exercicesDir)) {
            fs.mkdirSync(exercicesDir, { recursive: true });
        }
        
        // Lire chapitres.json existant
        let chapitresData = { chapitres: [] };
        if (fs.existsSync(chapitresPath)) {
            try {
                chapitresData = JSON.parse(fs.readFileSync(chapitresPath, 'utf8'));
            } catch (e) {
                console.warn('⚠️ Erreur parsing chapitres.json, création nouveau');
            }
        }
        
        // Générer ID unique (format simple ch1, ch2, etc. pour cohérence avec chapitres existants)
        const chapterId = `ch${String(chapitresData.chapitres.length + 1).padStart(1, '0')}`;
        
        // Créer entrée chapitre
        const newChapitre = {
            id: chapterId,
            niveauId: niveauId,
            titre: titre,
            description: description || '',
            ordre: chapitresData.chapitres.length + 1,
            createdAt: new Date().toISOString()
        };
        
        chapitresData.chapitres.push(newChapitre);
        
        // Sauvegarder chapitres.json
        fs.writeFileSync(chapitresPath, JSON.stringify(chapitresData, null, 2), 'utf8');
        
        // Créer fichier exercices vide
        const exerciceFile = path.join(exercicesDir, `${chapterId}.json`);
        fs.writeFileSync(exerciceFile, JSON.stringify({ exercices: [] }, null, 2), 'utf8');
        
        console.log(`✅ Chapitre créé: ${chapterId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${chapitresPath}" "${exerciceFile}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Add chapter ${chapterId} via authoring tool"`, { cwd: __dirname, stdio: 'pipe' });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (e) { console.warn('⚠️ Git sync échoué'); }
        
        res.json({
            success: true,
            message: `Chapitre ${chapterId} créé`,
            chapitre: newChapitre,
            chapterId: chapterId,
            gitSync: gitSync
        });
        
    } catch (error) {
        console.error('❌ Erreur création chapitre:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 4: Charger un chapitre complet
app.get('/api/chapitre/:chapterId', (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        
        // Extraire niveau et numéro: chapterId peut être "ch1" ou "N1_ch1"
        const match = chapterId.match(/^(?:N\d_)?(ch\d+)$/) || chapterId.match(/^(N\d)_ch(\d+)$/);
        if (!match) {
            return res.status(400).json({ success: false, error: `Format invalide: ${chapterId}` });
        }
        
        // Déterminer niveauId et chapitre ID
        let niveauId, chapId;
        if (chapterId.includes('_')) {
            // Format: N1_ch1
            niveauId = chapterId.split('_')[0];
            chapId = chapterId.split('_')[1];
        } else {
            // Format: ch1 - besoin de le trouver dans les niveaux
            chapId = chapterId;
            // Chercher dans tous les niveaux
            let found = false;
            for (const level of ['N1', 'N2', 'N3', 'N4']) {
                const chapitresPath = path.join(DATA_DIR, level, 'chapitres.json');
                if (fs.existsSync(chapitresPath)) {
                    try {
                        const data = JSON.parse(fs.readFileSync(chapitresPath, 'utf8'));
                        const ch = data.chapitres.find(c => c.id === chapId);
                        if (ch) {
                            niveauId = level;
                            found = true;
                            break;
                        }
                    } catch (e) {}
                }
            }
            if (!found) {
                return res.status(404).json({ success: false, error: `Chapitre ${chapId} non trouvé` });
            }
        }
        
        const chapitresPath = path.join(DATA_DIR, niveauId, 'chapitres.json');
        
        if (!fs.existsSync(chapitresPath)) {
            return res.status(404).json({ success: false, error: `Chapitres non trouvés pour ${niveauId}` });
        }
        
        const chapitresData = JSON.parse(fs.readFileSync(chapitresPath, 'utf8'));
        const chapitre = chapitresData.chapitres.find(c => c.id === chapId);
        
        if (!chapitre) {
            return res.status(404).json({ success: false, error: `Chapitre ${chapId} non trouvé` });
        }
        
        res.json({
            success: true,
            chapitre: chapitre,
            etapes: chapitre.etapes || [],
            message: `Chapitre ${chapId} chargé`
        });
    } catch (error) {
        console.error('❌ Erreur chargement chapitre:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 5: Modifier un chapitre
app.put('/api/chapitre/:chapterId', (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        const { titre, description } = req.body;
        
        if (!titre || titre.trim() === '') {
            return res.status(400).json({ success: false, error: 'Titre requis' });
        }
        
        // Déterminer niveau
        let niveauId, chapId;
        if (chapterId.includes('_')) {
            niveauId = chapterId.split('_')[0];
            chapId = chapterId.split('_')[1];
        } else {
            chapId = chapterId;
            // Trouver le niveau
            for (const level of ['N1', 'N2', 'N3', 'N4']) {
                const path1 = path.join(DATA_DIR, level, 'chapitres.json');
                if (fs.existsSync(path1)) {
                    const data = JSON.parse(fs.readFileSync(path1, 'utf8'));
                    if (data.chapitres.find(c => c.id === chapId)) {
                        niveauId = level;
                        break;
                    }
                }
            }
            if (!niveauId) {
                return res.status(404).json({ success: false, error: `Chapitre non trouvé` });
            }
        }
        
        const chapitresPath = path.join(DATA_DIR, niveauId, 'chapitres.json');
        const chapitresData = JSON.parse(fs.readFileSync(chapitresPath, 'utf8'));
        const chIndex = chapitresData.chapitres.findIndex(c => c.id === chapId);
        
        if (chIndex === -1) {
            return res.status(404).json({ success: false, error: `Chapitre non trouvé` });
        }
        
        chapitresData.chapitres[chIndex].titre = titre;
        if (description) chapitresData.chapitres[chIndex].description = description;
        
        fs.writeFileSync(chapitresPath, JSON.stringify(chapitresData, null, 2), 'utf8');
        console.log(`✅ Chapitre modifié: ${chapId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${chapitresPath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Update chapter ${chapId}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (e) { console.warn('⚠️ Git sync échoué'); }
        
        res.json({
            success: true,
            message: 'Chapitre modifié',
            chapitre: chapitresData.chapitres[chIndex],
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur modification chapitre:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 6: Supprimer un chapitre (récursif)
app.delete('/api/chapitre/:chapterId', (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        
        // Déterminer niveau
        let niveauId, chapId;
        if (chapterId.includes('_')) {
            niveauId = chapterId.split('_')[0];
            chapId = chapterId.split('_')[1];
        } else {
            chapId = chapterId;
            for (const level of ['N1', 'N2', 'N3', 'N4']) {
                const path1 = path.join(DATA_DIR, level, 'chapitres.json');
                if (fs.existsSync(path1)) {
                    const data = JSON.parse(fs.readFileSync(path1, 'utf8'));
                    if (data.chapitres.find(c => c.id === chapId)) {
                        niveauId = level;
                        break;
                    }
                }
            }
            if (!niveauId) {
                return res.status(404).json({ success: false, error: `Chapitre non trouvé` });
            }
        }
        
        const chapitresPath = path.join(DATA_DIR, niveauId, 'chapitres.json');
        const chapitresData = JSON.parse(fs.readFileSync(chapitresPath, 'utf8'));
        chapitresData.chapitres = chapitresData.chapitres.filter(c => c.id !== chapId);
        
        // Supprimer aussi le fichier exercices
        const exercicePath = path.join(DATA_DIR, niveauId, 'exercices', `${chapId}.json`);
        if (fs.existsSync(exercicePath)) {
            fs.unlinkSync(exercicePath);
        }
        
        fs.writeFileSync(chapitresPath, JSON.stringify(chapitresData, null, 2), 'utf8');
        console.log(`✅ Chapitre supprimé: ${chapId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add -A`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Delete chapter ${chapId}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (e) { console.warn('⚠️ Git sync échoué'); }
        
        res.json({
            success: true,
            message: 'Chapitre supprimé',
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur suppression chapitre:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 7: Créer une étape
app.post('/api/chapitre/:chapterId/etape', (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        const { titre, type } = req.body;
        
        if (!titre || titre.trim() === '') {
            return res.status(400).json({ success: false, error: 'Titre requis' });
        }
        
        const validTypes = ['diagnostic', 'apprentissage', 'entrainement', 'evaluation', 'objectives'];
        if (!type || !validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({ success: false, error: `Type invalide` });
        }
        
        // Déterminer niveau
        let niveauId;
        if (chapterId.includes('_')) {
            niveauId = chapterId.split('_')[0];
        } else {
            for (const level of ['N1', 'N2', 'N3', 'N4']) {
                const path1 = path.join(DATA_DIR, level, 'chapitres.json');
                if (fs.existsSync(path1)) {
                    const data = JSON.parse(fs.readFileSync(path1, 'utf8'));
                    if (data.chapitres.find(c => c.id === chapterId)) {
                        niveauId = level;
                        break;
                    }
                }
            }
            if (!niveauId) {
                return res.status(404).json({ success: false, error: 'Chapitre non trouvé' });
            }
        }
        
        const chapitresPath = path.join(DATA_DIR, niveauId, 'chapitres.json');
        const chapitresData = JSON.parse(fs.readFileSync(chapitresPath, 'utf8'));
        const chapitre = chapitresData.chapitres.find(c => c.id === chapterId);
        
        if (!chapitre) {
            return res.status(404).json({ success: false, error: 'Chapitre non trouvé' });
        }
        
        // Générer ID étape (avec préfixe niveau pour compatibilité avec routes exercices)
        const etapes = chapitre.etapes || [];
        const nextStepNum = etapes.length + 1;
        // Extraire le chapterId sans préfixe niveau
        const chapterIdWithoutPrefix = chapterId.includes('_') ? chapterId.split('_').slice(1).join('_') : chapterId;
        const etapeId = `${niveauId}_${chapterIdWithoutPrefix}_step${String(nextStepNum).padStart(2, '0')}`;
        
        const nouvelleEtape = {
            id: etapeId,
            titre: titre,
            description: req.body.description || '',
            ordre: nextStepNum,
            type: type.toLowerCase(),
            createdAt: new Date().toISOString(),
            exercices: []
        };
        
        chapitre.etapes = chapitre.etapes || [];
        chapitre.etapes.push(nouvelleEtape);
        
        fs.writeFileSync(chapitresPath, JSON.stringify(chapitresData, null, 2), 'utf8');
        console.log(`✅ Étape créée: ${etapeId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${chapitresPath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Add step ${etapeId}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (e) { console.warn('⚠️ Git sync échoué'); }
        
        res.json({
            success: true,
            message: 'Étape créée',
            etape: nouvelleEtape,
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur création étape:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 8: Charger une étape
app.get('/api/etape/:etapeId', (req, res) => {
    try {
        const etapeId = req.params.etapeId;
        
        // Extraire chapterId - Format: N1_ch1_step01
        const match = etapeId.match(/^(N\d)_(ch\d+)_step\d+$/);
        if (!match) {
            return res.status(400).json({ success: false, error: 'Format etapeId invalide' });
        }
        
        const niveauId = match[1];    // 'N1'
        const chapterId = match[2];   // 'ch1' (JSON stores as 'ch1' not 'N1_ch1')
        
        const chapitresPath = path.join(DATA_DIR, niveauId, 'chapitres.json');
        if (!fs.existsSync(chapitresPath)) {
            return res.status(404).json({ success: false, error: 'Chapitres non trouvés' });
        }
        
        const chapitresData = JSON.parse(fs.readFileSync(chapitresPath, 'utf8'));
        const chapitre = chapitresData.chapitres.find(c => c.id === chapterId);
        
        if (!chapitre) {
            return res.status(404).json({ success: false, error: 'Chapitre non trouvé' });
        }
        
        const etape = (chapitre.etapes || []).find(e => e.id === etapeId);
        if (!etape) {
            return res.status(404).json({ success: false, error: 'Étape non trouvée' });
        }
        
        res.json({
            success: true,
            etape: etape,
            exercices: etape.exercices || []
        });
    } catch (error) {
        console.error('❌ Erreur chargement étape:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 9: Modifier une étape
app.put('/api/etape/:etapeId', (req, res) => {
    try {
        const etapeId = req.params.etapeId;
        const { titre, description, type } = req.body;
        
        // Extraire chapterId - Format: N1_ch1_step01
        let chapterId, niveauId;
        const match = etapeId.match(/^(N\d)_(ch\d+)_step\d+$/);
        
        if (!match) {
            return res.status(400).json({ success: false, error: 'Format etapeId invalide' });
        }
        
        niveauId = match[1];    // 'N1'
        chapterId = match[2];   // 'ch1' (JSON stores as 'ch1' not 'N1_ch1')
        
        const chapitresPath = path.join(DATA_DIR, niveauId, 'chapitres.json');
        const chapitresData = JSON.parse(fs.readFileSync(chapitresPath, 'utf8'));
        const chapitre = chapitresData.chapitres.find(c => c.id === chapterId);
        
        if (!chapitre) {
            return res.status(404).json({ success: false, error: 'Chapitre non trouvé' });
        }
        
        const etapeIndex = (chapitre.etapes || []).findIndex(e => e.id === etapeId);
        if (etapeIndex === -1) {
            return res.status(404).json({ success: false, error: 'Étape non trouvée' });
        }
        
        if (titre) chapitre.etapes[etapeIndex].titre = titre;
        if (description) chapitre.etapes[etapeIndex].description = description;
        if (type) chapitre.etapes[etapeIndex].type = type;
        
        fs.writeFileSync(chapitresPath, JSON.stringify(chapitresData, null, 2), 'utf8');
        console.log(`✅ Étape modifiée: ${etapeId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${chapitresPath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Update step ${etapeId}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (e) { console.warn('⚠️ Git sync échoué'); }
        
        res.json({
            success: true,
            message: 'Étape modifiée',
            etape: chapitre.etapes[etapeIndex],
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur modification étape:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 10: Supprimer une étape
app.delete('/api/etape/:etapeId', (req, res) => {
    try {
        const etapeId = req.params.etapeId;
        
        // Extraire chapterId - Format: N1_ch1_step01
        let chapterId, niveauId;
        const match = etapeId.match(/^(N\d)_(ch\d+)_step\d+$/);
        
        if (!match) {
            return res.status(400).json({ success: false, error: 'Format etapeId invalide' });
        }
        
        niveauId = match[1];    // 'N1'
        chapterId = match[2];   // 'ch1' (JSON stores as 'ch1' not 'N1_ch1')
        
        const chapitresPath = path.join(DATA_DIR, niveauId, 'chapitres.json');
        const chapitresData = JSON.parse(fs.readFileSync(chapitresPath, 'utf8'));
        const chapitre = chapitresData.chapitres.find(c => c.id === chapterId);
        
        if (!chapitre) {
            return res.status(404).json({ success: false, error: 'Chapitre non trouvé' });
        }
        
        // Supprimer étape
        chapitre.etapes = (chapitre.etapes || []).filter(e => e.id !== etapeId);
        
        fs.writeFileSync(chapitresPath, JSON.stringify(chapitresData, null, 2), 'utf8');
        console.log(`✅ Étape supprimée: ${etapeId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${chapitresPath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Delete step ${etapeId}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (e) { console.warn('⚠️ Git sync échoué'); }
        
        res.json({
            success: true,
            message: 'Étape supprimée',
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur suppression étape:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 11: Réordonner les étapes
app.post('/api/etape/:etapeId/reorder', (req, res) => {
    try {
        const etapeId = req.params.etapeId;
        const { newPosition } = req.body;
        
        if (newPosition === undefined || newPosition < 1) {
            return res.status(400).json({ success: false, error: 'newPosition requis' });
        }
        
        // Extraire chapterId - Format: N1_ch1_step01
        let chapterId, niveauId;
        const match = etapeId.match(/^(N\d)_(ch\d+)_step\d+$/);
        
        if (!match) {
            return res.status(400).json({ success: false, error: 'Format etapeId invalide' });
        }
        
        niveauId = match[1];    // 'N1'
        chapterId = match[2];   // 'ch1' (JSON stores as 'ch1' not 'N1_ch1')
        
        const chapitresPath = path.join(DATA_DIR, niveauId, 'chapitres.json');
        const chapitresData = JSON.parse(fs.readFileSync(chapitresPath, 'utf8'));
        const chapitre = chapitresData.chapitres.find(c => c.id === chapterId);
        
        if (!chapitre) {
            return res.status(404).json({ success: false, error: 'Chapitre non trouvé' });
        }
        
        const etapeIndex = (chapitre.etapes || []).findIndex(e => e.id === etapeId);
        if (etapeIndex === -1) {
            return res.status(404).json({ success: false, error: 'Étape non trouvée' });
        }
        
        // Déplacer l'étape
        const etape = chapitre.etapes.splice(etapeIndex, 1);
        chapitre.etapes.splice(newPosition - 1, 0, ...etape);
        
        fs.writeFileSync(chapitresPath, JSON.stringify(chapitresData, null, 2), 'utf8');
        console.log(`✅ Étapes réordonnées`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${chapitresPath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Reorder steps in ${chapterId}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (e) { console.warn('⚠️ Git sync échoué'); }
        
        res.json({
            success: true,
            message: 'Étapes réordonnées',
            etapes: chapitre.etapes,
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur réordonner étapes:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 12: Créer un exercice
app.post('/api/etape/:etapeId/exercice', (req, res) => {
    try {
        const etapeId = req.params.etapeId;
        const { type, titre, points, content } = req.body;
        
        // Validation
        const validTypes = ['qcm', 'vrai-faux', 'dragdrop', 'flashcards', 'video', 'lecture', 'scenario'];
        if (!type || !validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({ success: false, error: `Type invalide: ${validTypes.join(', ')}` });
        }
        if (!titre || titre.trim() === '') {
            return res.status(400).json({ success: false, error: 'Titre requis' });
        }
        if (!content) {
            return res.status(400).json({ success: false, error: 'Contenu requis' });
        }
        
        // Extraire chapterId et niveau
        const match = etapeId.match(/^(N\d)_(ch\d+)_step\d+$/);
        if (!match) {
            return res.status(400).json({ success: false, error: 'Format etapeId invalide' });
        }
        
        const niveauId = match[1];    // 'N1'
        const chapterId = match[2];   // 'ch1' (JSON stores as ch1.json, not N1_ch1.json)
        
        // Charger exercices.json pour ce chapitre
        const exercicesPath = path.join(DATA_DIR, niveauId, 'exercices', `${chapterId}.json`);
        
        if (!fs.existsSync(exercicesPath)) {
            return res.status(404).json({ success: false, error: 'Chapitre exercices non trouvé' });
        }
        
        let exercicesData = { exercices: [] };
        try {
            exercicesData = JSON.parse(fs.readFileSync(exercicesPath, 'utf8'));
        } catch (e) {
            console.warn('⚠️ Erreur parsing exercices.json');
        }
        
        // Générer ID exercice
        const nextExNum = exercicesData.exercices.length + 1;
        const exerciceId = `${etapeId}_ex${String(nextExNum).padStart(3, '0')}`;
        
        // Créer exercice
        const nouvelExercice = {
            id: exerciceId,
            etapeId: etapeId,
            type: type.toLowerCase(),
            titre: titre,
            points: points || 10,
            content: content,
            createdAt: new Date().toISOString()
        };
        
        exercicesData.exercices.push(nouvelExercice);
        fs.writeFileSync(exercicesPath, JSON.stringify(exercicesData, null, 2), 'utf8');
        console.log(`✅ Exercice créé: ${exerciceId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${exercicesPath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Add exercise ${exerciceId}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (e) { console.warn('⚠️ Git sync échoué'); }
        
        res.json({
            success: true,
            message: `Exercice ${exerciceId} créé`,
            exercice: nouvelExercice,
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur création exercice:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 13: Charger un exercice
app.get('/api/exercice/:exerciceId', (req, res) => {
    try {
        const exerciceId = req.params.exerciceId;
        const match = exerciceId.match(/^(N\d)_(ch\d+)_step\d+_ex\d+$/);
        if (!match) {
            return res.status(400).json({ success: false, error: 'Format exerciceId invalide' });
        }
        
        const niveauId = match[1];   // 'N1'
        const chapterId = match[2];  // 'ch8' (files are ch8.json, not N1_ch8.json)
        
        const exercicesPath = path.join(DATA_DIR, niveauId, 'exercices', `${chapterId}.json`);
        
        if (!fs.existsSync(exercicesPath)) {
            return res.status(404).json({ success: false, error: 'Exercices non trouvés' });
        }
        
        const exercicesData = JSON.parse(fs.readFileSync(exercicesPath, 'utf8'));
        const exercice = exercicesData.exercices.find(ex => ex.id === exerciceId);
        
        if (!exercice) {
            return res.status(404).json({ success: false, error: 'Exercice non trouvé' });
        }
        
        res.json({ success: true, exercice: exercice });
    } catch (error) {
        console.error('❌ Erreur chargement exercice:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 14: Modifier un exercice
app.put('/api/exercice/:exerciceId', (req, res) => {
    try {
        const exerciceId = req.params.exerciceId;
        const { titre, type, points, content } = req.body;
        
        const match = exerciceId.match(/^(N\d)_(ch\d+)_step\d+_ex\d+$/);
        if (!match) {
            return res.status(400).json({ success: false, error: 'Format exerciceId invalide' });
        }
        
        const niveauId = match[1];   // 'N1'
        const chapterId = match[2];  // 'ch8' (files are ch8.json, not N1_ch8.json)
        
        const exercicesPath = path.join(DATA_DIR, niveauId, 'exercices', `${chapterId}.json`);
        
        if (!fs.existsSync(exercicesPath)) {
            return res.status(404).json({ success: false, error: 'Exercices non trouvés' });
        }
        
        const exercicesData = JSON.parse(fs.readFileSync(exercicesPath, 'utf8'));
        const exIndex = exercicesData.exercices.findIndex(ex => ex.id === exerciceId);
        
        if (exIndex === -1) {
            return res.status(404).json({ success: false, error: 'Exercice non trouvé' });
        }
        
        if (titre) exercicesData.exercices[exIndex].titre = titre;
        if (type) exercicesData.exercices[exIndex].type = type;
        if (points !== undefined) exercicesData.exercices[exIndex].points = points;
        if (content) exercicesData.exercices[exIndex].content = content;
        
        fs.writeFileSync(exercicesPath, JSON.stringify(exercicesData, null, 2), 'utf8');
        console.log(`✅ Exercice modifié: ${exerciceId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${exercicesPath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Update exercise ${exerciceId}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (e) { console.warn('⚠️ Git sync échoué'); }
        
        res.json({
            success: true,
            message: 'Exercice modifié',
            exercice: exercicesData.exercices[exIndex],
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur modification exercice:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ROUTE 15: Supprimer un exercice
app.delete('/api/exercice/:exerciceId', (req, res) => {
    try {
        const exerciceId = req.params.exerciceId;
        
        const match = exerciceId.match(/^(N\d)_(ch\d+)_step\d+_ex\d+$/);
        if (!match) {
            return res.status(400).json({ success: false, error: 'Format exerciceId invalide' });
        }
        
        const niveauId = match[1];   // 'N1'
        const chapterId = match[2];  // 'ch8' (files are ch8.json, not N1_ch8.json)
        
        const exercicesPath = path.join(DATA_DIR, niveauId, 'exercices', `${chapterId}.json`);
        
        if (!fs.existsSync(exercicesPath)) {
            return res.status(404).json({ success: false, error: 'Exercices non trouvés' });
        }
        
        const exercicesData = JSON.parse(fs.readFileSync(exercicesPath, 'utf8'));
        exercicesData.exercices = exercicesData.exercices.filter(ex => ex.id !== exerciceId);
        
        fs.writeFileSync(exercicesPath, JSON.stringify(exercicesData, null, 2), 'utf8');
        console.log(`✅ Exercice supprimé: ${exerciceId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${exercicesPath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Delete exercise ${exerciceId}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (e) { console.warn('⚠️ Git sync échoué'); }
        
        res.json({
            success: true,
            message: 'Exercice supprimé',
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur suppression exercice:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route par défaut - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));

});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrer le serveur
const server = app.listen(PORT, HOST, () => {
    console.log('🚀 SERVEUR LMS DOUANE LANCÉ!');
    console.log('📍 Local: http://' + HOST + ':' + PORT);
    console.log('🌐 Version: 2.1.0');
    console.log('📚 API Health: GET /api/health');
    console.log('📖 Chapitres: GET /api/chapitres');
    console.log('✏️  Exercices: GET /api/exercises/:type');
    console.log('💾 Sauvegarder: POST /api/save-exercise');
    console.log('⏸️  Ctrl+C pour arrêter');
}).on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});

// Keep process alive - prevent auto-exit
process.stdin.resume();

process.on('SIGINT', () => {
    console.log('\n✅ SERVEUR ARRÊTÉ');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n✅ SERVEUR ARRÊTÉ (SIGTERM)');
    server.close(() => {
        process.exit(0);
    });
});

module.exports = app;
