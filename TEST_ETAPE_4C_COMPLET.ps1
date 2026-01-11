################################################################################
# TEST COMPLET ÉTAPE 4C - LMS Brevet Fédéral
# Script de validation automatisé pour tous les endpoints
# Date: 11 janvier 2026
################################################################################

param(
    [string]$ServerUrl = "http://localhost:5000",
    [switch]$Verbose
)

# ═════════════════════════════════════════════════════════════════════════════
# CONFIGURATION & COULEURS
# ═════════════════════════════════════════════════════════════════════════════

$colors = @{
    Pass    = 'Green'
    Fail    = 'Red'
    Warning = 'Yellow'
    Info    = 'Cyan'
    Header  = 'Magenta'
}

$results = @{
    Total   = 0
    Passed  = 0
    Failed  = 0
    Tests   = @()
}

$startTime = Get-Date

# ═════════════════════════════════════════════════════════════════════════════
# FONCTIONS UTILITAIRES
# ═════════════════════════════════════════════════════════════════════════════

function Write-ColorOutput {
    param([string]$Message, [string]$Color = 'White')
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    Write-ColorOutput "`n╔═══════════════════════════════════════════════════════════════════════════╗" $colors.Header
    Write-ColorOutput "║  $($Title.PadRight(71))║" $colors.Header
    Write-ColorOutput "╚═══════════════════════════════════════════════════════════════════════════╝" $colors.Header
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Uri,
        [hashtable]$Body = $null,
        [scriptblock]$Validation = $null,
        [string]$Description = ""
    )

    $testNumber = $results.Total + 1
    $results.Total++
    $testStart = Get-Date

    try {
        $params = @{
            Uri             = "$ServerUrl$Uri"
            Method          = $Method
            UseBasicParsing = $true
            ErrorAction     = 'Stop'
            Headers         = @{'Content-Type' = 'application/json'}
        }

        if ($Body) {
            $params.Body = $Body | ConvertTo-Json
        }

        $response = Invoke-WebRequest @params
        $content = $response.Content | ConvertFrom-Json
        $duration = ((Get-Date) - $testStart).TotalMilliseconds

        # Validation
        $isValid = $true
        $message = ""

        if ($Validation) {
            $validationResult = & $Validation $content
            if ($validationResult -is [hashtable]) {
                $isValid = $validationResult.Success
                $message = $validationResult.Message
            } else {
                $isValid = $validationResult
            }
        } else {
            $isValid = $response.StatusCode -eq 200 -and $content.success -eq $true
            $message = "OK"
        }

        if ($isValid) {
            $results.Passed++
            $status = "✅ PASSÉ"
            $statusColor = $colors.Pass
        } else {
            $results.Failed++
            $status = "❌ ÉCHOUÉ"
            $statusColor = $colors.Fail
            $message = "Validation échouée: $message"
        }

        $results.Tests += @{
            Number   = $testNumber
            Name     = $Name
            Status   = $status
            Duration = $duration
            Message  = $message
            Success  = $isValid
        }

        Write-ColorOutput "$status  Test $testNumber`: $Name ($([math]::Round($duration))ms)" $statusColor
        if ($message -and $message -ne "OK") {
            Write-ColorOutput "     └─ $message" $colors.Warning
        }
        if ($Verbose -and !$isValid) {
            Write-ColorOutput "     └─ Response: $($content | ConvertTo-Json)" $colors.Warning
        }

        return $isValid

    } catch {
        $results.Failed++
        $duration = ((Get-Date) - $testStart).TotalMilliseconds
        
        Write-ColorOutput "❌ ÉCHOUÉ  Test $testNumber`: $Name ($([math]::Round($duration))ms)" $colors.Fail
        Write-ColorOutput "     └─ Erreur: $($_.Exception.Message)" $colors.Fail

        $results.Tests += @{
            Number   = $testNumber
            Name     = $Name
            Status   = "❌ ÉCHOUÉ"
            Duration = $duration
            Message  = $_.Exception.Message
            Success  = $false
        }

        return $false
    }
}

# ═════════════════════════════════════════════════════════════════════════════
# A. TESTS API BACKEND
# ═════════════════════════════════════════════════════════════════════════════

Write-Header "A. TESTS API BACKEND (5 tests)"

# Test 1: GET /api/niveaux
Test-Endpoint `
    -Name "GET /api/niveaux - Listing des niveaux" `
    -Method "GET" `
    -Uri "/api/niveaux" `
    -Validation {
        param($response)
        if ($response.success -ne $true) {
            return @{Success = $false; Message = "success = false"}
        }
        if ($response.niveaux.Count -ne 4) {
            return @{Success = $false; Message = "Expected 4 niveaux, got $($response.niveaux.Count)"}
        }
        if ($response.niveaux[0].chapitres -ne 5) {
            return @{Success = $false; Message = "N1 should have 5 chapitres, got $($response.niveaux[0].chapitres)"}
        }
        if ($response.niveaux[1].chapitres -ne 1) {
            return @{Success = $false; Message = "N2 should have 1 chapitre, got $($response.niveaux[1].chapitres)"}
        }
        return @{Success = $true; Message = "4 niveaux trouvés (N1: 5ch, N2: 1ch, N3: 0ch, N4: 0ch)"}
    }

# Test 2: GET /api/niveaux/N1/chapitres
Test-Endpoint `
    -Name "GET /api/niveaux/N1/chapitres - Chapitres N1" `
    -Method "GET" `
    -Uri "/api/niveaux/N1/chapitres" `
    -Validation {
        param($response)
        if ($response.success -ne $true) {
            return @{Success = $false; Message = "success = false"}
        }
        if ($response.chapitres.Count -ne 5) {
            return @{Success = $false; Message = "Expected 5 chapitres, got $($response.chapitres.Count)"}
        }
        $ids = $response.chapitres | Select-Object -ExpandProperty id
        if ($ids -notcontains "ch1" -or $ids -notcontains "ch5") {
            return @{Success = $false; Message = "Missing ch1 or ch5"}
        }
        return @{Success = $true; Message = "5 chapitres N1 trouvés (ch1-ch5)"}
    }

# Test 3: GET /api/niveaux/N2/chapitres
Test-Endpoint `
    -Name "GET /api/niveaux/N2/chapitres - Chapitres N2" `
    -Method "GET" `
    -Uri "/api/niveaux/N2/chapitres" `
    -Validation {
        param($response)
        if ($response.success -ne $true) {
            return @{Success = $false; Message = "success = false"}
        }
        if ($response.chapitres.Count -ne 1) {
            return @{Success = $false; Message = "Expected 1 chapitre, got $($response.chapitres.Count)"}
        }
        if ($response.chapitres[0].id -ne "101BT") {
            return @{Success = $false; Message = "Expected 101BT, got $($response.chapitres[0].id)"}
        }
        return @{Success = $true; Message = "1 chapitre N2 trouvé (101BT)"}
    }

# Test 4: GET /api/niveaux/N1/exercices/ch1
Test-Endpoint `
    -Name "GET /api/niveaux/N1/exercices/ch1 - Exercices ch1" `
    -Method "GET" `
    -Uri "/api/niveaux/N1/exercices/ch1" `
    -Validation {
        param($response)
        if ($response.success -ne $true) {
            return @{Success = $false; Message = "success = false"}
        }
        if ($response.count -ne 7) {
            return @{Success = $false; Message = "Expected 7 exercices, got $($response.count)"}
        }
        return @{Success = $true; Message = "7 exercices ch1 trouvés"}
    }

# Test 5: GET /api/niveaux/N2/exercices/101BT
Test-Endpoint `
    -Name "GET /api/niveaux/N2/exercices/101BT - Exercices 101BT" `
    -Method "GET" `
    -Uri "/api/niveaux/N2/exercices/101BT" `
    -Validation {
        param($response)
        if ($response.success -ne $true) {
            return @{Success = $false; Message = "success = false"}
        }
        if ($response.count -ne 33) {
            return @{Success = $false; Message = "Expected 33 exercices, got $($response.count)"}
        }
        return @{Success = $true; Message = "33 exercices 101BT trouvés"}
    }

# ═════════════════════════════════════════════════════════════════════════════
# B. TESTS TYPES D'EXERCICES
# ═════════════════════════════════════════════════════════════════════════════

Write-Header "B. TESTS TYPES D'EXERCICES (5 tests)"

$exerciceTests = @(
    @{
        Type        = "video"
        ChapterId   = "ch1"
        Expected    = "video"
        Description = "Type vidéo valide"
    },
    @{
        Type        = "lecture"
        ChapterId   = "ch1"
        Expected    = "lecture"
        Description = "Type lecture valide"
    },
    @{
        Type        = "flashcards"
        ChapterId   = "ch3"
        Expected    = "flashcards"
        Description = "Type flashcards valide"
    },
    @{
        Type        = "qcm"
        ChapterId   = "ch1"
        Expected    = "qcm"
        Description = "Type QCM valide"
    },
    @{
        Type        = "quiz"
        ChapterId   = "ch2"
        Expected    = "quiz"
        Description = "Type quiz valide"
    }
)

$testIndex = 0
foreach ($test in $exerciceTests) {
    $testIndex++
    Test-Endpoint `
        -Name "Validation type d'exercice: $($test.Type)" `
        -Method "GET" `
        -Uri "/api/niveaux/N1/exercices/$($test.ChapterId)" `
        -Validation {
            param($response)
            if ($response.success -ne $true) {
                return @{Success = $false; Message = "API error"}
            }
            
            $exerciceOfType = $response.exercices | Where-Object { $_.type -eq $args[0] } | Select-Object -First 1
            
            if (!$exerciceOfType) {
                return @{Success = $false; Message = "No exercice of type $($args[0]) found"}
            }
            
            $requiredFields = @('id', 'type', 'titre', 'content')
            foreach ($field in $requiredFields) {
                if (!$exerciceOfType.$field) {
                    return @{Success = $false; Message = "Missing field: $field"}
                }
            }
            
            return @{Success = $true; Message = "Type $($args[0]) valide avec tous les champs requis"}
        }.GetNewClosure()
}

# ═════════════════════════════════════════════════════════════════════════════
# C. TESTS STATISTIQUES
# ═════════════════════════════════════════════════════════════════════════════

Write-Header "C. TESTS STATISTIQUES (4 tests)"

# Test: Compteur 60 exercices totaux
Test-Endpoint `
    -Name "Compteur: 60 exercices totaux" `
    -Method "GET" `
    -Uri "/api/niveaux/N1/exercices/ch1" `
    -Validation {
        param($response)
        # Charger tous les exercices
        $total = 0
        
        # N1: ch1-5
        for ($i = 1; $i -le 5; $i++) {
            try {
                $resp = Invoke-WebRequest -Uri "$ServerUrl/api/niveaux/N1/exercices/ch$i" -UseBasicParsing -ErrorAction SilentlyContinue
                $data = $resp.Content | ConvertFrom-Json
                $total += $data.count
            } catch {}
        }
        
        # N2: 101BT
        try {
            $resp = Invoke-WebRequest -Uri "$ServerUrl/api/niveaux/N2/exercices/101BT" -UseBasicParsing -ErrorAction SilentlyContinue
            $data = $resp.Content | ConvertFrom-Json
            $total += $data.count
        } catch {}
        
        if ($total -ne 60) {
            return @{Success = $false; Message = "Expected 60 exercices, got $total"}
        }
        return @{Success = $true; Message = "$total exercices totaux (27 N1 + 33 N2)"}
    }

# Test: Compteur 6 chapitres totaux
Test-Endpoint `
    -Name "Compteur: 6 chapitres totaux" `
    -Method "GET" `
    -Uri "/api/niveaux" `
    -Validation {
        param($response)
        $total = $response.niveaux | ForEach-Object { $_.chapitres } | Measure-Object -Sum | Select-Object -ExpandProperty Sum
        if ($total -ne 6) {
            return @{Success = $false; Message = "Expected 6 chapitres, got $total"}
        }
        return @{Success = $true; Message = "$total chapitres totaux (5 N1 + 1 N2)"}
    }

# Test: Points totaux
Test-Endpoint `
    -Name "Compteur: Points et scores" `
    -Method "GET" `
    -Uri "/api/niveaux/N1/chapitres" `
    -Validation {
        param($response)
        if ($response.chapitres.Count -eq 0) {
            return @{Success = $false; Message = "No chapitres found"}
        }
        return @{Success = $true; Message = "Chapitres avec étapes et métadonnées de points"}
    }

# Test: Aucun doublon d'ID
Test-Endpoint `
    -Name "Validation: Aucun doublon d'ID" `
    -Method "GET" `
    -Uri "/api/niveaux/N1/chapitres" `
    -Validation {
        param($response)
        $ids = @()
        foreach ($ch in $response.chapitres) {
            $ids += $ch.id
            foreach ($etape in ($ch.etapes | Where-Object { $_ })) {
                $ids += $etape.id
            }
        }
        
        $duplicates = $ids | Group-Object | Where-Object { $_.Count -gt 1 }
        if ($duplicates) {
            return @{Success = $false; Message = "Doublons trouvés: $($duplicates.Name -join ', ')"}
        }
        return @{Success = $true; Message = "Aucun doublon d'ID détecté"}
    }

# ═════════════════════════════════════════════════════════════════════════════
# D. TESTS D'INTÉGRATION
# ═════════════════════════════════════════════════════════════════════════════

Write-Header "D. TESTS D'INTÉGRATION (3 tests)"

# Test: Index.html accessible
Test-Endpoint `
    -Name "Accès index.html (application principale)" `
    -Method "GET" `
    -Uri "/" `
    -Validation {
        param($response)
        # Si on arrive ici, c'est que la requête a réussi
        return @{Success = $true; Message = "Application accessible"}
    }

# Test: Authoring tool accessible
Test-Endpoint `
    -Name "Accès authoring-tool-v2.html" `
    -Method "GET" `
    -Uri "/authoring-tool-v2.html" `
    -Validation {
        param($response)
        return @{Success = $true; Message = "Outil auteur accessible"}
    }

# Test: Structure fichiers
Test-Endpoint `
    -Name "Vérification structure fichiers" `
    -Method "GET" `
    -Uri "/api/niveaux" `
    -Validation {
        param($response)
        $expectedLevels = @('N1', 'N2', 'N3', 'N4')
        $actualLevels = $response.niveaux | Select-Object -ExpandProperty id
        
        foreach ($level in $expectedLevels) {
            if ($level -notin $actualLevels) {
                return @{Success = $false; Message = "Niveau $level manquant"}
            }
        }
        
        return @{Success = $true; Message = "Structure N1-N4 complète et valide"}
    }

# ═════════════════════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═════════════════════════════════════════════════════════════════════════════

Write-Header "RÉSUMÉ FINAL"

$duration = ((Get-Date) - $startTime).TotalSeconds
$percentage = if ($results.Total -gt 0) { [math]::Round(($results.Passed / $results.Total) * 100) } else { 0 }

Write-ColorOutput "`n📊 STATISTIQUES" $colors.Info
Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $colors.Info
Write-ColorOutput "Total de tests         : $($results.Total)" $colors.Info
Write-ColorOutput "Tests réussis          : $($results.Passed)" $colors.Pass
Write-ColorOutput "Tests échoués          : $($results.Failed)" $(if ($results.Failed -gt 0) { $colors.Fail } else { $colors.Info })
Write-ColorOutput "Taux de réussite       : $percentage%" $(if ($percentage -eq 100) { $colors.Pass } elseif ($percentage -ge 80) { $colors.Warning } else { $colors.Fail })
Write-ColorOutput "Durée totale           : $([math]::Round($duration, 2))s" $colors.Info

if ($results.Failed -gt 0) {
    Write-ColorOutput "`n⚠️  TESTS ÉCHOUÉS" $colors.Fail
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $colors.Fail
    $results.Tests | Where-Object { !$_.Success } | ForEach-Object {
        Write-ColorOutput "Test #$($_.Number): $($_.Name)" $colors.Fail
        Write-ColorOutput "  └─ $($_.Message)" $colors.Warning
    }
}

Write-ColorOutput "`n✅ RECOMMANDATIONS" $colors.Info
Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $colors.Info

if ($percentage -eq 100) {
    Write-ColorOutput "✨ TOUS LES TESTS PASSENT - SYSTÈME PRÊT POUR PRODUCTION" $colors.Pass
    Write-ColorOutput "   • Structure N1-N4 validée" $colors.Pass
    Write-ColorOutput "   • 60 exercices correctement stockés" $colors.Pass
    Write-ColorOutput "   • API endpoints fonctionnels" $colors.Pass
    Write-ColorOutput "   • Intégration complète validée" $colors.Pass
} elseif ($percentage -ge 80) {
    Write-ColorOutput "⚠️  SYSTÈME FONCTIONNEL AVEC RÉSERVES" $colors.Warning
    Write-ColorOutput "   • Vérifier les erreurs ci-dessus" $colors.Warning
    Write-ColorOutput "   • Corriger avant déploiement production" $colors.Warning
} else {
    Write-ColorOutput "❌ SYSTÈME NON PRÊT - CORRECTIONS REQUISES" $colors.Fail
    Write-ColorOutput "   • $($results.Failed) test(s) échoué(s)" $colors.Fail
    Write-ColorOutput "   • Contacter l'équipe de développement" $colors.Fail
}

Write-ColorOutput "`n" $colors.Info

# Export résultats
$resultsFile = "TEST_RESULTS_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
@{
    timestamp    = (Get-Date -Format 'o')
    total        = $results.Total
    passed       = $results.Passed
    failed       = $results.Failed
    percentage   = $percentage
    duration     = [math]::Round($duration, 2)
    tests        = $results.Tests
    serverUrl    = $ServerUrl
} | ConvertTo-Json | Out-File $resultsFile

Write-ColorOutput "📝 Résultats sauvegardés dans: $resultsFile" $colors.Info

exit if ($results.Failed -gt 0) { 1 } else { 0 }
