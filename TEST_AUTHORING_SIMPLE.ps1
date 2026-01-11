# TEST_AUTHORING_SIMPLE.ps1
# Script de test simple pour l'outil auteur

$API = "http://localhost:5000/api"
$passed = 0
$failed = 0
$ids = @{}
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "`n" -ForegroundColor Blue
Write-Host "============================================" -ForegroundColor Blue
Write-Host "  TEST COMPLET API AUTHORING-TOOL" -ForegroundColor Blue
Write-Host "============================================" -ForegroundColor Blue
Write-Host ""

# TEST 1: Niveaux
Write-Host "TEST 1: Charger les niveaux" -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "$API/niveaux" -Method GET
    Write-Host "  OK - Niveaux: $($res.niveaux -join ', ')" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# TEST 2: Creer chapitre
Write-Host "`nTEST 2: Creer un chapitre" -ForegroundColor Yellow
try {
    $body = @{
        titre = "Test Chapitre $timestamp"
        description = "Chapitre de test"
    } | ConvertTo-Json
    
    $res = Invoke-RestMethod -Uri "$API/niveaux/N1/chapitres" -Method POST -Body $body -ContentType "application/json"
    Write-Host "  OK - ChapterId: $($res.chapterId)" -ForegroundColor Green
    $ids.chapterId = $res.chapterId
    $passed++
} catch {
    Write-Host "  ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# TEST 3: Charger chapitre
if ($ids.chapterId) {
    Write-Host "`nTEST 3: Charger le chapitre" -ForegroundColor Yellow
    try {
        $res = Invoke-RestMethod -Uri "$API/chapitre/$($ids.chapterId)" -Method GET
        Write-Host "  OK - Chapitre: $($res.chapitre.titre)" -ForegroundColor Green
        Write-Host "     Etapes: $($res.etapes.Count)" -ForegroundColor Cyan
        if ($res.etapes.Count -gt 0) {
            $ids.etapeId = $res.etapes[0].id
        }
        $passed++
    } catch {
        Write-Host "  ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

# TEST 4: Creer etape
if ($ids.chapterId -and -not $ids.etapeId) {
    Write-Host "`nTEST 4: Creer une etape" -ForegroundColor Yellow
    try {
        $body = @{
            titre = "Etape Test"
            type = "apprentissage"
            description = "Etape de test"
        } | ConvertTo-Json
        
        $res = Invoke-RestMethod -Uri "$API/chapitre/$($ids.chapterId)/etape" -Method POST -Body $body -ContentType "application/json"
        Write-Host "  OK - EtapeId: $($res.etape.id)" -ForegroundColor Green
        $ids.etapeId = $res.etape.id
        $passed++
    } catch {
        Write-Host "  ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

# TEST 5: Creer QCM
if ($ids.etapeId) {
    Write-Host "`nTEST 5: Creer un QCM" -ForegroundColor Yellow
    try {
        $body = @{
            titre = "QCM Test $timestamp"
            type = "qcm"
            points = 10
            content = @{
                question = "Quelle est la capitale de la France?"
                options = @(
                    @{ label = "Paris"; correct = $true }
                    @{ label = "Londres"; correct = $false }
                    @{ label = "Berlin"; correct = $false }
                )
                correctAnswer = 0
                explanation = "Paris est la capitale de la France"
            }
        } | ConvertTo-Json -Depth 10
        
        $res = Invoke-RestMethod -Uri "$API/etape/$($ids.etapeId)/exercice" -Method POST -Body $body -ContentType "application/json"
        Write-Host "  OK - ExerciceId: $($res.exercice.id)" -ForegroundColor Green
        $ids.exerciceId = $res.exercice.id
        $passed++
    } catch {
        Write-Host "  ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

# TEST 6: Creer Vrai/Faux
if ($ids.etapeId) {
    Write-Host "`nTEST 6: Creer un Vrai/Faux" -ForegroundColor Yellow
    try {
        $body = @{
            titre = "VF Test"
            type = "vrai-faux"
            points = 5
            content = @{
                statement = "Paris est la capitale de la France"
                correctAnswer = $true
                explanation = "Correct!"
            }
        } | ConvertTo-Json -Depth 10
        
        $res = Invoke-RestMethod -Uri "$API/etape/$($ids.etapeId)/exercice" -Method POST -Body $body -ContentType "application/json"
        Write-Host "  OK - Exercice VF cree" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "  ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

# TEST 7: Charger exercice
if ($ids.exerciceId) {
    Write-Host "`nTEST 7: Charger l'exercice QCM" -ForegroundColor Yellow
    try {
        $res = Invoke-RestMethod -Uri "$API/exercice/$($ids.exerciceId)" -Method GET
        Write-Host "  OK - Exercice: $($res.exercice.titre)" -ForegroundColor Green
        Write-Host "     Type: $($res.exercice.type), Points: $($res.exercice.points)" -ForegroundColor Cyan
        $optCount = $res.exercice.content.options.Count
        Write-Host "     Options: $optCount" -ForegroundColor Cyan
        $passed++
    } catch {
        Write-Host "  ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

# TEST 8: Modifier exercice
if ($ids.exerciceId) {
    Write-Host "`nTEST 8: Modifier l'exercice QCM" -ForegroundColor Yellow
    try {
        $body = @{
            titre = "QCM Modifie"
            type = "qcm"
            points = 15
            content = @{
                question = "Quelle est la capitale de la France? (MODIFIE)"
                options = @(
                    @{ label = "Paris"; correct = $true }
                    @{ label = "Londres"; correct = $false }
                    @{ label = "Berlin"; correct = $false }
                    @{ label = "Madrid"; correct = $false }
                )
                correctAnswer = 0
                explanation = "Paris est toujours la capitale!"
            }
        } | ConvertTo-Json -Depth 10
        
        $res = Invoke-RestMethod -Uri "$API/exercice/$($ids.exerciceId)" -Method PUT -Body $body -ContentType "application/json"
        Write-Host "  OK - QCM modifie" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "  ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

# TEST 9: Verifier modifications
if ($ids.exerciceId) {
    Write-Host "`nTEST 9: Verifier les modifications" -ForegroundColor Yellow
    try {
        $res = Invoke-RestMethod -Uri "$API/exercice/$($ids.exerciceId)" -Method GET
        $points = $res.exercice.points
        $optCount = $res.exercice.content.options.Count
        
        if ($points -eq 15 -and $optCount -eq 4) {
            Write-Host "  OK - Points: $points, Options: $optCount" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  ERREUR - Points: $points (attendu 15), Options: $optCount (attendu 4)" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "  ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

# RESUME
Write-Host "`n" -ForegroundColor Blue
Write-Host "============================================" -ForegroundColor Blue
Write-Host "  RESUME DES TESTS" -ForegroundColor Blue
Write-Host "============================================" -ForegroundColor Blue
Write-Host "`nRussites: $passed" -ForegroundColor Green
Write-Host "Echoues: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "Total: $($passed + $failed)" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n*** TOUS LES TESTS REUSSIS! ***`n" -ForegroundColor Green
} else {
    Write-Host "`n*** CERTAINS TESTS ONT ECHOUE ***`n" -ForegroundColor Red
}

Write-Host "IDs CAPTUS:" -ForegroundColor Cyan
$ids.GetEnumerator() | ForEach-Object {
    Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray
}

Write-Host ""
