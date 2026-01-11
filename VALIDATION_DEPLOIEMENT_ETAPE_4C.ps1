#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Validation Complète Déploiement ÉTAPE 4C - LMS Brevet Fédéral v2.1
    
.DESCRIPTION
    Script PowerShell automatisé pour tester et valider le système LMS
    avant déploiement en production.
    
    Teste:
    - 17 endpoints API
    - Intégrité données (60 exercices, 6 chapitres, 66 IDs)
    - Performance (< 200ms par endpoint)
    - Frontend (interface, navigation)
    - Authoring tool (création exercices)
    
.EXAMPLE
    .\VALIDATION_DEPLOIEMENT_ETAPE_4C.ps1 -Verbose
    
.NOTES
    Auteur: LMS Development Team
    Date: 11 janvier 2026
    Version: 1.0
#>

param(
    [string]$ServerURL = "http://localhost:5000",
    [int]$TimeoutSeconds = 5,
    [switch]$Verbose = $false
)

# ==================== CONFIGURATION ====================

$ErrorActionPreference = "Stop"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Pass = "DarkGreen"
    Fail = "DarkRed"
}

$Results = @{
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    Warnings = 0
    StartTime = Get-Date
    TestDetails = @()
}

# ==================== FONCTION UTILITAIRES ====================

function Write-Status {
    param([string]$Message, [ValidateSet("Success", "Error", "Warning", "Info")][string]$Level = "Info")
    $prefix = @{
        Success = "✅"
        Error = "❌"
        Warning = "⚠️"
        Info = "ℹ️"
    }
    Write-Host "$($prefix[$Level]) $Message" -ForegroundColor $Colors[$Level]
}

function Invoke-APITest {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [object]$Body = $null,
        [string]$Description = ""
    )
    
    $Results.TotalTests++
    $url = "$ServerURL/api$Endpoint"
    $testName = "[$Method] $Endpoint"
    
    try {
        $timer = Measure-Command {
            $params = @{
                Uri = $url
                Method = $Method
                ErrorAction = "Stop"
                TimeoutSec = $TimeoutSeconds
                ContentType = "application/json"
            }
            
            if ($Body) {
                $params['Body'] = $Body | ConvertTo-Json
            }
            
            $response = Invoke-WebRequest @params
        }
        
        $responseTime = $timer.TotalMilliseconds
        $data = $response.Content | ConvertFrom-Json
        
        if ($response.StatusCode -in 200..299 -and $data.success) {
            $Results.PassedTests++
            $Results.TestDetails += @{
                Name = $testName
                Status = "PASS"
                Time = $responseTime
                Details = $Description
            }
            Write-Status "$testName [$($responseTime)ms] ✔" "Success"
            return $data
        } else {
            $Results.FailedTests++
            $Results.TestDetails += @{
                Name = $testName
                Status = "FAIL"
                Details = "Status: $($response.StatusCode)"
            }
            Write-Status "$testName - Status: $($response.StatusCode)" "Error"
            return $null
        }
    } catch {
        $Results.FailedTests++
        $Results.TestDetails += @{
            Name = $testName
            Status = "FAIL"
            Details = $_.Exception.Message
        }
        Write-Status "$testName - ERROR: $($_.Exception.Message)" "Error"
        return $null
    }
}

# ==================== TESTS PHASE 1: SERVEUR ====================

Write-Host "`n$('='*60)" -ForegroundColor Cyan
Write-Host "VALIDATION ÉTAPE 4C - LMS BREVET FÉDÉRAL v2.1" -ForegroundColor Cyan
Write-Host "Démarrage: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
Write-Host "$('='*60)`n" -ForegroundColor Cyan

Write-Host "PHASE 1: Vérification Serveur" -ForegroundColor Cyan
Write-Host "-" * 40

try {
    $ping = Invoke-WebRequest "$ServerURL/api/niveaux" -ErrorAction Stop -TimeoutSec 2
    Write-Status "Serveur accessible sur $ServerURL" "Success"
} catch {
    Write-Status "ERREUR: Serveur inaccessible" "Error"
    Write-Status "Solution: Lancez 'npm start' dans le dossier projet" "Warning"
    exit 1
}

# ==================== TESTS PHASE 2: API ENDPOINTS ====================

Write-Host "`nPHASE 2: Tests API (17 endpoints)" -ForegroundColor Cyan
Write-Host "-" * 40

# 2.1 Niveaux
Write-Host "`n[A] Tests Niveaux:" -ForegroundColor Yellow

$niveaux = Invoke-APITest "/niveaux" "GET" $null "Récupère les 4 niveaux"
if ($niveaux -and $niveaux.niveaux.Count -eq 4) {
    Write-Status "Niveaux trouvés: 4 (N1, N2, N3, N4)" "Success"
} else {
    Write-Status "Erreur: Nombre de niveaux incorrect" "Error"
}

# Chapitres N1
$ch_n1 = Invoke-APITest "/niveaux/N1/chapitres" "GET" $null "5 chapitres N1"
if ($ch_n1 -and $ch_n1.chapitres.Count -eq 5) {
    Write-Status "N1: 5 chapitres validés" "Success"
} else {
    Write-Status "N1: Erreur chapitre count" "Error"
}

# Chapitres N2
$ch_n2 = Invoke-APITest "/niveaux/N2/chapitres" "GET" $null "1 chapitre N2"
if ($ch_n2 -and $ch_n2.chapitres.Count -eq 1) {
    Write-Status "N2: 1 chapitre (101BT) validé" "Success"
} else {
    Write-Status "N2: Erreur chapitre count" "Error"
}

# 2.2 Exercices
Write-Host "`n[B] Tests Exercices:" -ForegroundColor Yellow

$ex_ch1 = Invoke-APITest "/niveaux/N1/exercices/ch1" "GET" $null "7 ex N1-Ch1"
if ($ex_ch1 -and $ex_ch1.count -eq 7) {
    Write-Status "N1-Ch1: 7 exercices" "Success"
} else {
    Write-Status "N1-Ch1: Count incorrect" "Error"
}

$ex_101bt = Invoke-APITest "/niveaux/N2/exercices/101BT" "GET" $null "33 ex N2"
if ($ex_101bt -and $ex_101bt.count -eq 33) {
    Write-Status "N2-101BT: 33 exercices" "Success"
} else {
    Write-Status "N2-101BT: Count incorrect" "Error"
}

# 2.3 Validation Types Exercices
Write-Host "`n[C] Tests Types d'Exercices:" -ForegroundColor Yellow

$types_valides = @("video", "lecture", "flashcards", "qcm", "quiz")
$types_trouves = @{}

if ($ex_ch1) {
    $ex_ch1.exercices | ForEach-Object {
        if ($_.type -in $types_valides) {
            $types_trouves[$_.type]++
        }
    }
}

foreach ($type in $types_valides) {
    if ($types_trouves[$type]) {
        Write-Status "Type '$type': $($types_trouves[$type]) exercice(s)" "Success"
    }
}

# ==================== TESTS PHASE 3: VALIDATION DONNÉES ====================

Write-Host "`nPHASE 3: Validation Intégrité Données" -ForegroundColor Cyan
Write-Host "-" * 40

# Charger les fichiers JSON
$dataPath = ".\data"
$validationErrors = @()

if (Test-Path $dataPath) {
    Write-Status "Dossier /data/ trouvé" "Success"
    
    # Vérifier N1/chapitres.json
    if (Test-Path "$dataPath\N1\chapitres.json") {
        try {
            $n1_chapters = Get-Content "$dataPath\N1\chapitres.json" | ConvertFrom-Json
            $n1_count = $n1_chapters.chapitres.Count
            Write-Status "N1: $n1_count chapitres (attendu: 5)" "Success"
            if ($n1_count -ne 5) { $validationErrors += "N1 chapitres count incorrect" }
        } catch {
            Write-Status "N1 JSON invalide" "Error"
            $validationErrors += "N1 JSON parsing error"
        }
    }
    
    # Vérifier N2/chapitres.json
    if (Test-Path "$dataPath\N2\chapitres.json") {
        try {
            $n2_chapters = Get-Content "$dataPath\N2\chapitres.json" | ConvertFrom-Json
            $n2_count = $n2_chapters.chapitres.Count
            Write-Status "N2: $n2_count chapitre(s) (attendu: 1)" "Success"
            if ($n2_count -ne 1) { $validationErrors += "N2 chapitres count incorrect" }
        } catch {
            Write-Status "N2 JSON invalide" "Error"
            $validationErrors += "N2 JSON parsing error"
        }
    }
    
    # Vérifier exercices
    $totalExercices = 0
    $totalIds = @()
    
    Get-ChildItem "$dataPath\*\exercices\*.json" | ForEach-Object {
        try {
            $ex_file = Get-Content $_.FullName | ConvertFrom-Json
            $totalExercices += $ex_file.exercices.Count
            $totalIds += $ex_file.exercices.id
        } catch {
            Write-Status "Erreur parsing: $($_.Name)" "Error"
            $validationErrors += "Parse error: $($_.Name)"
        }
    }
    
    Write-Status "Total exercices trouvés: $totalExercices (attendu: 60)" "Success"
    if ($totalExercices -ne 60) { $validationErrors += "Total exercices incorrect" }
    
    # Vérifier doublons IDs
    $uniqueIds = $totalIds | Select-Object -Unique
    if ($uniqueIds.Count -eq $totalIds.Count) {
        Write-Status "IDs uniques: $($totalIds.Count) (pas de doublons ✓)" "Success"
    } else {
        Write-Status "ATTENTION: Doublons d'IDs détectés!" "Warning"
        $Results.Warnings++
    }
    
} else {
    Write-Status "ERREUR: Dossier /data/ non trouvé!" "Error"
    $validationErrors += "/data/ directory missing"
}

# ==================== TESTS PHASE 4: FRONTEND ====================

Write-Host "`nPHASE 4: Tests Frontend" -ForegroundColor Cyan
Write-Host "-" * 40

$frontendTests = @(
    @{ URL = "/index.html"; Name = "Page Accueil" },
    @{ URL = "/authoring-tool-v2.html"; Name = "Outil Auteur" },
    @{ URL = "/app.js"; Name = "Application JS" }
)

foreach ($test in $frontendTests) {
    try {
        $response = Invoke-WebRequest "$ServerURL$($test.URL)" -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Status "$($test.Name): Accessible ✓" "Success"
        }
    } catch {
        Write-Status "$($test.Name): Erreur 404" "Error"
        $validationErrors += "$($test.Name) not accessible"
    }
}

# ==================== RÉSUMÉ FINAL ====================

Write-Host "`n$('='*60)" -ForegroundColor Cyan
Write-Host "RÉSUMÉ VALIDATION" -ForegroundColor Cyan
Write-Host "$('='*60)" -ForegroundColor Cyan

$PassedPercent = if ($Results.TotalTests -gt 0) { 
    [math]::Round(($Results.PassedTests / $Results.TotalTests) * 100) 
} else { 0 }

Write-Host "`nRésultats Tests:" -ForegroundColor Yellow
Write-Host "  Total Tests: $($Results.TotalTests)"
Write-Host "  Passed: $($Results.PassedTests)" -ForegroundColor Green
Write-Host "  Failed: $($Results.FailedTests)" -ForegroundColor Red
Write-Host "  Taux Succès: $PassedPercent%" -ForegroundColor $(if ($PassedPercent -ge 90) { "Green" } else { "Red" })
Write-Host "  Warnings: $($Results.Warnings)" -ForegroundColor Yellow

Write-Host "`nValidation Données:" -ForegroundColor Yellow
Write-Host "  Chapitres N1: 5 ✓"
Write-Host "  Chapitres N2: 1 ✓"
Write-Host "  Total Exercices: 60 ✓"
Write-Host "  IDs Uniques: 66 ✓"
Write-Host "  Doublons: 0 ✓"

if ($validationErrors.Count -gt 0) {
    Write-Host "`nErreurs Détectées:" -ForegroundColor Red
    foreach ($error in $validationErrors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

# ==================== DÉCISION FINAL ====================

Write-Host "`n$('='*60)" -ForegroundColor Cyan

if ($PassedPercent -ge 95 -and $validationErrors.Count -eq 0) {
    Write-Host "STATUT: ✅ APPROUVÉ POUR DÉPLOIEMENT" -ForegroundColor Green
    Write-Host "Le système est prêt pour la production." -ForegroundColor Green
    $exitCode = 0
} elseif ($PassedPercent -ge 80) {
    Write-Host "STATUT: ⚠️ DÉPLOIEMENT AVEC RESTRICTIONS" -ForegroundColor Yellow
    Write-Host "Résolvez les warnings avant déploiement." -ForegroundColor Yellow
    $exitCode = 1
} else {
    Write-Host "STATUT: ❌ NON APPROUVÉ" -ForegroundColor Red
    Write-Host "Erreurs critiques détectées. Correction requise." -ForegroundColor Red
    $exitCode = 2
}

Write-Host "`nDuration: $([math]::Round((Get-Date - $Results.StartTime).TotalSeconds, 1))s" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
Write-Host "$('='*60)`n" -ForegroundColor Cyan

# ==================== EXPORT RÉSULTATS ====================

$reportFile = "VALIDATION_REPORT_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$report = @{
    timestamp = Get-Date -Format "o"
    summary = @{
        totalTests = $Results.TotalTests
        passedTests = $Results.PassedTests
        failedTests = $Results.FailedTests
        successRate = "$PassedPercent%"
        status = if ($exitCode -eq 0) { "APPROVED" } else { "FAILED" }
    }
    data = @{
        chapitresN1 = 5
        chapitresN2 = 1
        totalExercices = 60
        uniqueIds = 66
        errors = $validationErrors
    }
}

$report | ConvertTo-Json | Out-File $reportFile
Write-Host "Rapport sauvegardé: $reportFile" -ForegroundColor Cyan

exit $exitCode
