/**
 * Server de DEBUG
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const HOST = '0.0.0.0';
const DATA_DIR = path.join(__dirname, 'data');

console.log('DEBUG: Middleware setup...');
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

console.log('DEBUG: Routes setup...');
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

app.get('/api/niveaux', (req, res) => {
    try {
        const chapetrsMasterPath = path.join(DATA_DIR, 'chapitres-master.json');
        const content = fs.readFileSync(chapetrsMasterPath, 'utf8');
        const data = JSON.parse(content);
        res.json(data);
    } catch (error) {
        console.error('Error in /api/niveaux:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('OK');
});

console.log('DEBUG: Starting server...');
app.listen(PORT, HOST, () => {
    console.log('🚀 SERVER STARTED!');
    console.log('📍 Address: http://' + HOST + ':' + PORT);
});
