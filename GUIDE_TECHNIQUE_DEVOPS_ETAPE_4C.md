# 🔧 GUIDE TECHNIQUE DEVOPS - ÉTAPE 4C

**Pour Responsables Techniques et DevOps | 11 janvier 2026**

---

## ⚡ Commandes Essentielles

### Pre-Deployment Check (2 min)

```powershell
# Vérifier Node.js
node --version
# Expected: v16.x, v18.x, ou v20.x

# Vérifier npm
npm --version
# Expected: v8+

# Vérifier port disponible
netstat -an | Select-String "5000"
# Expected: (aucune output = port libre)

# Vérifier dossier projet
cd "c:\Users\patri\OneDrive\Bureau\LMS Brevet Fédéral"
Test-Path ".\data\N1\chapitres.json"
# Expected: True
```

### Installation Dependencies (3 min)

```powershell
# Installer
npm install

# Vérifier installation
Test-Path ".\node_modules\express"
Test-Path ".\node_modules\cors"
# Expected: True (both)
```

### Full Validation (5 min)

```powershell
# MÉTHODE 1: Script complet (RECOMMANDÉ)
.\VALIDATION_DEPLOIEMENT_ETAPE_4C.ps1 -Verbose

# MÉTHODE 2: Tests individuels (au besoin)
pwsh TEST_ETAPE_4C_COMPLET.ps1 -Verbose
```

---

## 🚀 Déploiement Production

### Étape 1: Sauvegarde (2 min)

```powershell
# Créer backup
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backup = "backup_prod_$timestamp"
Copy-Item -Path ".\data" -Destination $backup -Recurse
Write-Host "✅ Backup créé: $backup"

# Vérifier backup
Test-Path $backup
# Expected: True

# Archiver backup (optionnel)
$zip = "$backup.zip"
Compress-Archive -Path $backup -DestinationPath $zip
Write-Host "✅ Archive: $zip"
```

### Étape 2: Démarrage Serveur (1 min)

```powershell
# Démarrer serveur
npm start

# Expected output:
# Server running on port 5000
# Loading chapters from API...
# ✅ LMS LANCÉ

# Garde la fenêtre PowerShell ouverte (serveur tourne au premier plan)
# Pour l'exécuter en arrière-plan, voir section "Background Mode"
```

### Étape 3: Vérification API (1 min)

```powershell
# Vérifier serveur répond
$response = Invoke-WebRequest http://localhost:5000/api/niveaux
$response.StatusCode
# Expected: 200

# Vérifier contenu
$data = $response.Content | ConvertFrom-Json
$data.niveaux.Count
# Expected: 4 (N1, N2, N3, N4)

# Vérifier counts
$data.niveaux | Where-Object {$_.id -eq "N1"} | Select-Object chapitres
# Expected: chapitres: 5
```

### Étape 4: Accès Utilisateurs (immédiat)

```
Apprenant:  http://localhost:5000/index.html
Formateur:  http://localhost:5000/authoring-tool-v2.html
API Base:   http://localhost:5000/api
```

---

## 🔄 Mode Arrière-Plan (Background)

### Lancer en Arrière-Plan

```powershell
# MÉTHODE 1: Avec Start-Process
Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow -RedirectStandardOutput "server.log" -RedirectStandardError "server-error.log"

# Vérifier statut
Get-Process node
# Expected: process running

# Vérifier logs
Get-Content "server.log" -Tail 10
# Expected: "Server running on port 5000"
```

### Arrêter Serveur

```powershell
# Arrêter processus Node
Get-Process node | Stop-Process -Force

# Vérifier arrêt
Get-Process node -ErrorAction SilentlyContinue
# Expected: (aucune output)
```

### Redémarrer

```powershell
# Arrêter
Get-Process node | Stop-Process -Force
Start-Sleep 2

# Démarrer
Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow

# Vérifier
Start-Sleep 3
Invoke-WebRequest http://localhost:5000/api/niveaux
# Expected: Status 200
```

---

## 📊 Monitoring & Health Check

### Health Check Script

```powershell
# create health_check.ps1
$health = @{
    timestamp = Get-Date
    status = "UNKNOWN"
    issues = @()
}

# 1. Vérifier serveur
try {
    $resp = Invoke-WebRequest http://localhost:5000/api/niveaux -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
        $health.status = "HEALTHY"
    }
} catch {
    $health.status = "DOWN"
    $health.issues += "Server not responding: $($_.Exception.Message)"
}

# 2. Vérifier fichiers
$requiredFiles = @(
    ".\data\N1\chapitres.json",
    ".\data\N2\chapitres.json",
    ".\server.js",
    ".\app.js",
    ".\authoring-tool-v2.html"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $health.issues += "Missing: $file"
    }
}

# 3. Afficher résultat
$health | ConvertTo-Json
Write-Host "Status: $($health.status)"

if ($health.issues.Count -gt 0) {
    Write-Host "Issues:" -ForegroundColor Red
    $health.issues | ForEach-Object { Write-Host "  - $_" }
}
```

### Exécuter Health Check

```powershell
.\health_check.ps1

# Expected output:
# Status: HEALTHY
# (no issues)
```

---

## 🔧 Troubleshooting - Commandes

### Serveur ne démarre pas

```powershell
# 1. Vérifier port occupé
netstat -an | Select-String "5000"
# Si trouvé: tuer processus
Get-Process | Where-Object {$_.Id -eq <PID>} | Stop-Process -Force

# 2. Vérifier npm installé
npm --version
npm list express
# Expected: express@4.x

# 3. Nettoyer et réinstaller
Remove-Item .\node_modules -Recurse -Force
Remove-Item .\package-lock.json
npm install
npm start
```

### Fichiers JSON corrompus

```powershell
# Tester validité JSON
$files = Get-ChildItem ".\data\" -Recurse -Filter "*.json"
foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName | ConvertFrom-Json
        Write-Host "✅ $($file.Name)"
    } catch {
        Write-Host "❌ $($file.Name) - ERREUR: $($_.Exception.Message)"
        # Solution: Restaurer depuis backup
        # Copy-Item -Path "backup_xxx\data\..." -Destination ".\data\..."
    }
}
```

### API retourne erreur 500

```powershell
# 1. Vérifier fichiers de données existent
ls -la .\data\N1\chapitres.json
ls -la .\data\N2\chapitres.json

# 2. Vérifier format JSON
cat .\data\N1\chapitres.json | ConvertFrom-Json
# Expected: chapitres array

# 3. Vérifier permissions lecture
(Get-Item ".\data").Attributes
# Expected: Directory (readable)

# 4. Vérifier erreurs serveur (logs)
Get-Content "server.log" -Tail 20
```

### localStorage Apprenant vide

```powershell
# Note: localStorage côté client, pas server-side
# Pour le nettoyer, utiliser console navigateur (F12):
# localStorage.clear(); location.reload();

# Alternativement, mettre endpoint pour reset:
# GET http://localhost:5000/api/reset-storage (si implémenté)
```

---

## 📈 Performance Tuning

### Mesurer Performance

```powershell
# Tester temps réponse (10 requêtes)
$times = @()
for ($i = 1; $i -le 10; $i++) {
    $timer = Measure-Command {
        Invoke-WebRequest http://localhost:5000/api/niveaux -ErrorAction Stop > $null
    }
    $times += $timer.TotalMilliseconds
    Write-Host "Request $i: $($timer.TotalMilliseconds)ms"
}

# Calculer moyenne
$average = ($times | Measure-Object -Average).Average
Write-Host "Average: $average ms"
# Expected: <200ms
```

### Optimiser

```powershell
# 1. Réduire taille fichiers JSON
# 2. Implémenter caching (Redis optionnel)
# 3. Utiliser CDN pour fichiers statiques
# 4. Compression gzip (dans Express)
```

---

## 🔐 Sécurité

### CORS Configuration (server.js)

```javascript
// Vérifier CORS enabled
cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
})

// Pour production, restreindre:
cors({
  origin: 'https://lms.douane.ch',  // Domaine spécifique
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
})
```

### Vérifier Sécurité

```powershell
# 1. Vérifier pas d'info sensible exposée
Invoke-WebRequest http://localhost:5000/api/niveaux | ConvertFrom-Json

# 2. Tester POST sans auth (doit bloquer?)
# À implémenter: vérifier qui peut créer/modifier exercices

# 3. Vérifier fichiers sensibles inaccessibles
Invoke-WebRequest http://localhost:5000/.env -ErrorAction SilentlyContinue
# Expected: 404 Not Found
```

---

## 📋 Checklist Déploiement Quick

```powershell
# ✅ Pre-Deployment (5 min)
[ ] node --version (v16+)
[ ] npm --version (v8+)
[ ] Port 5000 libre
[ ] npm install complété
[ ] Backup créé

# ✅ Démarrage (1 min)
[ ] npm start lancé
[ ] Server répond sur 5000
[ ] Logs affichent aucune erreur

# ✅ Vérification (1 min)
[ ] GET /api/niveaux → 200 OK
[ ] 4 niveaux retournés
[ ] 5 chapitres N1 visible
[ ] 1 chapitre N2 visible

# ✅ Accès (immédiat)
[ ] http://localhost:5000 → Accès
[ ] Authoring tool → Accès
[ ] Navigation → Fonctionnelle

# ✅ Support (ongoing)
[ ] Monitoring activé
[ ] Support team prêt
[ ] Contact channels actifs
```

---

## 🆘 Support Technique

**En cas de problème:**

1. Consulter logs: `Get-Content server.log -Tail 50`
2. Vérifier checklist ci-dessus
3. Exécuter validation script: `.\VALIDATION_DEPLOIEMENT_ETAPE_4C.ps1`
4. Contactez: dev-support@lms-douane.ch

---

## 📞 Contacts DevOps

| Issue | Contact | SLA |
|-------|---------|-----|
| **Urgent Down** | +41 XX XXX XXXX | 15 min |
| **Technical** | dev-support@lms-douane.ch | 30 min |
| **Performance** | tech@lms-douane.ch | 1h |
| **General Q** | #lms-support Slack | 2h |

---

**Document pour responsables technique uniquement**

Conservez ce guide pour référence post-déploiement.

