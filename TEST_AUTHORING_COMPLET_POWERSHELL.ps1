# TEST_AUTHORING_COMPLET_POWERSHELL.ps1
# Script de test pour l'outil auteur avec PowerShell

$API = "http://localhost:5000/api"
$passed = 0
$failed = 0
$capturedIds = @{}

function Test-Route {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Path,
        [object]$Body = $null
    )
    
    try {
        $uri = "$API$Path"
        $params = @{
            Uri     = $uri
            Method  = $Method
            Headers = @{ "Content-Type" = "application/json" }
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
        
        Write-Host "🧪 TEST: $Method $Path" -ForegroundColor Cyan
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        Write-Host "✅ RÉUSSI - Status 200" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
        $global:passed++
        return $response
    }
    catch {
        Write-Host "❌ ÉCHOUÉ - $($_.Exception.Message)" -ForegroundColor Red
        $global:failed++
        return $null
    }
}

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  🚀 TESTS COMPLETS API AUTHORING-TOOL             ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Blue

# TEST 1: Charger les niveaux
Write-Host "`n▶ TEST 1: CHARGER LES NIVEAUX" -ForegroundColor Yellow
$niveaux = Test-Route "GET /api/niveaux" "GET" "/niveaux"

# TEST 2: Créer un chapitre
Write-Host "`n▶ TEST 2: CRÉER UN CHAPITRE" -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$chapBody = @{
    titre = "Chapitre Test - $timestamp"
    description = "Créé par test script"
} | ConvertTo-Json

$chapResult = Test-Route "POST /api/niveaux/N1/chapitres" "POST" "/niveaux/N1/chapitres" $chapBody
if ($chapResult -and $chapResult.chapterId) {
    $capturedIds['chapterId'] = $chapResult.chapterId
    Write-Host "   💾 ChapterId capturé: $($chapResult.chapterId)" -ForegroundColor Cyan
}

# TEST 3: Charger le chapitre
if ($capturedIds['chapterId']) {
    Write-Host "`n▶ TEST 3: CHARGER LE CHAPITRE" -ForegroundColor Yellow
    $chapLoad = Test-Route "GET /api/chapitre/:chapterId" "GET" "/chapitre/$($capturedIds['chapterId'])"
    if ($chapLoad) {
        Write-Host "   📖 Chapitre: $($chapLoad.chapitre.titre)" -ForegroundColor Cyan
        Write-Host "   📚 Étapes trouvées: $($chapLoad.etapes.Count)" -ForegroundColor Cyan
        
        if ($chapLoad.etapes.Count -gt 0) {
            $capturedIds['etapeId'] = $chapLoad.etapes[0].id
        }
    }
}

# TEST 4: Créer une étape (si aucune)
if (-not $capturedIds['etapeId'] -and $capturedIds['chapterId']) {
    Write-Host "`n▶ TEST 4: CRÉER UNE ÉTAPE" -ForegroundColor Yellow
    $etapBody = @{
        titre = "Étape Test"
        type = "apprentissage"
        description = "Créée par test script"
    } | ConvertTo-Json
    
    $etapResult = Test-Route "POST /api/chapitre/:chapterId/etape" "POST" "/chapitre/$($capturedIds['chapterId'])/etape" $etapBody
    if ($etapResult -and $etapResult.etape.id) {
        $capturedIds['etapeId'] = $etapResult.etape.id
        Write-Host "   💾 EtapeId capturé: $($etapResult.etape.id)" -ForegroundColor Cyan
    }
}

# TEST 5: Charger l'étape
if ($capturedIds['etapeId']) {
    Write-Host "`n▶ TEST 5: CHARGER L'ÉTAPE" -ForegroundColor Yellow
    $etapLoad = Test-Route "GET /api/etape/:etapeId" "GET" "/etape/$($capturedIds['etapeId'])"
    if ($etapLoad) {
        Write-Host "   ⚡ Étape: $($etapLoad.etape.titre)" -ForegroundColor Cyan
        Write-Host "   ✏️  Exercices trouvés: $($etapLoad.exercices.Count)" -ForegroundColor Cyan
    }
}

# TEST 6: Créer un QCM
if ($capturedIds['etapeId']) {
    Write-Host "`n▶ TEST 6: CRÉER UN QCM" -ForegroundColor Yellow
    $qcmBody = @{
        titre = "QCM Test - $timestamp"
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
    
    $qcmResult = Test-Route "POST /api/etape/:etapeId/exercice (QCM)" "POST" "/etape/$($capturedIds['etapeId'])/exercice" $qcmBody
    if ($qcmResult -and $qcmResult.exercice.id) {
        $capturedIds['exerciceId'] = $qcmResult.exercice.id
        Write-Host "   💾 ExerciceId capturé: $($qcmResult.exercice.id)" -ForegroundColor Cyan
    }
}

# TEST 7: Créer un Vrai/Faux
if ($capturedIds['etapeId']) {
    Write-Host "`n▶ TEST 7: CRÉER UN VRAI/FAUX" -ForegroundColor Yellow
    $vfBody = @{
        titre = "Vrai/Faux Test"
        type = "vrai-faux"
        points = 5
        content = @{
            statement = "Paris est la capitale de la France"
            correctAnswer = $true
            explanation = "Correct!"
        }
    } | ConvertTo-Json -Depth 10
    
    $vfResult = Test-Route "POST /api/etape/:etapeId/exercice (VF)" "POST" "/etape/$($capturedIds['etapeId'])/exercice" $vfBody
    if ($vfResult) {
        Write-Host "   ✏️  Exercice Vrai/Faux créé" -ForegroundColor Cyan
    }
}

# TEST 8: Charger le QCM
if ($capturedIds['exerciceId']) {
    Write-Host "`n▶ TEST 8: CHARGER LE QCM" -ForegroundColor Yellow
    $exLoad = Test-Route "GET /api/exercice/:exerciceId" "GET" "/exercice/$($capturedIds['exerciceId'])"
    if ($exLoad) {
        Write-Host "   📝 Exercice: $($exLoad.exercice.titre)" -ForegroundColor Cyan
        Write-Host "   📊 Type: $($exLoad.exercice.type)" -ForegroundColor Cyan
        Write-Host "   🎯 Points: $($exLoad.exercice.points)" -ForegroundColor Cyan
        $optCount = $exLoad.exercice.content.options.Count
        $correctIndex = $exLoad.exercice.content.options | Where-Object { $_.correct } | ForEach-Object { [array]::IndexOf($exLoad.exercice.content.options, $_) }
        Write-Host "   📋 Options: $optCount, Bonne réponse: Option $($correctIndex + 1)" -ForegroundColor Cyan
    }
}

# TEST 9: Modifier le QCM
if ($capturedIds['exerciceId']) {
    Write-Host "`n▶ TEST 9: MODIFIER LE QCM" -ForegroundColor Yellow
    $updateBody = @{
        titre = "QCM Modifié"
        type = "qcm"
        points = 15
        content = @{
            question = "Quelle est la capitale de la France? (MODIFIÉ)"
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
    
    $updateResult = Test-Route "PUT /api/exercice/:exerciceId" "PUT" "/exercice/$($capturedIds['exerciceId'])" $updateBody
    if ($updateResult) {
        Write-Host "   ✅ QCM modifié avec succès" -ForegroundColor Cyan
    }
}

# TEST 10: Recharger le QCM pour vérifier les modifications
if ($capturedIds['exerciceId']) {
    Write-Host "`n▶ TEST 10: VÉRIFIER LES MODIFICATIONS" -ForegroundColor Yellow
    $exCheck = Test-Route "GET /api/exercice/:exerciceId (vérif)" "GET" "/exercice/$($capturedIds['exerciceId'])"
    if ($exCheck -and $exCheck.exercice.points -eq 15) {
        Write-Host "   ✅ Points modifiés: 15" -ForegroundColor Cyan
        $newOptCount = $exCheck.exercice.content.options.Count
        Write-Host "   ✅ Options modifiées: $newOptCount" -ForegroundColor Cyan
    }
}

# RÉSUMÉ
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  📊 RÉSUMÉ DES TESTS                               ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Blue

Write-Host "✅ Réussis: $global:passed" -ForegroundColor Green
Write-Host "❌ Échoués: $global:failed" -ForegroundColor Red
Write-Host "📊 Total: $($global:passed + $global:failed)" -ForegroundColor Cyan

if ($global:failed -eq 0) {
    Write-Host "`n🎉 TOUS LES TESTS RÉUSSIS!" -ForegroundColor Green
}

Write-Host "`n📝 IDs CAPTURÉS:" -ForegroundColor Cyan
$capturedIds.GetEnumerator() | ForEach-Object {
    Write-Host "   $($_.Key): $($_.Value)" -ForegroundColor Gray
}

Write-Host "`n"
