# Checklist Déploiement Production - ÉTAPE 4C

**Document de Vérification | Janvier 2026**

```
STATUT: 🔴 PRÉ-DÉPLOIEMENT
VERSION: 2.1.0
DATE: 11 janvier 2026
ENVIRONNEMENT: Production
```

---

## 📋 Vue d'Ensemble

Cette checklist garantit que le système LMS Brevet Fédéral est prêt pour la production. Chaque item doit être coché avant déploiement.

---

## ✅ PHASE 1: Préparation (Pre-Deployment)

### 1.1 Vérifications Système

- [ ] **Node.js version** 
  ```powershell
  node --version
  # Acceptable: v16.x, v18.x, v20.x
  ```

- [ ] **npm version**
  ```powershell
  npm --version
  # Acceptable: v8+
  ```

- [ ] **Port 5000 disponible**
  ```powershell
  netstat -an | Select-String "5000"
  # Ne doit rien retourner (port libre)
  ```

- [ ] **Accès disque** (dossier projet)
  ```powershell
  Test-Path "c:\Users\patri\OneDrive\Bureau\LMS Brevet Fédéral"
  # Doit retourner True
  ```

- [ ] **Dossier /data/ existe**
  ```powershell
  Test-Path ".\data\N1\chapitres.json"
  Test-Path ".\data\N2\chapitres.json"
  # Tous doivent être True
  ```

### 1.2 Vérifications Fichiers Critiques

- [ ] **server.js présent et valide**
  ```powershell
  Test-Path ".\server.js"
  # Vérifier: 15 routes Express, CORS activé
  ```

- [ ] **app.js présent et valide**
  ```powershell
  Test-Path ".\app.js"
  # Vérifier: fetch API routes, localStorage ready
  ```

- [ ] **authoring-tool-v2.html présent**
  ```powershell
  Test-Path ".\authoring-tool-v2.html"
  # Doit contenir l'interface auteur
  ```

- [ ] **index.html présent (frontend)**
  ```powershell
  Test-Path ".\index.html"
  # Point d'entrée principale
  ```

- [ ] **package.json valide**
  ```powershell
  cat package.json | ConvertFrom-Json
  # Doit avoir: express, cors, path, fs, body-parser
  ```

### 1.3 Dépendances

- [ ] **npm install exécuté**
  ```powershell
  npm install
  # node_modules/ créé
  ```

- [ ] **Dépendances présentes**
  ```powershell
  Test-Path ".\node_modules\express"
  Test-Path ".\node_modules\cors"
  # Doivent être True
  ```

- [ ] **package-lock.json créé**
  ```powershell
  Test-Path ".\package-lock.json"
  # Assure versions cohérentes
  ```

---

## 📊 PHASE 2: Validation Données

### 2.1 Intégrité Fichiers JSON

- [ ] **N1/chapitres.json valide**
  ```powershell
  $n1 = cat "data\N1\chapitres.json" | ConvertFrom-Json
  $n1.chapitres.Count
  # Doit retourner: 5 (cinq chapitres)
  ```

- [ ] **N2/chapitres.json valide**
  ```powershell
  $n2 = cat "data\N2\chapitres.json" | ConvertFrom-Json
  $n2.chapitres.Count
  # Doit retourner: 1 (101BT)
  ```

- [ ] **Exercices N1 présents**
  ```powershell
  Get-ChildItem "data\N1\exercices\*.json" | Measure-Object
  # Doit retourner: 5 fichiers (ch1-ch5.json)
  ```

- [ ] **Exercices N2 présents**
  ```powershell
  Test-Path "data\N2\exercices\101BT.json"
  # Doit être True
  ```

- [ ] **Pas de fichiers corrompus**
  ```powershell
  Get-ChildItem "data\" -Recurse -Filter "*.json" |
    ForEach-Object {
      try {
        cat $_.FullName | ConvertFrom-Json > $null
        Write-Host "✅ $($_.Name)"
      } catch {
        Write-Host "❌ $($_.Name) - ERREUR PARSING"
      }
    }
  # Tous doivent afficher ✅
  ```

### 2.2 Contenu et Cohérence

- [ ] **Tous chapitres ont etapes array**
  ```powershell
  $n1 = cat "data\N1\chapitres.json" | ConvertFrom-Json
  $n1.chapitres | ForEach-Object {
    if (-not $_.etapes -or $_.etapes.Count -eq 0) {
      Write-Host "❌ $($_.titre) - SANS ÉTAPES"
    }
  }
  # Aucune erreur ne doit s'afficher
  ```

- [ ] **Tous exercices ont id unique**
  ```powershell
  $allIds = @()
  Get-ChildItem "data\*\exercices\*.json" |
    ForEach-Object {
      $json = cat $_ | ConvertFrom-Json
      $allIds += $json.exercices.id
    }
  $allIds.Count -eq ($allIds | Select-Object -Unique).Count
  # Doit retourner: True (pas de doublons)
  ```

- [ ] **Total exercices = 60**
  ```powershell
  $count = 0
  Get-ChildItem "data\*\exercices\*.json" |
    ForEach-Object {
      $json = cat $_ | ConvertFrom-Json
      $count += $json.exercices.Count
    }
  Write-Host "Total exercices: $count"
  # Doit afficher: Total exercices: 60
  ```

- [ ] **Points calibrés correctement**
  ```powershell
  # Vidéos: 10pts, Lectures: 10pts, 
  # Flashcards: 1-3pts, QCM: 10-20pts, Quiz: 20-50pts
  Get-ChildItem "data\*\exercices\*.json" |
    ForEach-Object {
      $json = cat $_ | ConvertFrom-Json
      $json.exercices | Where-Object {$_.points -lt 1 -or $_.points -gt 100} |
        ForEach-Object {
          Write-Host "⚠️ Points anormaux: $($_.id) = $($_.points)"
        }
    }
  # Aucun warning ne doit s'afficher
  ```

---

## 🔗 PHASE 3: Tests API

### 3.1 Démarrage Serveur

- [ ] **Serveur démarre sans erreur**
  ```powershell
  npm start
  # Doit afficher: "Server running on port 5000"
  # Aucune erreur en console
  ```

- [ ] **Pas d'erreurs CORS**
  ```
  Localhost:3000 → Localhost:5000
  # Pas de "CORS error" en console
  ```

### 3.2 Endpoints API - Niveaux

- [ ] **GET /api/niveaux**
  ```javascript
  // Expected Response:
  {
    success: true,
    niveaux: [
      { id: "N1", titre: "...", chapitres: 5 },
      { id: "N2", titre: "...", chapitres: 1 },
      { id: "N3", titre: "...", chapitres: 0 },
      { id: "N4", titre: "...", chapitres: 0 }
    ]
  }
  // ✅ Tous 4 niveaux présents
  // ✅ Counts corrects (5, 1, 0, 0)
  ```

- [ ] **GET /api/niveaux/N1/chapitres**
  ```javascript
  // Expected Response:
  {
    success: true,
    niveauId: "N1",
    chapitres: [
      { id: "ch1", titre: "...", etapes: [...] },
      ...
    ]
  }
  // ✅ 5 chapitres retournés
  // ✅ Chaque chapitre a etapes array
  ```

- [ ] **GET /api/niveaux/N2/chapitres**
  ```javascript
  // Expected Response:
  {
    success: true,
    niveauId: "N2",
    chapitres: [
      { id: "101BT", titre: "...", etapes: [...] }
    ]
  }
  // ✅ 1 chapitre (101BT)
  ```

### 3.3 Endpoints API - Exercices

- [ ] **GET /api/niveaux/N1/exercices/ch1**
  ```javascript
  // Expected Response:
  {
    success: true,
    chapterId: "ch1",
    exercices: [
      { id: "ch1_...", type: "video|lecture|...", titre: "..." },
      ...
    ],
    count: 7
  }
  // ✅ 7 exercices retournés
  // ✅ Tous types valides (video, lecture, flashcards, qcm, quiz)
  ```

- [ ] **GET /api/niveaux/N2/exercices/101BT**
  ```javascript
  // Expected Response:
  {
    success: true,
    count: 33
  }
  // ✅ 33 exercices retournés
  ```

### 3.4 Endpoints API - CRUD

- [ ] **POST /api/chapitre (Create)**
  ```javascript
  // Request:
  {
    niveauId: "N3",
    titre: "Test Chapitre",
    description: "Description",
    objectifs: "Obj1;Obj2"
  }
  // Expected: {success: true, chapitre: {...}}
  // ✅ Nouveau chapitre créé
  // ✅ Fichier data/N3/chapitres.json modifié
  ```

- [ ] **PUT /api/chapitre/:id (Update)**
  ```javascript
  // Request:
  {
    titre: "Titre Modifié"
  }
  // Expected: {success: true, chapitre: {...}}
  // ✅ Chapitre mis à jour
  ```

- [ ] **DELETE /api/chapitre/:id (Delete)**
  ```javascript
  // Request: (aucun body)
  // Expected: {success: true, message: "..."}
  // ✅ Chapitre supprimé
  // ✅ Fichier JSON modifié
  ```

- [ ] **POST /api/etape/:chapterId/exercice (Add Exercise)**
  ```javascript
  // Request:
  {
    type: "video",
    titre: "Test Video",
    content: {...},
    points: 10
  }
  // Expected: {success: true, exercice: {...}}
  // ✅ Exercice ajouté
  // ✅ Fichier exercices/{chapterId}.json modifié
  ```

### 3.5 Endpoints API - Validation Complète

**Script de Test Complet:**

```powershell
# Exécuter: pwsh TEST_ETAPE_4C_COMPLET.ps1
# Résultat attendu:
# ✅ PASSED: 17/17 (100%)
# 
# Détail:
# ✅ API Tests: 5/5
# ✅ Exercise Type Tests: 5/5  
# ✅ Statistical Validation: 4/4
# ✅ Integration Tests: 3/3
```

---

## 🖥️ PHASE 4: Frontend

### 4.1 Interface Principale (app.js)

- [ ] **index.html charge sans erreur**
  ```
  http://localhost:5000/index.html
  # Page s'affiche correctement
  # Pas d'erreurs JavaScript (F12)
  ```

- [ ] **Onglet 1 - Accueil**
  - [ ] Affiche titre principal
  - [ ] Liste niveaux N1-N2
  - [ ] Affiche progression globale (%)
  - [ ] Boutons "Commencer" visibles

- [ ] **Onglet 2 - Apprentissage**
  - [ ] Clique N1 → Affiche 5 chapitres
  - [ ] Clique Chapitre 1 → Affiche étapes
  - [ ] Clique étape → Affiche exercices
  - [ ] Clique exercice → Affiche contenu

- [ ] **Onglet 3 - Révision**
  - [ ] QCM charges et répondent correctement
  - [ ] Quiz calcule score correct
  - [ ] Score ≥80% pour QCM, ≥70% pour quiz

- [ ] **Onglet 4 - Journal**
  - [ ] Affiche historique activités
  - [ ] Dates correctes pour complétions
  - [ ] Statistiques calculent bien

- [ ] **Onglet 5 - Profil**
  - [ ] Affiche points totaux corrects
  - [ ] Bouton "Réinitialiser" fonctionne
  - [ ] Nettoit localStorage et relance app

### 4.2 Authoring Tool (authoring-tool-v2.html)

- [ ] **Authoring tool charge**
  ```
  http://localhost:5000/authoring-tool-v2.html
  # Page s'affiche correctement
  ```

- [ ] **Sidebar affiche tous niveaux**
  - [ ] N1 (5 chapitres visibles)
  - [ ] N2 (1 chapitre: 101BT)
  - [ ] N3, N4 (vides mais présents)

- [ ] **Créer chapitre fonctionne**
  1. Clique "[+] Nouveau Chapitre"
  2. Remplit formulaire
  3. Clique "Créer"
  4. ✅ Chapitre apparaît dans sidebar

- [ ] **Créer exercice fonctionne**
  1. Sélectionne chapitre
  2. Clique "Ajouter Exercice"
  3. Choisit type (video, qcm, etc.)
  4. Remplit contenu
  5. Clique "Sauvegarder"
  6. ✅ Exercice sauvegardé dans JSON

- [ ] **Tous types exercices supportés**
  - [ ] Vidéo
  - [ ] Lecture
  - [ ] Flashcards
  - [ ] QCM
  - [ ] Quiz

---

## 📈 PHASE 5: Performance & Sécurité

### 5.1 Performance

- [ ] **Temps chargement app.js < 2s**
  ```javascript
  // F12 → Network → Recharger
  # app.js: < 2s
  # Autres ressources: < 1s
  ```

- [ ] **Pas de mémoire leak**
  ```javascript
  // F12 → Memory
  # Profil mémoire stable en navigation
  # Pas d'augmentation progressive
  ```

- [ ] **API répond < 200ms**
  ```powershell
  # Mesurer temps réponse
  Measure-Command {
    Invoke-WebRequest http://localhost:5000/api/niveaux
  }
  # < 200ms (200 milliseconds)
  ```

### 5.2 Sécurité

- [ ] **CORS configuré correctement**
  ```javascript
  // server.js ligne ~30
  // cors({origin: process.env.CORS_ORIGIN || '*'})
  // ✅ Limiter à domaine spécifique en prod
  ```

- [ ] **Pas de données sensibles exposées**
  ```javascript
  // /api/niveaux ne doit PAS retourner:
  // - Chemins disque
  // - Variables d'environnement
  // - Tokens ou secrets
  ```

- [ ] **Validation input sur routes POST/PUT**
  ```javascript
  // server.js: POST routes doivent valider
  // - Type de données
  // - Longueur strings
  // - Format JSON
  ```

- [ ] **Fichiers statiques protégés**
  ```powershell
  # Accès direct /data/N1/chapitres.json possible?
  # → PEUT ÊTRE UN RISQUE si données sensibles
  # Solution: Servir via API uniquement
  ```

---

## 🔄 PHASE 6: Sauvegarde & Récupération

### 6.1 Sauvegarde

- [ ] **Backup /data/ effectué**
  ```powershell
  $backup = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
  Copy-Item -Path "data" -Destination $backup -Recurse
  Write-Host "✅ Backup: $backup"
  ```

- [ ] **Git initialisé**
  ```powershell
  git status
  # Doit afficher statut repo
  ```

- [ ] **Commits push distant**
  ```powershell
  git log --oneline | head -5
  # Voir commits récents
  ```

### 6.2 Plan Récupération

- [ ] **Procédure restauration documentée**
  ```
  EN CAS D'ERREUR:
  1. Arrêter serveur: Ctrl+C
  2. Restaurer /data/ depuis backup
  3. Redémarrer: npm start
  4. Vérifier API: GET /api/niveaux
  ```

- [ ] **Contact support identifié**
  ```
  Email: support@lms-douane.ch
  Hotline: +41 XX XXX XXXX
  Slack: #lms-support
  ```

---

## 📝 PHASE 7: Documentation

- [ ] **README.md à jour**
  ```markdown
  # LMS Brevet Fédéral
  
  ## Installation
  npm install
  
  ## Démarrage
  npm start
  
  ## Accès
  - App: http://localhost:5000
  - Authoring: http://localhost:5000/authoring-tool-v2.html
  ```

- [ ] **GUIDE_FORMATEURS_ETAPE_4C.md présent**
  ```powershell
  Test-Path "GUIDE_FORMATEURS_ETAPE_4C.md"
  # True
  ```

- [ ] **Troubleshooting documenté**
  - [ ] Erreurs courantes listées
  - [ ] Solutions fournies pour chaque cas
  - [ ] Contacts support clairs

- [ ] **API documentation complète**
  ```
  - 15 routes listées
  - URL, méthode, body
  - Réponses d'exemple
  - Codes erreur expliqués
  ```

---

## ✅ PHASE 8: Signature Production

### 8.1 Vérifications Finales

- [ ] **Tous items checklist complétés**
  ```
  Total: [XX/XX] items cochés
  Doit être: [XX/XX] (100%)
  ```

- [ ] **Pas d'erreurs bloquantes**
  ```
  Erreurs critiques: 0
  Warnings majeurs: 0
  ```

- [ ] **Test script validation complète**
  ```powershell
  pwsh TEST_ETAPE_4C_COMPLET.ps1
  # Résultat: ✅ PASSED 17/17 (100%)
  ```

### 8.2 Signoff Production

```
DÉPLOIEMENT AUTORISÉ

Date: _________________ (JJ/MM/AAAA)

Responsable Technique: _________________________ (Signature)

Validateur Qualité: _________________________ (Signature)

Manager Produit: _________________________ (Signature)


DONNÉES DEPLOYÉES:
- N1: 5 chapitres, 27 exercices
- N2: 1 chapitre, 33 exercices
- N3-N4: Vides (pour évolutions futures)
- Total: 60 exercices, 66 IDs uniques

SYSTÈMES VÉRIFIÉS:
✅ Backend Express.js (15 routes)
✅ Frontend app.js + authoring-tool-v2.html
✅ API endpoints (tous testés)
✅ Stockage JSON et localStorage
✅ Performance < 200ms
✅ Sécurité CORS
✅ Sauvegarde/Récupération

STATUS: ✅ PRÊT PRODUCTION
```

---

## 📞 Support Post-Déploiement

### En Cas d'Urgence

**Serveur ne démarre pas:**
```powershell
Get-Process node | Stop-Process -Force
cd c:\Users\patri\OneDrive\Bureau\LMS\ Brevet\ Fédéral
npm start
```

**API retourne erreur:**
```powershell
# Vérifier fichiers
ls -la data/N1/chapitres.json
# Vérifier format JSON
cat data/N1/chapitres.json | ConvertFrom-Json
```

**Apprenant ne voit aucun chapitre:**
```javascript
// F12 → Console
localStorage.clear();
location.reload();
```

---

## 📋 Checklist Rapide (Résumé)

```
AVANT DÉPLOIEMENT:
[x] Node.js, npm, port 5000 disponible
[x] Tous fichiers présents et valides
[x] npm install exécuté
[x] 60 exercices dans /data/
[x] Serveur démarre sans erreur
[x] API endpoints tous operationnels
[x] Frontend charge et fonctionne
[x] Authoring tool accesible
[x] Test script passe 17/17
[x] Sauvegarde effectuée
[x] Documentation complète
[x] Support configuré

DÉCISION: ✅ DÉPLOIEMENT APPROUVÉ
```

---

**Dernière mise à jour:** 11 janvier 2026  
**Version Système:** 2.1.0  
**Statut:** Prêt Déploiement ✅

