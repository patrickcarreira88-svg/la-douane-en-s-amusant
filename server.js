/**
 * Backend Node.js pour LMS Douane
 * Serveur Express pour gestion des données et API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

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
    console.log('⏸️  Ctrl+C pour arrêter');
});

module.exports = app;
