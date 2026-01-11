# 🚀 GUIDE RAPIDE - TESTS F12

## ⚡ EN 30 SECONDES

### Étape 1: Copie ce script en console F12

```javascript
// Ouvre F12 → Console tab → Copie-colle ce script entièrement
fetch('TEST_SCRIPT_F12.js').then(r => r.text()).then(t => eval(t));
```

**OU** copie-colle directement le contenu de [TEST_SCRIPT_F12.js](TEST_SCRIPT_F12.js)

### Étape 2: Vérifies que tout est ✅

Tu dois voir:
```
✅ completerEtapeConsultation: function
✅ validateStepWithThreshold: function
✅ submitValidationExercise: function
✅ validerExercice: function
✅ calculateQCMScore: function
```

Si tu vois `undefined` → **ARRÊTE** et signale-moi! ❌

### Étape 3: Teste manuellement

Le script te donne les instructions. Suis-les ligne par ligne en console.

---

## 📝 CHECKLIST MINIMALE

- [ ] **TEST 1:** Ouvre vidéo → Clique "✅ Marquer comme complété" → Vérifies `completed: true`
- [ ] **TEST 2:** Ouvre QCM → Réponds correct → Soumet → Vérifies "✅ RÉUSSI!" + points gagnés
- [ ] **TEST 3:** Ouvre autre QCM → Réponds mal → Vérifies "❌ Tentatives restantes: 2/3"
- [ ] **TEST 4:** Même étape 3 fois mal → Vérifies "Tentatives épuisées"
- [ ] **TEST 5:** `verifyChapter('ch1')` → Vérifies completion % et progression

---

## 🎯 RÉSULTATS À ENVOYER

Après tests, envoie-moi:

```
TEST 1 CONSULTATION:       [✅] OU [❌]
TEST 2 VALIDATION 100%:    [✅] OU [❌]
TEST 3 VALIDATION REJEU:   [✅] OU [❌]
TEST 4 TENTATIVES 3x:      [✅] OU [❌]
TEST 5 INTÉGRITÉ CHAPITRE: [✅] OU [❌]
```

Si erreur: **copie-colle les logs F12** + **screenshot**

---

## 🆘 TROUBLESHOOTING

### "Undefined function"
→ Rafraîchis la page (F5)
→ Vérifies que js/app.js se charge (onglet Network de F12)
→ Réessaye le script

### "Score incorrect"
→ Vérifies `calculateQCMScore()` existe et fonctionne
→ Fais un test manuel: `calculateQCMScore(CHAPITRES[0].etapes[1], 'ch1', 1)`

### "Étape verrouillée"
→ Vérifies que `unlockNextStep()` a été appelée
→ Vérifies `StorageManager.getEtapeState()` retourne `completed: true`

---

## 📂 FICHIERS ASSOCIÉS

- [TESTS_CONSOLE_F12.md](TESTS_CONSOLE_F12.md) - Documentation complète
- [TEST_SCRIPT_F12.js](TEST_SCRIPT_F12.js) - Script prêt-à-coller
- [js/app.js](js/app.js) - Fonctions testées:
  - `completerEtapeConsultation()` ligne 1706
  - `validateStepWithThreshold()` ligne 1904
  - `submitValidationExercise()` ligne 2044
  - `validerExercice()` ligne 2101

---

**Prêt?** 🎬 Ouvre F12, copie le script et dis-moi tes résultats! ✅
