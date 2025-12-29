/**
 * Backend Node.js pour LMS Douane
 * Serveur Express pour gestion des données et API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

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
