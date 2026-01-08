# ⚡ DÉMARRAGE RAPIDE - 5 ÉTAPES

## 🚀 Commencer en 15 minutes

### ÉTAPE 1: Copier les Fichiers (2 min)

```bash
# Copier dans ton projet:
js/tutoring-module.js
css/tutoring-modal.html (ou comme composant)
```

### ÉTAPE 2: Inclure dans index.html (2 min)

```html
<!-- Avant </head> -->
<link rel="stylesheet" href="path/to/tutoring-modal.html-styles">

<!-- Avant </body> -->
<script src="js/tutoring-module.js"></script>
<script>
  // Initialiser
  document.addEventListener('DOMContentLoaded', () => {
    TutoringModule.init({
      webhookUrl: 'https://ton-backend.com/api/tutoring-email'
    });
  });
</script>
```

### ÉTAPE 3: Configurer le Webhook (3 min)

```javascript
// Dans tutoring-module.js, ligne ~50:
const CONFIG = {
  webhookUrl: 'https://TON_DOMAINE.com/api/tutoring-email',
  storageKey: 'tutoring',
  modalId: 'tutoring-modal'
};
```

### ÉTAPE 4: Tester Localement (5 min)

```javascript
// Dans console (F12):

// Test 1: Vérifier localStorage vide
localStorage.clear();
console.log('localStorage cleared');

// Test 2: Recharger page
window.location.reload();

// Test 3: Modale devrait apparaître ✅

// Test 4: Entrer email test@test.com
// Test 5: Cliquer "Commencer"

// Test 6: Vérifier localStorage
localStorage.getItem('tutoring');
// Devrait voir: {"viewed": true, "email": "test@test.com", ...}
```

### ÉTAPE 5: Déployer en Production (3 min)

```bash
# Commit et push
git add tutoring-module.js tutoring-modal.html
git commit -m "feat: add tutoring welcome modal"
git push origin main

# Redéployer l'app
npm run build && npm run deploy
```

---

## ✅ CHECKLIST RAPIDE (10 points)

- [ ] Fichiers copiés (`tutoring-module.js` + CSS)
- [ ] Liens HTML ajoutés dans `index.html`
- [ ] Webhook URL configurée
- [ ] localStorage vide au test
- [ ] Modale affichée au chargement
- [ ] Email validé (test@test.com)
- [ ] Clic "Commencer" ferme modale
- [ ] localStorage enregistre données
- [ ] Page rechargée → Modale cachée
- [ ] Webhook reçoit POST (check serveur)

---

## 🧪 TESTS RAPIDES

### Test 1: Première Visite

```javascript
// 1. Ouvrir DevTools (F12)
// 2. Console tab
// 3. Coller:

localStorage.clear();
location.reload();

// RÉSULTAT ATTENDU:
// - Modale s'affiche ✅
// - Pas d'erreurs console
```

### Test 2: Email Validation

```javascript
// 1. Entrer "invalid" dans input
// 2. Cliquer "Commencer"

// RÉSULTAT ATTENDU:
// - Message erreur s'affiche ✅
// - Modale reste ouverte
```

### Test 3: Données Sauvegardées

```javascript
// 1. Entrer "valide@test.com"
// 2. Cliquer "Commencer"
// 3. Console:

console.log(localStorage.getItem('tutoring'));

// RÉSULTAT ATTENDU:
// {
//   "viewed": true,
//   "email": "valide@test.com",
//   "viewedAt": "...",
//   "emailSent": true
// }
```

### Test 4: Webhook Reçu

```javascript
// 1. Entrer email et soumettre
// 2. Vérifier serveur logs:

// ATTENDU dans logs backend:
POST /api/tutoring-email
Body: {
  "email": "valide@test.com",
  "source": "lms-brevet-tutoring",
  "timestamp": "..."
}
Response: 200 OK
```

---

## ❓ FAQ RAPIDE

### Q: La modale ne s'affiche pas?
**R:** Vérifier:
1. localStorage vide? `localStorage.clear()`
2. Script chargé? Vérifier Network tab (F12)
3. Pas d'erreur JS? Vérifier Console tab
4. Modal element dans DOM? Inspecter `#tutoring-modal`

### Q: Email non envoyé au webhook?
**R:** Vérifier:
1. Webhook URL correcte dans CONFIG
2. CORS activé sur backend
3. Email validé (contient @)
4. Network tab → voir POST request

### Q: Modale reste ouverte après "Commencer"?
**R:** Vérifier:
1. Pas d'erreur email validation
2. Email format correct (regex)
3. Check `closeModal()` appelée
4. CSS z-index correct

### Q: Modale réapparaît après reload?
**R:** Vérifier:
1. localStorage persiste? Ouvrir DevTools Storage
2. `viewed = true`? Doit être présent
3. Pas de localStorage.clear() ailleurs
4. `checkTutoringViewed()` appelée au init

### Q: Email dupliqué au backend?
**R:** Vérifier:
1. Double-clic sur bouton? Ajouter `disabled`
2. Retry logic? Vérifier `sendEmail()` 
3. Rate limiting? Backend peut refuser doublons

---

## 🚨 DÉPANNAGE RAPIDE

| Problème | Cause | Solution |
|----------|-------|----------|
| Modale invisible | CSS non chargé | Vérifier `<link>` HTML |
| Texte flou | Font pas chargée | Ajouter @import Google Fonts |
| Bouton ne répond pas | JS pas chargé | Vérifier `<script>` HTML |
| Email pas envoyé | URL webhook fausse | Tester curl POST |
| localStorage vide | XSS ou incognito | Vérifier localStorage enabled |

---

## 📊 MÉTRIQUES À SUIVRE

```
1. Modal View Rate
   = (users seeing modal) / (total users)
   Target: >90%

2. Email Capture Rate
   = (emails entered) / (modal views)
   Target: >30%

3. Conversion Rate
   = (form submitted) / (modal views)
   Target: >70%

4. Bounce Rate
   = (closed without interaction) / (modal views)
   Target: <15%
```

---

## 💾 CONFIG PAR ENVIRONNEMENT

### Développement

```javascript
const CONFIG = {
  webhookUrl: 'http://localhost:3000/api/tutoring-email',
  debug: true // Logs supplémentaires
};
```

### Staging

```javascript
const CONFIG = {
  webhookUrl: 'https://staging-api.example.com/api/tutoring-email',
  debug: false
};
```

### Production

```javascript
const CONFIG = {
  webhookUrl: 'https://api.example.com/api/tutoring-email',
  debug: false
};
```

---

## 🎯 PROCHAINES ÉTAPES

✅ Intégration complète? 
→ Lire [GUIDE_INTEGRATION_TUTORING.md](GUIDE_INTEGRATION_TUTORING.md) pour tests avancés

❌ Problèmes d'intégration?
→ Lire [GUIDE_INTEGRATION_TUTORING.md](GUIDE_INTEGRATION_TUTORING.md) section Dépannage

❓ Questions sur l'architecture?
→ Lire [SOLUTION_TUTORING_RETENUE.md](SOLUTION_TUTORING_RETENUE.md)

---

**Temps total estimé:** 15-20 min  
**Difficulté:** ⭐ Facile  
**Support:** [GUIDE_INTEGRATION_TUTORING.md](GUIDE_INTEGRATION_TUTORING.md)

Dernière mise à jour: 7 Janvier 2026
