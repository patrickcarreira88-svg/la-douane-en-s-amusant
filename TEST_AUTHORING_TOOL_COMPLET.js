#!/usr/bin/env node
// TEST_AUTHORING_TOOL_COMPLET.js
// Script pour tester toutes les routes API de l'outil auteur

const http = require('http');

const API_BASE = 'http://localhost:5000/api';

// Couleurs pour terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// État des tests
let testsPassed = 0;
let testsFailed = 0;
let capturedIds = {};

/**
 * Effectuer une requête HTTP
 */
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * Logger un test
 */
function logTest(name, passed, details = '') {
    if (passed) {
        testsPassed++;
        console.log(`${colors.green}✅${colors.reset} ${name}`);
    } else {
        testsFailed++;
        console.log(`${colors.red}❌${colors.reset} ${name}`);
    }
    if (details) {
        console.log(`   ${colors.cyan}${details}${colors.reset}`);
    }
}

/**
 * Logger une section
 */
function logSection(title) {
    console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}${title}${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

/**
 * TESTS
 */
async function runTests() {
    console.log(`${colors.cyan}🚀 DÉMARRAGE TESTS API AUTHORING-TOOL${colors.reset}\n`);

    try {
        // TEST 1: Charger les niveaux
        logSection('TEST 1: CHARGER LES NIVEAUX');
        const niveauxRes = await makeRequest('GET', '/niveaux');
        logTest('GET /api/niveaux', niveauxRes.status === 200, 
            `Status: ${niveauxRes.status}, Niveaux: ${niveauxRes.data.niveaux?.join(', ') || 'N/A'}`);

        // TEST 2: Créer un chapitre
        logSection('TEST 2: CRÉER UN CHAPITRE');
        const createChapRes = await makeRequest('POST', '/niveaux/N1/chapitres', {
            titre: 'Chapitre Test - ' + new Date().getTime(),
            description: 'Chapitre créé par test script'
        });
        logTest('POST /api/niveaux/N1/chapitres', createChapRes.status === 200,
            `Status: ${createChapRes.status}, ChapterId: ${createChapRes.data.chapterId || 'N/A'}`);
        
        if (createChapRes.data.chapterId) {
            capturedIds.chapterId = createChapRes.data.chapterId;
        } else {
            console.log(`${colors.red}⚠️  Impossible de récupérer chapterId${colors.reset}`);
            return;
        }

        // TEST 3: Charger le chapitre
        logSection('TEST 3: CHARGER LE CHAPITRE');
        const loadChapRes = await makeRequest('GET', `/chapitre/${capturedIds.chapterId}`);
        logTest('GET /api/chapitre/:chapterId', loadChapRes.status === 200,
            `Status: ${loadChapRes.status}, Chapitre: ${loadChapRes.data.chapitre?.titre || 'N/A'}`);
        
        if (loadChapRes.data.chapitre) {
            console.log(`   ${colors.cyan}Étapes: ${loadChapRes.data.etapes?.length || 0}${colors.reset}`);
        }

        // TEST 4: Charger les étapes du chapitre
        logSection('TEST 4: CHARGER LES ÉTAPES');
        const etapesFromChap = loadChapRes.data.etapes || [];
        if (etapesFromChap.length > 0) {
            capturedIds.etapeId = etapesFromChap[0].id;
            logTest('Étapes trouvées', true, `${etapesFromChap.length} étape(s), 1ère: ${capturedIds.etapeId}`);
        } else {
            logTest('Étapes trouvées', false, 'Aucune étape dans le chapitre');
            
            // Créer une étape si aucune
            logSection('TEST 4B: CRÉER UNE ÉTAPE');
            const createEtapRes = await makeRequest('POST', `/chapitre/${capturedIds.chapterId}/etape`, {
                titre: 'Étape Test',
                type: 'apprentissage',
                description: 'Étape créée par test script'
            });
            logTest('POST /api/chapitre/:chapterId/etape', createEtapRes.status === 200,
                `Status: ${createEtapRes.status}, EtapeId: ${createEtapRes.data.etape?.id || 'N/A'}`);
            
            if (createEtapRes.data.etape?.id) {
                capturedIds.etapeId = createEtapRes.data.etape.id;
            } else {
                console.log(`${colors.red}⚠️  Impossible de créer une étape${colors.reset}`);
                return;
            }
        }

        // TEST 5: Charger l'étape
        logSection('TEST 5: CHARGER L\'ÉTAPE');
        const loadEtapRes = await makeRequest('GET', `/etape/${capturedIds.etapeId}`);
        logTest('GET /api/etape/:etapeId', loadEtapRes.status === 200,
            `Status: ${loadEtapRes.status}, Étape: ${loadEtapRes.data.etape?.titre || 'N/A'}`);
        
        if (loadEtapRes.data.etape) {
            console.log(`   ${colors.cyan}Exercices: ${loadEtapRes.data.exercices?.length || 0}${colors.reset}`);
        }

        // TEST 6: Créer un QCM
        logSection('TEST 6: CRÉER UN EXERCICE QCM');
        const createExRes = await makeRequest('POST', `/etape/${capturedIds.etapeId}/exercice`, {
            titre: 'QCM Test - ' + new Date().getTime(),
            type: 'qcm',
            points: 10,
            content: {
                question: 'Quelle est la capitale de la France?',
                options: [
                    { label: 'Paris', correct: true },
                    { label: 'Londres', correct: false },
                    { label: 'Berlin', correct: false }
                ],
                correctAnswer: 0,
                explanation: 'Paris est la capitale de la France'
            }
        });
        logTest('POST /api/etape/:etapeId/exercice (QCM)', createExRes.status === 200,
            `Status: ${createExRes.status}, ExerciceId: ${createExRes.data.exercice?.id || 'N/A'}`);
        
        if (createExRes.data.exercice?.id) {
            capturedIds.exerciceId = createExRes.data.exercice.id;
        } else {
            console.log(`${colors.red}⚠️  Impossible de créer un exercice${colors.reset}`);
        }

        // TEST 7: Créer un Vrai/Faux
        logSection('TEST 7: CRÉER UN EXERCICE VRAI/FAUX');
        const createVFRes = await makeRequest('POST', `/etape/${capturedIds.etapeId}/exercice`, {
            titre: 'Vrai/Faux Test',
            type: 'vrai-faux',
            points: 5,
            content: {
                statement: 'Paris est la capitale de la France',
                correctAnswer: true,
                explanation: 'Correct!'
            }
        });
        logTest('POST /api/etape/:etapeId/exercice (Vrai/Faux)', createVFRes.status === 200,
            `Status: ${createVFRes.status}`);

        // TEST 8: Charger l'exercice QCM
        if (capturedIds.exerciceId) {
            logSection('TEST 8: CHARGER L\'EXERCICE QCM');
            const loadExRes = await makeRequest('GET', `/exercice/${capturedIds.exerciceId}`);
            logTest('GET /api/exercice/:exerciceId', loadExRes.status === 200,
                `Status: ${loadExRes.status}, Exercice: ${loadExRes.data.exercice?.titre || 'N/A'}`);
            
            if (loadExRes.data.exercice?.content) {
                const opts = loadExRes.data.exercice.content.options || [];
                console.log(`   ${colors.cyan}Options: ${opts.length}, Correct: ${opts.findIndex(o => o.correct) + 1}${colors.reset}`);
            }
        }

        // TEST 9: Modifier l'exercice QCM
        if (capturedIds.exerciceId) {
            logSection('TEST 9: MODIFIER L\'EXERCICE QCM');
            const updateExRes = await makeRequest('PUT', `/exercice/${capturedIds.exerciceId}`, {
                titre: 'QCM Modifié',
                type: 'qcm',
                points: 15,
                content: {
                    question: 'Quelle est la capitale de la France? (MODIFIÉ)',
                    options: [
                        { label: 'Paris', correct: true },
                        { label: 'Londres', correct: false },
                        { label: 'Berlin', correct: false },
                        { label: 'Madrid', correct: false }
                    ],
                    correctAnswer: 0,
                    explanation: 'Paris est toujours la capitale!'
                }
            });
            logTest('PUT /api/exercice/:exerciceId', updateExRes.status === 200,
                `Status: ${updateExRes.status}`);
        }

        // TEST 10: Charger le chapitre à nouveau (vérifier les changements)
        logSection('TEST 10: VÉRIFIER LES CHANGEMENTS');
        const finalChapRes = await makeRequest('GET', `/chapitre/${capturedIds.chapterId}`);
        if (finalChapRes.data.etapes) {
            const totalExercices = finalChapRes.data.etapes.reduce((sum, e) => sum + (e.exercices?.length || 0), 0);
            logTest('Chapitre rechargé avec exercices', totalExercices > 0,
                `Total exercices: ${totalExercices}`);
        }

    } catch (error) {
        console.log(`\n${colors.red}❌ ERREUR: ${error.message}${colors.reset}`);
        console.log(`${colors.yellow}Le serveur est-il lancé? npm start${colors.reset}`);
    }

    // RÉSUMÉ
    logSection('RÉSUMÉ DES TESTS');
    console.log(`${colors.green}✅ Réussis: ${testsPassed}${colors.reset}`);
    console.log(`${colors.red}❌ Échoués: ${testsFailed}${colors.reset}`);
    console.log(`${colors.blue}📊 Total: ${testsPassed + testsFailed}${colors.reset}`);
    
    if (testsFailed === 0) {
        console.log(`\n${colors.green}🎉 TOUS LES TESTS RÉUSSIS!${colors.reset}`);
    } else {
        console.log(`\n${colors.yellow}⚠️  Certains tests ont échoué${colors.reset}`);
    }

    // Données capturées
    console.log(`\n${colors.blue}📝 IDs CAPTURÉS:${colors.reset}`);
    Object.entries(capturedIds).forEach(([key, value]) => {
        console.log(`   ${colors.cyan}${key}: ${value}${colors.reset}`);
    });
}

// Lancer les tests
runTests().catch(console.error);
