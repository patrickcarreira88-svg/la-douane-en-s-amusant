#!/usr/bin/env node

const http = require('http');

function testAPI(path, method = 'GET') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing API endpoints...\n');

    try {
        console.log('1️⃣  Testing GET /api/health');
        let result = await testAPI('/api/health');
        console.log(`   Status: ${result.statusCode}`);
        if (result.statusCode === 200) {
            console.log('   ✅ PASSED\n');
        } else {
            console.log('   ❌ FAILED\n');
        }

        console.log('2️⃣  Testing GET /api/etape/N1_ch1_step01');
        result = await testAPI('/api/etape/N1_ch1_step01');
        console.log(`   Status: ${result.statusCode}`);
        console.log(`   Response: ${result.data.substring(0, 200)}...`);
        if (result.statusCode === 200) {
            try {
                const json = JSON.parse(result.data);
                console.log(`   ✅ Valid JSON response`);
                if (json.success) {
                    console.log(`   ✅ API returned success`);
                    console.log(`   Étape ID: ${json.etape?.id}`);
                } else {
                    console.log(`   ⚠️  API returned error: ${json.error}`);
                }
            } catch (e) {
                console.log(`   ❌ Invalid JSON: ${e.message}`);
            }
        } else {
            console.log('   ❌ FAILED\n');
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
        process.exit(1);
    }
}

runTests();
