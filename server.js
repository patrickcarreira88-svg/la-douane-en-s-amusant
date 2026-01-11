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
const HOST = 'localhost';
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

// ✅ ROUTE 1: Charger tous les niveaux
app.get('/api/niveaux', (req, res) => {
    try {
        const chapetrsMasterPath = path.join(DATA_DIR, 'chapitres-master.json');
        
        if (!fs.existsSync(chapetrsMasterPath)) {
            return res.status(404).json({
                success: false,
                error: 'Fichier chapitres-master.json non trouvé'
            });
        }
        
        const content = fs.readFileSync(chapetrsMasterPath, 'utf8');
        const data = JSON.parse(content);
        
        res.json({
            success: true,
            niveaux: data.niveaux || [],
            count: (data.niveaux || []).length,
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
        
        const niveauDir = path.join(DATA_DIR, niveauId);
        
        // Si le dossier n'existe pas, retourner array vide
        if (!fs.existsSync(niveauDir)) {
            return res.json({
                success: true,
                chapitres: [],
                count: 0,
                message: `Aucun chapitre trouvé pour ${niveauId}`
            });
        }
        
        // Lire tous les fichiers JSON du dossier
        const files = fs.readdirSync(niveauDir).filter(f => f.endsWith('.json'));
        const chapitres = [];
        
        files.forEach(file => {
            try {
                const content = fs.readFileSync(path.join(niveauDir, file), 'utf8');
                const data = JSON.parse(content);
                if (data.chapitre) {
                    chapitres.push(data.chapitre);
                }
            } catch (e) {
                console.warn(`⚠️ Erreur lecture ${file}:`, e.message);
            }
        });
        
        // Trier par ordre
        chapitres.sort((a, b) => a.ordre - b.ordre);
        
        res.json({
            success: true,
            chapitres: chapitres,
            count: chapitres.length,
            message: `Chapitres ${niveauId} chargés avec succès`
        });
    } catch (error) {
        console.error('❌ Erreur chargement chapitres:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur chargement chapitres: ' + error.message
        });
    }
});

// ✅ ROUTE 3: Créer un nouveau chapitre
app.post('/api/niveaux/:niveauId/chapitres', (req, res) => {
    try {
        const niveauId = req.params.niveauId.toUpperCase();
        const { titre, description } = req.body;
        
        // Validation 1: Niveau valide
        const validNiveaux = ['N1', 'N2', 'N3', 'N4'];
        if (!validNiveaux.includes(niveauId)) {
            return res.status(400).json({
                success: false,
                error: `Niveau invalide: ${niveauId}`
            });
        }
        
        // Validation 2: Titre présent
        if (!titre || titre.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Titre du chapitre requis'
            });
        }
        
        const niveauDir = path.join(DATA_DIR, niveauId);
        
        // Créer dossier niveau s'il n'existe pas
        if (!fs.existsSync(niveauDir)) {
            fs.mkdirSync(niveauDir, { recursive: true });
        }
        
        // Trouver le prochain numéro de chapitre
        const files = fs.readdirSync(niveauDir).filter(f => f.endsWith('.json'));
        let maxNum = 0;
        
        files.forEach(file => {
            const match = file.match(/ch(\d+)/);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxNum) maxNum = num;
            }
        });
        
        const nextNum = maxNum + 1;
        const chapterId = `${niveauId}_ch${String(nextNum).padStart(2, '0')}`;
        const fileName = `${chapterId}.json`;
        const filePath = path.join(niveauDir, fileName);
        
        // Créer structure chapitre + 4 étapes standard
        const chapitre = {
            chapitre: {
                id: chapterId,
                niveauId: niveauId,
                titre: titre,
                description: description || '',
                ordre: nextNum,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            },
            etapes: [
                {
                    id: `${chapterId}_step01`,
                    chapterId: chapterId,
                    titre: 'Diagnostic',
                    description: 'Étape de diagnostic initial',
                    ordre: 1,
                    type: 'diagnostic',
                    createdAt: new Date().toISOString(),
                    exercices: []
                },
                {
                    id: `${chapterId}_step02`,
                    chapterId: chapterId,
                    titre: 'Apprentissage',
                    description: 'Étape d\'apprentissage et contenus',
                    ordre: 2,
                    type: 'apprentissage',
                    createdAt: new Date().toISOString(),
                    exercices: []
                },
                {
                    id: `${chapterId}_step03`,
                    chapterId: chapterId,
                    titre: 'Entraînement',
                    description: 'Étape d\'entraînement et pratique',
                    ordre: 3,
                    type: 'entrainement',
                    createdAt: new Date().toISOString(),
                    exercices: []
                },
                {
                    id: `${chapterId}_step04`,
                    chapterId: chapterId,
                    titre: 'Évaluation',
                    description: 'Étape d\'évaluation et validation',
                    ordre: 4,
                    type: 'evaluation',
                    createdAt: new Date().toISOString(),
                    exercices: []
                }
            ]
        };
        
        // Sauvegarder fichier
        fs.writeFileSync(filePath, JSON.stringify(chapitre, null, 2), 'utf8');
        console.log(`✅ Chapitre créé: ${chapterId}`);
        
        // Auto-commit et push vers GitHub
        let gitSync = false;
        try {
            execSync(`git add "${filePath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Add chapter ${chapterId} via authoring tool"`, {
                cwd: __dirname,
                stdio: 'pipe'
            });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            console.log('✅ Chapitre synchronisé vers GitHub');
            gitSync = true;
        } catch (gitError) {
            console.warn('⚠️ Git sync échoué:', gitError.message);
        }
        
        res.json({
            success: true,
            message: `Chapitre ${chapterId} créé avec succès`,
            chapitre: chapitre.chapitre,
            chapterId: chapterId,
            gitSync: gitSync,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Erreur création chapitre:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur création chapitre: ' + error.message
        });
    }
});

// ✅ ROUTE 4: Charger un chapitre complet
app.get('/api/chapitre/:chapterId', (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        
        // Extraire niveau et numéro
        const match = chapterId.match(/^(N\d)_ch(\d+)$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: `Format chapterId invalide: ${chapterId}`
            });
        }
        
        const niveauId = match[1];
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Chapitre ${chapterId} non trouvé`
            });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        res.json({
            success: true,
            chapitre: data.chapitre,
            etapes: data.etapes || [],
            message: `Chapitre ${chapterId} chargé`
        });
    } catch (error) {
        console.error('❌ Erreur chargement chapitre:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur chargement chapitre: ' + error.message
        });
    }
});

// ✅ ROUTE 5: Modifier un chapitre
app.put('/api/chapitre/:chapterId', (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        const { titre, description } = req.body;
        
        // Validation
        if (!titre || titre.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Titre du chapitre requis'
            });
        }
        
        // Extraire niveau
        const match = chapterId.match(/^(N\d)_ch(\d+)$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: `Format chapterId invalide: ${chapterId}`
            });
        }
        
        const niveauId = match[1];
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Chapitre ${chapterId} non trouvé`
            });
        }
        
        // Lire, modifier, sauvegarder
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        data.chapitre.titre = titre;
        data.chapitre.description = description || data.chapitre.description;
        data.chapitre.lastModified = new Date().toISOString();
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Chapitre modifié: ${chapterId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${filePath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Update chapter ${chapterId} via authoring tool"`, {
                cwd: __dirname,
                stdio: 'pipe'
            });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (gitError) {
            console.warn('⚠️ Git sync échoué:', gitError.message);
        }
        
        res.json({
            success: true,
            message: `Chapitre ${chapterId} modifié`,
            chapitre: data.chapitre,
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur modification chapitre:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur modification chapitre: ' + error.message
        });
    }
});

// ✅ ROUTE 6: Supprimer un chapitre (récursif)
app.delete('/api/chapitre/:chapterId', (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        
        // Extraire niveau
        const match = chapterId.match(/^(N\d)_ch(\d+)$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: `Format chapterId invalide: ${chapterId}`
            });
        }
        
        const niveauId = match[1];
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Chapitre ${chapterId} non trouvé`
            });
        }
        
        // Supprimer fichier
        fs.unlinkSync(filePath);
        console.log(`✅ Chapitre supprimé: ${chapterId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add -A`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Delete chapter ${chapterId} via authoring tool"`, {
                cwd: __dirname,
                stdio: 'pipe'
            });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (gitError) {
            console.warn('⚠️ Git sync échoué:', gitError.message);
        }
        
        res.json({
            success: true,
            message: `Chapitre ${chapterId} supprimé`,
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur suppression chapitre:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur suppression chapitre: ' + error.message
        });
    }
});

// ✅ ROUTE 7: Créer une étape
app.post('/api/chapitre/:chapterId/etape', (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        const { titre, type } = req.body;
        
        // Validation
        if (!titre || titre.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Titre de l\'étape requis'
            });
        }
        
        const validTypes = ['diagnostic', 'apprentissage', 'entrainement', 'evaluation'];
        if (!type || !validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: `Type invalide. Types acceptés: ${validTypes.join(', ')}`
            });
        }
        
        // Extraire niveau et charger chapitre
        const match = chapterId.match(/^(N\d)_ch(\d+)$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: `Format chapterId invalide`
            });
        }
        
        const niveauId = match[1];
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Chapitre ${chapterId} non trouvé`
            });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Trouver prochain numéro d'étape
        let maxStepNum = 0;
        data.etapes.forEach(e => {
            const match = e.id.match(/step(\d+)$/);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxStepNum) maxStepNum = num;
            }
        });
        
        const nextStepNum = maxStepNum + 1;
        const etapeId = `${chapterId}_step${String(nextStepNum).padStart(2, '0')}`;
        
        // Créer nouvelle étape
        const nouvelleEtape = {
            id: etapeId,
            chapterId: chapterId,
            titre: titre,
            description: req.body.description || '',
            ordre: nextStepNum,
            type: type.toLowerCase(),
            createdAt: new Date().toISOString(),
            exercices: []
        };
        
        data.etapes.push(nouvelleEtape);
        data.chapitre.lastModified = new Date().toISOString();
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Étape créée: ${etapeId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${filePath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Add step ${etapeId} via authoring tool"`, {
                cwd: __dirname,
                stdio: 'pipe'
            });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (gitError) {
            console.warn('⚠️ Git sync échoué:', gitError.message);
        }
        
        res.json({
            success: true,
            message: `Étape ${etapeId} créée`,
            etape: nouvelleEtape,
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur création étape:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur création étape: ' + error.message
        });
    }
});

// ✅ ROUTE 8: Charger une étape
app.get('/api/etape/:etapeId', (req, res) => {
    try {
        const etapeId = req.params.etapeId;
        
        // Extraire chapterId et niveau
        const match = etapeId.match(/^(N\d_ch\d+)_step\d+$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: 'Format etapeId invalide'
            });
        }
        
        const chapterId = match[1];
        const niveauMatch = chapterId.match(/^(N\d)_/);
        const niveauId = niveauMatch[1];
        
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Chapitre ${chapterId} non trouvé`
            });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        const etape = data.etapes.find(e => e.id === etapeId);
        if (!etape) {
            return res.status(404).json({
                success: false,
                error: `Étape ${etapeId} non trouvée`
            });
        }
        
        res.json({
            success: true,
            etape: etape,
            exercices: etape.exercices || []
        });
    } catch (error) {
        console.error('❌ Erreur chargement étape:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur chargement étape: ' + error.message
        });
    }
});

// ✅ ROUTE 9: Modifier une étape
app.put('/api/etape/:etapeId', (req, res) => {
    try {
        const etapeId = req.params.etapeId;
        const { titre, description, type } = req.body;
        
        // Extraire chapterId et niveau
        const match = etapeId.match(/^(N\d_ch\d+)_step\d+$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: 'Format etapeId invalide'
            });
        }
        
        const chapterId = match[1];
        const niveauMatch = chapterId.match(/^(N\d)_/);
        const niveauId = niveauMatch[1];
        
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Chapitre non trouvé`
            });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        const etapeIndex = data.etapes.findIndex(e => e.id === etapeId);
        if (etapeIndex === -1) {
            return res.status(404).json({
                success: false,
                error: `Étape non trouvée`
            });
        }
        
        if (titre) data.etapes[etapeIndex].titre = titre;
        if (description) data.etapes[etapeIndex].description = description;
        if (type) data.etapes[etapeIndex].type = type;
        data.chapitre.lastModified = new Date().toISOString();
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Étape modifiée: ${etapeId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${filePath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Update step ${etapeId} via authoring tool"`, {
                cwd: __dirname,
                stdio: 'pipe'
            });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (gitError) {
            console.warn('⚠️ Git sync échoué:', gitError.message);
        }
        
        res.json({
            success: true,
            message: `Étape modifiée`,
            etape: data.etapes[etapeIndex],
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur modification étape:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur modification étape: ' + error.message
        });
    }
});

// ✅ ROUTE 10: Supprimer une étape
app.delete('/api/etape/:etapeId', (req, res) => {
    try {
        const etapeId = req.params.etapeId;
        
        // Extraire chapterId et niveau
        const match = etapeId.match(/^(N\d_ch\d+)_step\d+$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: 'Format etapeId invalide'
            });
        }
        
        const chapterId = match[1];
        const niveauMatch = chapterId.match(/^(N\d)_/);
        const niveauId = niveauMatch[1];
        
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Chapitre non trouvé`
            });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Supprimer étape
        data.etapes = data.etapes.filter(e => e.id !== etapeId);
        
        // Renumériser les étapes
        data.etapes.forEach((etape, index) => {
            const oldId = etape.id;
            const newStepNum = index + 1;
            etape.id = `${chapterId}_step${String(newStepNum).padStart(2, '0')}`;
            etape.ordre = newStepNum;
            
            // Mettre à jour les exercices avec la nouvelle étapeId
            if (etape.exercices) {
                etape.exercices.forEach(ex => {
                    ex.etapeId = etape.id;
                });
            }
        });
        
        data.chapitre.lastModified = new Date().toISOString();
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Étape supprimée et renumérisation effectuée`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add -A`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Delete step ${etapeId} and renumber via authoring tool"`, {
                cwd: __dirname,
                stdio: 'pipe'
            });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (gitError) {
            console.warn('⚠️ Git sync échoué:', gitError.message);
        }
        
        res.json({
            success: true,
            message: `Étape supprimée et renumérisation effectuée`,
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur suppression étape:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur suppression étape: ' + error.message
        });
    }
});

// ✅ ROUTE 11: Réordonner les étapes
app.post('/api/etape/:etapeId/reorder', (req, res) => {
    try {
        const etapeId = req.params.etapeId;
        const { newPosition } = req.body;
        
        // Validation
        if (newPosition === undefined || newPosition < 1) {
            return res.status(400).json({
                success: false,
                error: 'newPosition requis et doit être >= 1'
            });
        }
        
        // Extraire chapterId et niveau
        const match = etapeId.match(/^(N\d_ch\d+)_step\d+$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: 'Format etapeId invalide'
            });
        }
        
        const chapterId = match[1];
        const niveauMatch = chapterId.match(/^(N\d)_/);
        const niveauId = niveauMatch[1];
        
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Chapitre non trouvé`
            });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Trouver l'étape
        const etapeIndex = data.etapes.findIndex(e => e.id === etapeId);
        if (etapeIndex === -1) {
            return res.status(404).json({
                success: false,
                error: `Étape non trouvée`
            });
        }
        
        // Déplacer l'étape
        const etape = data.etapes.splice(etapeIndex, 1);
        data.etapes.splice(newPosition - 1, 0, ...etape);
        
        // Renumériser toutes les étapes
        data.etapes.forEach((e, index) => {
            const newStepNum = index + 1;
            e.id = `${chapterId}_step${String(newStepNum).padStart(2, '0')}`;
            e.ordre = newStepNum;
        });
        
        data.chapitre.lastModified = new Date().toISOString();
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Étapes réordonnées`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${filePath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Reorder steps in ${chapterId} via authoring tool"`, {
                cwd: __dirname,
                stdio: 'pipe'
            });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (gitError) {
            console.warn('⚠️ Git sync échoué:', gitError.message);
        }
        
        res.json({
            success: true,
            message: `Étapes réordonnées`,
            etapes: data.etapes,
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur réordonner étapes:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur réordonner étapes: ' + error.message
        });
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
            return res.status(400).json({
                success: false,
                error: `Type invalide. Types acceptés: ${validTypes.join(', ')}`
            });
        }
        
        if (!titre || titre.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Titre de l\'exercice requis'
            });
        }
        
        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Contenu de l\'exercice requis'
            });
        }
        
        // Extraire chapterId et niveau
        const match = etapeId.match(/^(N\d_ch\d+)_step\d+$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: 'Format etapeId invalide'
            });
        }
        
        const chapterId = match[1];
        const niveauMatch = chapterId.match(/^(N\d)_/);
        const niveauId = niveauMatch[1];
        
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Chapitre non trouvé`
            });
        }
        
        const content_file = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content_file);
        
        // Trouver l'étape
        const etapeIndex = data.etapes.findIndex(e => e.id === etapeId);
        if (etapeIndex === -1) {
            return res.status(404).json({
                success: false,
                error: `Étape non trouvée`
            });
        }
        
        // Générer ID exercice
        let maxExNum = 0;
        data.etapes[etapeIndex].exercices.forEach(ex => {
            const match = ex.id.match(/ex(\d+)$/);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxExNum) maxExNum = num;
            }
        });
        
        const nextExNum = maxExNum + 1;
        const exerciceId = `${etapeId}_ex${String(nextExNum).padStart(3, '0')}`;
        
        // Créer exercice
        const nouvelExercice = {
            id: exerciceId,
            etapeId: etapeId,
            type: type.toLowerCase(),
            titre: titre,
            points: points || 10,
            content: content,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        data.etapes[etapeIndex].exercices.push(nouvelExercice);
        data.chapitre.lastModified = new Date().toISOString();
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Exercice créé: ${exerciceId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${filePath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Add exercise ${exerciceId} via authoring tool"`, {
                cwd: __dirname,
                stdio: 'pipe'
            });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (gitError) {
            console.warn('⚠️ Git sync échoué:', gitError.message);
        }
        
        res.json({
            success: true,
            message: `Exercice ${exerciceId} créé`,
            exercice: nouvelExercice,
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur création exercice:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur création exercice: ' + error.message
        });
    }
});

// ✅ ROUTE 13: Charger un exercice
app.get('/api/exercice/:exerciceId', (req, res) => {
    try {
        const exerciceId = req.params.exerciceId;
        
        // Extraire etapeId et chapterId
        const match = exerciceId.match(/^(N\d_ch\d+_step\d+)_ex\d+$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: 'Format exerciceId invalide'
            });
        }
        
        const etapeId = match[1];
        const chapterId = etapeId.split('_step')[0];
        const niveauMatch = chapterId.match(/^(N\d)_/);
        const niveauId = niveauMatch[1];
        
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Fichier non trouvé`
            });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Trouver l'étape et l'exercice
        const etape = data.etapes.find(e => e.id === etapeId);
        if (!etape) {
            return res.status(404).json({
                success: false,
                error: `Étape non trouvée`
            });
        }
        
        const exercice = etape.exercices.find(ex => ex.id === exerciceId);
        if (!exercice) {
            return res.status(404).json({
                success: false,
                error: `Exercice non trouvé`
            });
        }
        
        res.json({
            success: true,
            exercice: exercice
        });
    } catch (error) {
        console.error('❌ Erreur chargement exercice:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur chargement exercice: ' + error.message
        });
    }
});

// ✅ ROUTE 14: Modifier un exercice
app.put('/api/exercice/:exerciceId', (req, res) => {
    try {
        const exerciceId = req.params.exerciceId;
        const { titre, points, content } = req.body;
        
        // Extraire IDs
        const match = exerciceId.match(/^(N\d_ch\d+_step\d+)_ex\d+$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: 'Format exerciceId invalide'
            });
        }
        
        const etapeId = match[1];
        const chapterId = etapeId.split('_step')[0];
        const niveauMatch = chapterId.match(/^(N\d)_/);
        const niveauId = niveauMatch[1];
        
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Fichier non trouvé`
            });
        }
        
        const content_file = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content_file);
        
        // Trouver et modifier
        const etape = data.etapes.find(e => e.id === etapeId);
        if (!etape) {
            return res.status(404).json({
                success: false,
                error: `Étape non trouvée`
            });
        }
        
        const exerciceIndex = etape.exercices.findIndex(ex => ex.id === exerciceId);
        if (exerciceIndex === -1) {
            return res.status(404).json({
                success: false,
                error: `Exercice non trouvé`
            });
        }
        
        if (titre) etape.exercices[exerciceIndex].titre = titre;
        if (points !== undefined) etape.exercices[exerciceIndex].points = points;
        if (content) etape.exercices[exerciceIndex].content = content;
        etape.exercices[exerciceIndex].lastModified = new Date().toISOString();
        data.chapitre.lastModified = new Date().toISOString();
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Exercice modifié: ${exerciceId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add "${filePath}"`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Update exercise ${exerciceId} via authoring tool"`, {
                cwd: __dirname,
                stdio: 'pipe'
            });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (gitError) {
            console.warn('⚠️ Git sync échoué:', gitError.message);
        }
        
        res.json({
            success: true,
            message: `Exercice modifié`,
            exercice: etape.exercices[exerciceIndex],
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur modification exercice:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur modification exercice: ' + error.message
        });
    }
});

// ✅ ROUTE 15: Supprimer un exercice
app.delete('/api/exercice/:exerciceId', (req, res) => {
    try {
        const exerciceId = req.params.exerciceId;
        
        // Extraire IDs
        const match = exerciceId.match(/^(N\d_ch\d+_step\d+)_ex\d+$/);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: 'Format exerciceId invalide'
            });
        }
        
        const etapeId = match[1];
        const chapterId = etapeId.split('_step')[0];
        const niveauMatch = chapterId.match(/^(N\d)_/);
        const niveauId = niveauMatch[1];
        
        const filePath = path.join(DATA_DIR, niveauId, `${chapterId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Fichier non trouvé`
            });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Trouver et supprimer
        const etape = data.etapes.find(e => e.id === etapeId);
        if (!etape) {
            return res.status(404).json({
                success: false,
                error: `Étape non trouvée`
            });
        }
        
        etape.exercices = etape.exercices.filter(ex => ex.id !== exerciceId);
        data.chapitre.lastModified = new Date().toISOString();
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Exercice supprimé: ${exerciceId}`);
        
        // Git sync
        let gitSync = false;
        try {
            execSync(`git add -A`, { cwd: __dirname, stdio: 'pipe' });
            execSync(`git commit -m "Delete exercise ${exerciceId} via authoring tool"`, {
                cwd: __dirname,
                stdio: 'pipe'
            });
            execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
            gitSync = true;
        } catch (gitError) {
            console.warn('⚠️ Git sync échoué:', gitError.message);
        }
        
        res.json({
            success: true,
            message: `Exercice supprimé`,
            gitSync: gitSync
        });
    } catch (error) {
        console.error('❌ Erreur suppression exercice:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur suppression exercice: ' + error.message
        });
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
app.listen(PORT, HOST, () => {
    console.log('🚀 SERVEUR LMS DOUANE LANCÉ!');
    console.log('📍 Local: http://' + HOST + ':' + PORT);
    console.log('🌐 Version: 2.1.0');
    console.log('📚 API Health: GET /api/health');
    console.log('📖 Chapitres: GET /api/chapitres');
    console.log('✏️  Exercices: GET /api/exercises/:type');
    console.log('💾 Sauvegarder: POST /api/save-exercise');
    console.log('⏸️  Ctrl+C pour arrêter');
});

module.exports = app;
