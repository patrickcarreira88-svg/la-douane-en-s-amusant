# 🔧 GUIDE D'INTÉGRATION - PAS À PAS

## 📋 Vue d'Ensemble

**Durée totale:** 45-60 min  
**Difficulté:** Facile  
**Prérequis:** Accès code source + serveur API

---

## ✅ ÉTAPE 1: Préparation (5 min)

### 1.1 Vérifier Prérequis

```javascript
// F12 Console - Vérifier app est chargée
typeof App !== 'undefined'  // → true
CHAPITRES !== undefined      // → true
StorageManager !== undefined // → true
```

### 1.2 Créer Endpoint Backend

```javascript
// Backend: Create POST /api/tutoring-email endpoint
// Should accept:
{
  "email": "user@example.com",
  "source": "lms-brevet-tutoring",
  "timestamp": "2026-01-07T...",
  "userData": {...}
}

// Should return 200 OK:
{
  "success": true,
  "message": "Email reçu"
}
```

### 1.3 Configurer CORS

```javascript
// Backend CORS headers
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type
```

---

## 📥 ÉTAPE 2: Intégration des Fichiers (10 min)

### 2.1 Copier JavaScript

```bash
# Copier tutoring-module.js
cp tutoring-module.js ~/my-lms/js/tutoring-module.js

# Ou: Download + paste directement
```

### 2.2 Ajouter CSS

**Option A:** CSS inline dans HTML

```html
<!-- Avant </head> -->
<style>
/* Copy from tutoring-modal.html CSS section */
.tutoring-modal { ... }
.tutoring-content { ... }
.tutoring-btn { ... }
...
</style>
```

**Option B:** CSS externe

```html
<!-- Avant </head> -->
<link rel="stylesheet" href="css/tutoring-modal.css">
```

### 2.3 Ajouter HTML Modale

```html
<!-- Après </body> (avant dernière) -->
<!-- TUTORING MODAL TEMPLATE -->
<div id="tutoring-modal" class="tutoring-modal" style="display: none;">
  <div class="tutoring-overlay"></div>
  <div class="tutoring-content">
    <!-- Copy from tutoring-modal.html -->
  </div>
</div>
```

### 2.4 Inclure JavaScript

```html
<!-- Avant </body> (dernier) -->
<script src="js/tutoring-module.js"></script>
```

---

## ⚙️ ÉTAPE 3: Configuration (5 min)

### 3.1 Configurer Webhook URL

**Éditer: `js/tutoring-module.js` ligne ~50**

```javascript
const CONFIG = {
  // ✏️ REMPLACER PAR TON URL:
  webhookUrl: 'https://api.example.com/api/tutoring-email',
  
  storageKey: 'tutoring',
  modalId: 'tutoring-modal',
  debug: true  // Set to false in production
}
```

### 3.2 Vérifier Endpoints

```bash
# Tester webhook avec curl
curl -X POST https://api.example.com/api/tutoring-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "source": "lms-brevet-tutoring",
    "timestamp": "2026-01-07T00:00:00Z",
    "userData": {"nickname": "test"}
  }'

# Expected response:
# {"success": true, "message": "Email reçu"}
```

### 3.3 Configurer Variables d'Environnement (optionnel)

```javascript
// Alternative: Read from env
const CONFIG = {
  webhookUrl: process.env.VITE_WEBHOOK_URL || 
              'https://api.example.com/api/tutoring-email',
  debug: process.env.NODE_ENV === 'development'
}
```

---

## 🚀 ÉTAPE 4: Initialisation (10 min)

### 4.1 Initialiser Module

**Option A:** Auto-init (recommended)

```html
<script>
  // Initialiser après que DOM soit prêt
  document.addEventListener('DOMContentLoaded', () => {
    TutoringModule.init({
      webhookUrl: 'https://api.example.com/api/tutoring-email'
    })
  })
</script>
```

**Option B:** Manual init

```javascript
// Quand tu veux:
TutoringModule.init({
  webhookUrl: 'https://api.example.com/api/tutoring-email'
})
```

### 4.2 Vérifier dans Console

```javascript
// F12 Console
typeof TutoringModule !== 'undefined'  // → true
TutoringModule.config                   // → affiche config
```

---

## 🧪 ÉTAPE 5: Testing Complet (20 min)

### Test 1: Première Visite

```javascript
// Étape 1: Effacer localStorage
localStorage.clear()

// Étape 2: Recharger
location.reload()

// RÉSULTAT ATTENDU:
// ✅ Modale affichée avec "Bienvenue"
// ✅ Email input vide
// ✅ Boutons "Commencer" et "Fermer"
// ✅ Console clean (pas d'erreurs)
```

### Test 2: Email Validation

```javascript
// Étape 1: Entrer "invalid" (pas d'@)
// Étape 2: Cliquer "Commencer"

// RÉSULTAT ATTENDU:
// ❌ Message "Format email invalide"
// ✅ Modale reste ouverte
// ✅ Focus sur input

// Étape 3: Entrer "valid@example.com"
// Étape 4: Cliquer "Commencer"

// RÉSULTAT ATTENDU:
// ✅ Pas d'erreur
// ✅ Modale se ferme (300ms)
```

### Test 3: Webhook Request

```javascript
// Étape 1: Entrer "test@example.com"
// Étape 2: Cliquer "Commencer"
// Étape 3: Vérifier F12 Network tab

// RÉSULTAT ATTENDU:
// ✅ POST request vers webhook URL
// ✅ Status 200
// ✅ Body contient email + source + timestamp
// ✅ Response {"success": true}
```

### Test 4: localStorage Persistence

```javascript
// Après Test 3, dans Console:
console.log(localStorage.getItem('tutoring'))

// RÉSULTAT ATTENDU:
// {
//   "viewed": true,
//   "email": "test@example.com",
//   "emailSent": true,
//   "viewedAt": "2026-01-07T..."
// }
```

### Test 5: Revisites

```javascript
// Étape 1: Recharger page (F5)
// Étape 2: localStorage["tutoring"].viewed = true

// RÉSULTAT ATTENDU:
// ✅ Modale N'EST PAS affichée
// ✅ App chargée normalement
// ✅ Accès app sans interruption
```

### Test 6: Responsive Mobile

```javascript
// Étape 1: F12 → Toggle device toolbar (Ctrl+Shift+M)
// Étape 2: localStorage.clear() + reload
// Étape 3: Tester modale sur mobile

// RÉSULTAT ATTENDU:
// ✅ Modale visible sur petit écran
// ✅ Input 100% width
// ✅ Boutons empilés
// ✅ Pas de scroll horizontal
// ✅ Touch-friendly (tap cibles > 44px)
```

### Test 7: Erreur Webhook

```javascript
// Simule endpoint down:
// 1. Modifier webhook URL vers URL invalide
// 2. Entrer email + soumettre
// 3. Vérifier console

// RÉSULTAT ATTENDU:
// ⚠️ Erreur webhook loggée en console
// ✅ Modale se ferme quand même (graceful)
// ✅ localStorage.setItem() appelé
// ✅ App continue normalement
```

---

## 🐛 DÉPANNAGE

### Problème 1: Modale N'apparaît pas

**Causes possibles:**
1. localStorage["tutoring"].viewed = true
2. CSS `display: none` pas overridé
3. z-index trop bas
4. JavaScript non chargé

**Solution:**
```javascript
// Test 1: localStorage vide
localStorage.clear()
location.reload()

// Test 2: CSS chargé
document.querySelector('#tutoring-modal')  // → should exist
getComputedStyle(document.querySelector('#tutoring-modal')).display
// → should be 'flex' when visible

// Test 3: JS chargé
typeof TutoringModule !== 'undefined'  // → true

// Test 4: Initialisation
TutoringModule.init()  // Force init
```

### Problème 2: Email Ne S'Envoie Pas

**Causes possibles:**
1. Webhook URL incorrecte
2. CORS bloqué
3. Email invalide
4. Serveur down

**Solution:**
```javascript
// Test webhook URL
const CONFIG = {
  webhookUrl: 'https://...'  // Verify URL is correct
}

// Test CORS
fetch(CONFIG.webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com' })
})
// Check Network tab pour CORS erreurs

// Test email
const email = 'test@example.com'
const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
console.log(isValid)  // → true
```

### Problème 3: Modale Réapparaît Chaque Fois

**Cause:** localStorage pas lu correctement

```javascript
// Debug localStorage
console.log('Storage:', localStorage.getItem('tutoring'))
console.log('Viewed:', localStorage.getItem('tutoring')?.viewed)

// Fix: Redémarrer navigateur + clear cache
// Ctrl+Shift+Delete → Clear browsing data
```

---

## 📊 Checklist Finale

- [ ] Webhook endpoint créé + testé
- [ ] CORS configuré
- [ ] tutoring-module.js copié
- [ ] CSS inclus
- [ ] HTML modale ajouté
- [ ] Webhook URL configurée
- [ ] Test 1: Première visite ✅
- [ ] Test 2: Email validation ✅
- [ ] Test 3: Webhook POST ✅
- [ ] Test 4: localStorage ✅
- [ ] Test 5: Revisites ✅
- [ ] Test 6: Responsive ✅
- [ ] Test 7: Error handling ✅
- [ ] Monitoring mis en place
- [ ] Logs configurés
- [ ] Documentation équipe

---

## 🚀 Déploiement Production

### Pre-Deploy

```bash
# 1. Code review
git diff origin/main

# 2. Tests
npm test
npm run lint

# 3. Build
npm run build

# 4. Staging test
npm run deploy:staging
```

### Deploy

```bash
# 1. Merge PR
git merge --squash feature/tutoring

# 2. Tag version
git tag -a v1.x.x

# 3. Deploy
npm run deploy:prod

# 4. Verify
curl https://app.example.com
# → Vérifier modale présente
```

### Post-Deploy

```bash
# 1. Monitor logs
tail -f logs/app.log | grep tutoring

# 2. Check metrics
# → Dashboard: Email capture rate, errors

# 3. Alert team
# → Slack: "Tutoring module deployed ✅"
```

---

## 📞 Support

**Questions?**
- Docs: [SOLUTION_TUTORING_RETENUE.md](SOLUTION_TUTORING_RETENUE.md)
- Code: [tutoring-module.js](tutoring-module.js)
- HTML: [tutoring-modal.html](tutoring-modal.html)

**Erreurs?**
- Console F12 pour logs détaillés
- Network tab pour requêtes HTTP
- localStorage pour données

---

**Date:** 7 Janvier 2026  
**Version:** 1.0  
**Status:** Ready for Production
