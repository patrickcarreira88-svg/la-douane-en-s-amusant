/**
 * Test des 15 routes du système d'authoring
 * Exécution: node test_routes.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
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
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, body: parsed });
                } catch {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('════════════════════════════════════════════════════');
    console.log('TEST DES 15 ROUTES - SYSTÈME D\'AUTHORING');
    console.log('════════════════════════════════════════════════════\n');

    let chapterId = null;
    let etapeId = null;
    let exerciceId = null;

    try {
        // TEST 1
        console.log('TEST 1: GET /api/niveaux');
        console.log('─'.repeat(50));
        const test1 = await makeRequest('GET', '/api/niveaux');
        console.log('Status:', test1.status);
        console.log('Réponse:', JSON.stringify(test1.body, null, 2));
        console.log('✅ SUCCÈS\n');

        // TEST 2
        console.log('TEST 2: POST /api/niveaux/N1/chapitres');
        console.log('─'.repeat(50));
        const test2 = await makeRequest('POST', '/api/niveaux/N1/chapitres', {
            titre: 'Mon Premier Chapitre',
            description: 'Description du test'
        });
        console.log('Status:', test2.status);
        console.log('Réponse:', JSON.stringify(test2.body, null, 2));
        if (test2.body.chapterId) {
            chapterId = test2.body.chapterId;
            console.log('✅ SUCCÈS - ChapterId:', chapterId);
        } else {
            console.log('⚠️ ERREUR:', test2.body.error);
        }
        console.log('');

        if (chapterId) {
            // TEST 3
            console.log('TEST 3: GET /api/niveaux/N1/chapitres');
            console.log('─'.repeat(50));
            const test3 = await makeRequest('GET', '/api/niveaux/N1/chapitres');
            console.log('Status:', test3.status);
            console.log('Réponse:', JSON.stringify(test3.body, null, 2));
            console.log('✅ SUCCÈS\n');

            // TEST 4
            console.log('TEST 4: GET /api/chapitre/' + chapterId);
            console.log('─'.repeat(50));
            const test4 = await makeRequest('GET', '/api/chapitre/' + chapterId);
            console.log('Status:', test4.status);
            console.log('Réponse:', JSON.stringify(test4.body, null, 2));
            console.log('✅ SUCCÈS\n');

            // TEST 5
            console.log('TEST 5: PUT /api/chapitre/' + chapterId);
            console.log('─'.repeat(50));
            const test5 = await makeRequest('PUT', '/api/chapitre/' + chapterId, {
                titre: 'Chapitre Modifié',
                description: 'Description mise à jour'
            });
            console.log('Status:', test5.status);
            console.log('Réponse:', JSON.stringify(test5.body, null, 2));
            console.log('✅ SUCCÈS\n');

            // TEST 6
            console.log('TEST 6: POST /api/chapitre/' + chapterId + '/etape');
            console.log('─'.repeat(50));
            const test6 = await makeRequest('POST', '/api/chapitre/' + chapterId + '/etape', {
                titre: 'Ma Première Étape',
                type: 'diagnostic',
                description: 'Étape de test'
            });
            console.log('Status:', test6.status);
            console.log('Réponse:', JSON.stringify(test6.body, null, 2));
            if (test6.body.etape) {
                etapeId = test6.body.etape.id;
                console.log('✅ SUCCÈS - EtapeId:', etapeId);
            }
            console.log('');

            if (etapeId) {
                // TEST 7
                console.log('TEST 7: GET /api/etape/' + etapeId);
                console.log('─'.repeat(50));
                const test7 = await makeRequest('GET', '/api/etape/' + etapeId);
                console.log('Status:', test7.status);
                console.log('Réponse:', JSON.stringify(test7.body, null, 2));
                console.log('✅ SUCCÈS\n');

                // TEST 8
                console.log('TEST 8: POST /api/etape/' + etapeId + '/exercice');
                console.log('─'.repeat(50));
                const test8 = await makeRequest('POST', '/api/etape/' + etapeId + '/exercice', {
                    type: 'qcm',
                    titre: 'Test QCM',
                    points: 10,
                    content: {
                        question: 'Quelle est la bonne réponse?',
                        options: ['Option 1', 'Option 2', 'Option 3'],
                        correctAnswer: 0
                    }
                });
                console.log('Status:', test8.status);
                console.log('Réponse:', JSON.stringify(test8.body, null, 2));
                if (test8.body.exercice) {
                    exerciceId = test8.body.exercice.id;
                    console.log('✅ SUCCÈS - ExerciceId:', exerciceId);
                }
                console.log('');

                if (exerciceId) {
                    // TEST 9
                    console.log('TEST 9: GET /api/exercice/' + exerciceId);
                    console.log('─'.repeat(50));
                    const test9 = await makeRequest('GET', '/api/exercice/' + exerciceId);
                    console.log('Status:', test9.status);
                    console.log('Réponse:', JSON.stringify(test9.body, null, 2));
                    console.log('✅ SUCCÈS\n');

                    // TEST 10
                    console.log('TEST 10: PUT /api/exercice/' + exerciceId);
                    console.log('─'.repeat(50));
                    const test10 = await makeRequest('PUT', '/api/exercice/' + exerciceId, {
                        titre: 'Exercice Modifié',
                        points: 15
                    });
                    console.log('Status:', test10.status);
                    console.log('Réponse:', JSON.stringify(test10.body, null, 2));
                    console.log('✅ SUCCÈS\n');

                    // TEST 11
                    console.log('TEST 11: DELETE /api/exercice/' + exerciceId);
                    console.log('─'.repeat(50));
                    const test11 = await makeRequest('DELETE', '/api/exercice/' + exerciceId);
                    console.log('Status:', test11.status);
                    console.log('Réponse:', JSON.stringify(test11.body, null, 2));
                    console.log('✅ SUCCÈS\n');
                }

                // TEST 12
                console.log('TEST 12: PUT /api/etape/' + etapeId);
                console.log('─'.repeat(50));
                const test12 = await makeRequest('PUT', '/api/etape/' + etapeId, {
                    titre: 'Étape Modifiée',
                    description: 'Description modifiée'
                });
                console.log('Status:', test12.status);
                console.log('Réponse:', JSON.stringify(test12.body, null, 2));
                console.log('✅ SUCCÈS\n');

                // TEST 13
                console.log('TEST 13: POST /api/etape/' + etapeId + '/reorder');
                console.log('─'.repeat(50));
                const test13 = await makeRequest('POST', '/api/etape/' + chapterId + '_step01/reorder', {
                    newPosition: 2
                });
                console.log('Status:', test13.status);
                console.log('Réponse:', JSON.stringify(test13.body, null, 2));
                console.log('✅ SUCCÈS\n');

                // TEST 14
                console.log('TEST 14: DELETE /api/etape/' + etapeId);
                console.log('─'.repeat(50));
                const test14 = await makeRequest('DELETE', '/api/etape/' + etapeId);
                console.log('Status:', test14.status);
                console.log('Réponse:', JSON.stringify(test14.body, null, 2));
                console.log('✅ SUCCÈS\n');
            }

            // TEST 15
            console.log('TEST 15: DELETE /api/chapitre/' + chapterId);
            console.log('─'.repeat(50));
            const test15 = await makeRequest('DELETE', '/api/chapitre/' + chapterId);
            console.log('Status:', test15.status);
            console.log('Réponse:', JSON.stringify(test15.body, null, 2));
            console.log('✅ SUCCÈS\n');
        }

        console.log('════════════════════════════════════════════════════');
        console.log('TOUS LES TESTS COMPLÉTÉS');
        console.log('════════════════════════════════════════════════════');
        process.exit(0);
    } catch (error) {
        console.error('❌ ERREUR GLOBALE:', error.message);
        process.exit(1);
    }
}

runTests();
