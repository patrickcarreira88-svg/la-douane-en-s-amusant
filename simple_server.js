const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Routes API simples
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Servir la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Servir authoring tool
app.get('/authoring-tool-v2.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'authoring-tool-v2.html'));
});

// 404
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
    console.log('🚀 SERVEUR LMS DÉMARRÉ!');
    console.log('📍 URL: http://localhost:' + PORT);
    console.log('✏️  Authoring Tool: http://localhost:' + PORT + '/authoring-tool-v2.html');
    console.log('🏠 Accueil: http://localhost:' + PORT + '/index.html');
    console.log('');
});

// Gestion des erreurs
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('❌ Port ' + PORT + ' déjà utilisé');
        process.exit(1);
    } else {
        console.error('❌ Erreur serveur:', err.message);
    }
});

process.on('SIGINT', () => {
    console.log('\n✅ Serveur arrêté');
    server.close(() => process.exit(0));
});
