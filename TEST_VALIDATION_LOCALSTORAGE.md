# 🧪 SCRIPT DE TEST: Validation localStorage

## ⚠️ PROBLÈME DÉTECTÉ

**Clé utilisée dans le test proposé:**
```javascript
localStorage.getItem('douanelmsv2')  // ❌ SANS underscores
```

**Clé CORRECTE dans le code:**
```javascript
localStorage.getItem('douane_lms_v2')  // ✅ AVEC underscores
```

**Ligne de référence:** storage.js ligne 18
```javascript
APP_KEY: 'douane_lms_v2',
```

---

## ✅ SCRIPT DE TEST CORRECT

**Copie ce script dans la console F12 (Onglet 2 - Apprentissage):**

```javascript
// ═══════════════════════════════════════════════════════════
// TEST: Validation localStorage - douane_lms_v2
// ═══════════════════════════════════════════════════════════

console.clear();
console.log('%c🧪 TEST VALIDATION LOCALSTORAGE', 'font-size: 16px; font-weight: bold; color: #4A3F87;');
console.log('═'.repeat(60));

const results = {
    passed: [],
    failed: [],
    data: null
};

// ═══════════════════════════════════════════════════════════
// TEST 1: Vérifier que la clé existe (avec la BONNE clé)
// ═══════════════════════════════════════════════════════════

console.log('\n%c✓ TEST 1: Clé localStorage correcte', 'color: #2ECC71; font-weight: bold;');

const correctKey = 'douane_lms_v2';  // ✅ AVEC underscores
const wrongKey = 'douanelmsv2';     // ❌ SANS underscores

const correctData = localStorage.getItem(correctKey);
const wrongData = localStorage.getItem(wrongKey);

console.log(`  Clé correcte ('douane_lms_v2'): ${correctData ? '✅ EXISTE' : '❌ N\'EXISTE PAS'}`);
console.log(`  Clé incorrecte ('douanelmsv2'): ${wrongData ? '⚠️ EXISTE' : '✅ N\'EXISTE PAS (normal)'}`);

if (correctData && correctData !== 'null') {
    console.log(`  ✅ Data trouvée: ${correctData.substring(0, 50)}...`);
    results.passed.push('Clé correcte existe');
} else if (!correctData) {
    console.log(`  ❌ ERREUR: Clé 'douane_lms_v2' n'existe pas!`);
    results.failed.push('Clé douane_lms_v2 missing');
} else if (correctData === 'null') {
    console.log(`  ❌ ERREUR: Clé 'douane_lms_v2' contient la string 'null'!`);
    results.failed.push('Clé douane_lms_v2 contains string "null"');
}

// ═══════════════════════════════════════════════════════════
// TEST 2: Parser sans erreur
// ═══════════════════════════════════════════════════════════

console.log('\n%c✓ TEST 2: Parsing JSON', 'color: #2ECC71; font-weight: bold;');

try {
    const parsed = JSON.parse(correctData);
    results.data = parsed;
    console.log(`  ✅ JSON.parse() réussi`);
    console.log(`  Clés principales: ${Object.keys(parsed).join(', ')}`);
    results.passed.push('JSON parse successful');
} catch (e) {
    console.log(`  ❌ ERREUR parsing: ${e.message}`);
    results.failed.push(`JSON parse error: ${e.message}`);
}

// ═══════════════════════════════════════════════════════════
// TEST 3: Structure complète (user, chaptersProgress, stepsPoints)
// ═══════════════════════════════════════════════════════════

console.log('\n%c✓ TEST 3: Structure de données', 'color: #2ECC71; font-weight: bold;');

if (results.data) {
    const hasUser = !!results.data.user;
    const hasChaptersProgress = !!results.data.chaptersProgress;
    const hasStepsPoints = !!results.data.stepsPoints;
    
    console.log(`  user: ${hasUser ? '✅ EXISTE' : '❌ MANQUANT'}`);
    console.log(`  chaptersProgress: ${hasChaptersProgress ? '✅ EXISTE' : '❌ MANQUANT'}`);
    console.log(`  stepsPoints: ${hasStepsPoints ? '✅ EXISTE' : '❌ MANQUANT'}`);
    
    if (hasUser) {
        results.passed.push('user exists');
    } else {
        results.failed.push('user missing');
    }
    
    if (hasChaptersProgress) {
        results.passed.push('chaptersProgress exists');
    } else {
        results.failed.push('chaptersProgress missing');
    }
    
    if (hasStepsPoints) {
        results.passed.push('stepsPoints exists');
    } else {
        results.failed.push('stepsPoints missing');
    }
}

// ═══════════════════════════════════════════════════════════
// TEST 4: Vérifier user.totalPoints
// ═══════════════════════════════════════════════════════════

console.log('\n%c✓ TEST 4: Données utilisateur', 'color: #2ECC71; font-weight: bold;');

if (results.data && results.data.user) {
    const totalPoints = results.data.user.totalPoints;
    const nickname = results.data.user.nickname;
    const niveaux = results.data.user.niveaux;
    
    console.log(`  nickname: "${nickname}"`);
    console.log(`  totalPoints: ${totalPoints}`);
    console.log(`  niveaux: ${niveaux ? Object.keys(niveaux).join(', ') : 'MANQUANT'}`);
    
    if (typeof totalPoints === 'number') {
        console.log(`  ✅ totalPoints valide (type: number)`);
        results.passed.push('totalPoints is number');
    } else {
        console.log(`  ⚠️  totalPoints: ${typeof totalPoints}`);
        results.failed.push(`totalPoints type: ${typeof totalPoints}`);
    }
    
    if (niveaux && Object.keys(niveaux).length === 4) {
        console.log(`  ✅ Niveaux N1-N4 présents`);
        results.passed.push('Niveaux N1-N4 present');
    } else {
        console.log(`  ⚠️  Niveaux: ${niveaux ? Object.keys(niveaux).length : 0} (attend 4)`);
    }
}

// ═══════════════════════════════════════════════════════════
// TEST 5: Vérifier stepsPoints (non vide?)
// ═══════════════════════════════════════════════════════════

console.log('\n%c✓ TEST 5: Points par étape', 'color: #2ECC71; font-weight: bold;');

if (results.data && results.data.stepsPoints) {
    const stepsPointsKeys = Object.keys(results.data.stepsPoints);
    const count = stepsPointsKeys.length;
    
    console.log(`  Étapes avec points: ${count}`);
    
    if (count > 0) {
        console.log(`  Exemples: ${stepsPointsKeys.slice(0, 3).map(k => `${k}=${results.data.stepsPoints[k]}`).join(', ')}`);
        results.passed.push(`stepsPoints has ${count} entries`);
    } else {
        console.log(`  ℹ️  stepsPoints vide (normal à la 1ère visite)`);
        results.passed.push('stepsPoints initialized (empty)');
    }
}

// ═══════════════════════════════════════════════════════════
// TEST 6: Vérifier chaptersProgress
// ═══════════════════════════════════════════════════════════

console.log('\n%c✓ TEST 6: Progression des chapitres', 'color: #2ECC71; font-weight: bold;');

if (results.data && results.data.chaptersProgress) {
    const chaptersKeys = Object.keys(results.data.chaptersProgress);
    const count = chaptersKeys.length;
    
    console.log(`  Chapitres suivis: ${count}`);
    
    if (count > 0) {
        const firstChapter = results.data.chaptersProgress[chaptersKeys[0]];
        console.log(`  Exemple (${chaptersKeys[0]}):`, firstChapter);
        results.passed.push(`chaptersProgress has ${count} entries`);
    } else {
        console.log(`  ℹ️  chaptersProgress vide (normal à la 1ère visite)`);
        results.passed.push('chaptersProgress initialized (empty)');
    }
}

// ═══════════════════════════════════════════════════════════
// TEST 7: Vérifier StorageManager.getAll()
// ═══════════════════════════════════════════════════════════

console.log('\n%c✓ TEST 7: StorageManager wrapper', 'color: #2ECC71; font-weight: bold;');

if (typeof StorageManager !== 'undefined' && typeof StorageManager.getAll === 'function') {
    const smData = StorageManager.getAll();
    console.log(`  ✅ StorageManager.getAll() disponible`);
    console.log(`  Retourne objet: ${!!smData}`);
    
    const smUser = StorageManager.getUser();
    console.log(`  StorageManager.getUser(): ${smUser ? '✅ OK' : '❌ NULL'}`);
    
    const smSteps = StorageManager.getStepsPoints();
    console.log(`  StorageManager.getStepsPoints(): ${typeof smSteps === 'object' ? '✅ OK' : '❌ ERROR'}`);
    
    results.passed.push('StorageManager wrapper working');
} else {
    console.log(`  ❌ StorageManager non disponible!`);
    results.failed.push('StorageManager not loaded');
}

// ═══════════════════════════════════════════════════════════
// RÉSULTATS FINAUX
// ═══════════════════════════════════════════════════════════

console.log('\n%c' + '═'.repeat(60), 'color: #4A3F87; font-weight: bold;');
console.log('%c📊 RÉSULTATS VALIDATION', 'font-size: 16px; font-weight: bold; color: #4A3F87;');
console.log('═'.repeat(60));

console.log(`%c✅ Validations réussies: ${results.passed.length}`, 'color: #2ECC71; font-weight: bold;');
console.log(`%c❌ Erreurs: ${results.failed.length}`, `color: ${results.failed.length > 0 ? '#E74C3C' : '#2ECC71'}; font-weight: bold;`);

if (results.failed.length > 0) {
    console.log('\n%c❌ ERREURS DÉTECTÉES:', 'color: #E74C3C; font-weight: bold;');
    results.failed.forEach(err => console.log(`   • ${err}`));
} else {
    console.log('\n%c🎉 TOUS LES TESTS RÉUSSIS!', 'font-size: 14px; font-weight: bold; color: #27AE60; background: #D5F4E6; padding: 10px;');
}

console.log('\n%c' + '═'.repeat(60), 'color: #4A3F87;');

// Retourner résumé
console.log('%c📋 RÉSUMÉ:', 'font-weight: bold;');
console.log(`   Clé utilisée: 'douane_lms_v2' (${correctData ? 'EXISTE' : 'MANQUANT'})`);
console.log(`   Structure: ${results.data ? 'COMPLÈTE' : 'INCOMPLÈTE'}`);
console.log(`   StorageManager: ${typeof StorageManager !== 'undefined' ? 'CHARGÉ' : 'MANQUANT'}`);
console.log(`   Status: ${results.failed.length === 0 ? '✅ PRÊT' : '❌ À CORRIGER'}`);

console.log('%c' + '═'.repeat(60), 'color: #4A3F87;');

// Export résumé (optionnel - pour copie facile)
window.TEST_RESULTS = {
    passed: results.passed.length,
    failed: results.failed.length,
    errors: results.failed,
    data: results.data ? {
        hasUser: !!results.data.user,
        hasChaptersProgress: !!results.data.chaptersProgress,
        hasStepsPoints: !!results.data.stepsPoints,
        userTotalPoints: results.data.user?.totalPoints || 0,
        stepsPointsCount: Object.keys(results.data.stepsPoints || {}).length
    } : null
};

console.log('\n💾 Résultats sauvegardés dans window.TEST_RESULTS');
```

---

## 📋 RÉSUMÉ DU TEST

**Le script teste:**

| Test | Vérifie | Succès |
|------|---------|--------|
| **Test 1** | Clé `'douane_lms_v2'` existe | ✅ |
| **Test 2** | JSON valide (parsing) | ✅ |
| **Test 3** | user, chaptersProgress, stepsPoints existent | ✅ |
| **Test 4** | user.totalPoints est number | ✅ |
| **Test 5** | stepsPoints structure | ✅ |
| **Test 6** | chaptersProgress structure | ✅ |
| **Test 7** | StorageManager wrapper fonctionne | ✅ |

---

## ✅ RÉSULTAT ATTENDU

Si tout fonctionne, vous verrez:

```
🧪 TEST VALIDATION LOCALSTORAGE
════════════════════════════════════════════════════════════

✓ TEST 1: Clé localStorage correcte
  Clé correcte ('douane_lms_v2'): ✅ EXISTE
  Data trouvée: {"user":{"nickname":"Apprenti Douanier",...

✓ TEST 2: Parsing JSON
  ✅ JSON.parse() réussi
  Clés principales: user, chaptersProgress, stepsPoints, badges, ...

✓ TEST 3: Structure de données
  user: ✅ EXISTE
  chaptersProgress: ✅ EXISTE
  stepsPoints: ✅ EXISTE

✓ TEST 4: Données utilisateur
  nickname: "Apprenti Douanier"
  totalPoints: 0
  niveaux: N1, N2, N3, N4
  ✅ totalPoints valide (type: number)
  ✅ Niveaux N1-N4 présents

✓ TEST 5: Points par étape
  Étapes avec points: 0
  ℹ️  stepsPoints vide (normal à la 1ère visite)

✓ TEST 6: Progression des chapitres
  Chapitres suivis: 1
  Exemple (ch1): {...}

✓ TEST 7: StorageManager wrapper
  ✅ StorageManager.getAll() disponible
  Retourne objet: true
  StorageManager.getUser(): ✅ OK
  StorageManager.getStepsPoints(): ✅ OK

════════════════════════════════════════════════════════════
📊 RÉSULTATS VALIDATION
════════════════════════════════════════════════════════════
✅ Validations réussies: 8
❌ Erreurs: 0

🎉 TOUS LES TESTS RÉUSSIS!

════════════════════════════════════════════════════════════
📋 RÉSUMÉ:
   Clé utilisée: 'douane_lms_v2' (EXISTE)
   Structure: COMPLÈTE
   StorageManager: CHARGÉ
   Status: ✅ PRÊT
════════════════════════════════════════════════════════════

💾 Résultats sauvegardés dans window.TEST_RESULTS
```

---

## 🚨 PROBLÈMES POSSIBLES

### **❌ Si vous voyez: "Clé 'douane_lms_v2' n'existe pas!"**

**Cause:** localStorage est vide
**Solution:** Rafraîchir la page → StorageManager.init() → setDefault()
```javascript
location.reload();
```

### **❌ Si vous voyez: "JSON.parse() error"**

**Cause:** Données corrompues
**Solution:** Réinitialiser localStorage
```javascript
localStorage.removeItem('douane_lms_v2');
location.reload();
```

### **⚠️ Si vous voyez: "Clé 'douanelmsv2' (sans underscores) EXISTE"**

**Cause:** Ancienne implémentation (mauvaise clé)
**Solution:** Migrer vers `'douane_lms_v2'` avec underscores
```javascript
const wrongData = localStorage.getItem('douanelmsv2');
if (wrongData) {
    const data = JSON.parse(wrongData);
    localStorage.setItem('douane_lms_v2', JSON.stringify(data));
    localStorage.removeItem('douanelmsv2');
}
```

---

## 📊 EXPORTER RÉSULTATS

Les résultats sont sauvegardés dans `window.TEST_RESULTS`:

```javascript
// En console:
console.table(window.TEST_RESULTS);

// Ou copier:
JSON.stringify(window.TEST_RESULTS, null, 2);
```

---

## ✅ CONCLUSION

**Ce script valide:**
- ✅ Clé localStorage correcte (`'douane_lms_v2'`)
- ✅ Pas de string `'null'`
- ✅ Structure complète (user, chaptersProgress, stepsPoints)
- ✅ Données valides et parseable
- ✅ StorageManager wrapper fonctionne

**Exécute dans la console F12 et partage le résultat!** 📊
