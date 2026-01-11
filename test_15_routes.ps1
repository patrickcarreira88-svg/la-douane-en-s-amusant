# Test des 15 routes du système d'authoring

$baseUrl = "http://localhost:5000"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "════════════════════════════════════════════════════"
Write-Host "TEST DES 15 ROUTES - SYSTÈME D'AUTHORING"
Write-Host "════════════════════════════════════════════════════"
Write-Host ""

# Test 1: Charger niveaux
Write-Host "TEST 1: GET /api/niveaux - Charger tous les niveaux"
Write-Host "────────────────────────────────────────────────────"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/niveaux" -Method Get -ErrorAction Stop
    Write-Host "✅ SUCCÈS"
    Write-Host "Réponse:" ($response | ConvertTo-Json -Depth 2)
} catch {
    Write-Host "❌ ERREUR:" $_.Exception.Message
}
Write-Host ""

# Test 2: Créer chapitre
Write-Host "TEST 2: POST /api/niveaux/N1/chapitres - Créer chapitre"
Write-Host "────────────────────────────────────────────────────"
try {
    $body = @{
        titre = "Mon Premier Chapitre"
        description = "Description du test"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/niveaux/N1/chapitres" -Method Post -Body $body -Headers $headers -ErrorAction Stop
    Write-Host "✅ SUCCÈS"
    Write-Host "Réponse:" ($response | ConvertTo-Json -Depth 2)
    $chapterId = $response.chapterId
} catch {
    Write-Host "❌ ERREUR:" $_.Exception.Message
}
Write-Host ""

# Test 3: Charger chapitres d'un niveau
Write-Host "TEST 3: GET /api/niveaux/N1/chapitres - Charger chapitres du niveau N1"
Write-Host "────────────────────────────────────────────────────"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/niveaux/N1/chapitres" -Method Get -ErrorAction Stop
    Write-Host "✅ SUCCÈS"
    Write-Host "Réponse:" ($response | ConvertTo-Json -Depth 2)
} catch {
    Write-Host "❌ ERREUR:" $_.Exception.Message
}
Write-Host ""

# Test 4: Charger chapitre complet
Write-Host "TEST 4: GET /api/chapitre/{chapterId} - Charger chapitre complet"
Write-Host "────────────────────────────────────────────────────"
if ($chapterId) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/chapitre/$chapterId" -Method Get -ErrorAction Stop
        Write-Host "✅ SUCCÈS"
        Write-Host "Réponse:" ($response | ConvertTo-Json -Depth 2)
    } catch {
        Write-Host "❌ ERREUR:" $_.Exception.Message
    }
} else {
    Write-Host "⏭️ SKIPPED (chapterId non disponible)"
}
Write-Host ""

# Test 5: Modifier chapitre
Write-Host "TEST 5: PUT /api/chapitre/{chapterId} - Modifier chapitre"
Write-Host "────────────────────────────────────────────────────"
if ($chapterId) {
    try {
        $body = @{
            titre = "Chapitre Modifié"
            description = "Description mise à jour"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/chapitre/$chapterId" -Method Put -Body $body -Headers $headers -ErrorAction Stop
        Write-Host "✅ SUCCÈS"
        Write-Host "Réponse:" ($response | ConvertTo-Json -Depth 2)
    } catch {
        Write-Host "❌ ERREUR:" $_.Exception.Message
    }
} else {
    Write-Host "⏭️ SKIPPED"
}
Write-Host ""

# Test 6: Créer étape
Write-Host "TEST 6: POST /api/chapitre/{chapterId}/etape - Créer étape"
Write-Host "────────────────────────────────────────────────────"
if ($chapterId) {
    try {
        $body = @{
            titre = "Ma Première Étape"
            type = "diagnostic"
            description = "Étape de test"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/chapitre/$chapterId/etape" -Method Post -Body $body -Headers $headers -ErrorAction Stop
        Write-Host "✅ SUCCÈS"
        Write-Host "Réponse:" ($response | ConvertTo-Json -Depth 2)
        $etapeId = $response.etape.id
    } catch {
        Write-Host "❌ ERREUR:" $_.Exception.Message
    }
} else {
    Write-Host "⏭️ SKIPPED"
}
Write-Host ""

# Test 7: Charger étape
Write-Host "TEST 7: GET /api/etape/{etapeId} - Charger étape"
Write-Host "────────────────────────────────────────────────────"
if ($etapeId) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/etape/$etapeId" -Method Get -ErrorAction Stop
        Write-Host "✅ SUCCÈS"
        Write-Host "Réponse:" ($response | ConvertTo-Json -Depth 2)
    } catch {
        Write-Host "❌ ERREUR:" $_.Exception.Message
    }
} else {
    Write-Host "⏭️ SKIPPED"
}
Write-Host ""

# Test 8: Créer exercice
Write-Host "TEST 8: POST /api/etape/{etapeId}/exercice - Créer exercice"
Write-Host "────────────────────────────────────────────────────"
if ($etapeId) {
    try {
        $body = @{
            type = "qcm"
            titre = "Test QCM"
            points = 10
            content = @{
                question = "Quelle est la bonne réponse?"
                options = @("Option 1", "Option 2", "Option 3")
                correctAnswer = 0
            }
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/etape/$etapeId/exercice" -Method Post -Body $body -Headers $headers -ErrorAction Stop
        Write-Host "✅ SUCCÈS"
        Write-Host "Réponse:" ($response | ConvertTo-Json -Depth 2)
        $exerciceId = $response.exercice.id
    } catch {
        Write-Host "❌ ERREUR:" $_.Exception.Message
    }
} else {
    Write-Host "⏭️ SKIPPED"
}
Write-Host ""

# Test 9: Charger exercice
Write-Host "TEST 9: GET /api/exercice/{exerciceId} - Charger exercice"
Write-Host "────────────────────────────────────────────────────"
if ($exerciceId) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/exercice/$exerciceId" -Method Get -ErrorAction Stop
        Write-Host "✅ SUCCÈS"
        Write-Host "Réponse:" ($response | ConvertTo-Json -Depth 2)
    } catch {
        Write-Host "❌ ERREUR:" $_.Exception.Message
    }
} else {
    Write-Host "⏭️ SKIPPED"
}
Write-Host ""

Write-Host "════════════════════════════════════════════════════"
Write-Host "TESTS TERMINÉS"
Write-Host "════════════════════════════════════════════════════"
