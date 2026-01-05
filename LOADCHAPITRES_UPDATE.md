# 📝 MISE À JOUR loadChapitres() - Structure Multi-niveaux

## ✅ MODIFICATION COMPLÉTÉE

**Fichier**: [js/app.js](js/app.js#L22)
**Date**: 5 janvier 2026
**Version**: 2.0

---

## 🔄 AVANT / APRÈS

### AVANT (Version 1.0)
```javascript
async function loadChapitres() {
    // Chargeait data.chapitres (TOUS les chapitres)
    const data = await response.json();
    return data.chapitres;  // ← Ancien format plat
}

// Appel
CHAPITRES = await loadChapitres();
```

### APRÈS (Version 2.0)
```javascript
async function loadChapitres(niveauId = 'N1') {
    // Charge chapitres du niveau spécifié
    const niveau = data.niveaux.find(n => n.id === niveauId);
    return chapitresNormalises;  // ← Nouvelle structure par niveau
}

// Appel par défaut (N1)
CHAPITRES = await loadChapitres();

// Appel spécifique (autre niveau)
CHAPITRES = await loadChapitres('N2');
```

---

## 📋 SIGNATURE NOUVELLE

```javascript
async function loadChapitres(niveauId = 'N1') {
    // niveauId: string ('N1', 'N2', 'N3', 'N4')
    // Défaut: 'N1'
    // 
    // Retourne: array de chapitres normalisés
    // - Chaque chapitre a ses étapes et exercices
    // - Format compatible avec le reste de l'app
}
```

---

## 🎯 UTILISATION

### 1. Charger niveau N1 (défaut à démarrage)
```javascript
// Au démarrage de l'app
CHAPITRES = await loadChapitres();  // Équivalent à loadChapitres('N1')
```

### 2. Charger un autre niveau
```javascript
// Quand utilisateur clique sur "N2"
CHAPITRES = await loadChapitres('N2');
window.CHAPTERS = CHAPITRES;  // Alias global
console.log(`Chapitres niveau N2: ${CHAPITRES.length}`);
```

### 3. Charger tous les niveaux (pour affichage)
```javascript
const niveaux = ['N1', 'N2', 'N3', 'N4'];
const allNiveaux = {};

for (let niveauId of niveaux) {
    allNiveaux[niveauId] = await loadChapitres(niveauId);
}

console.log('N1:', allNiveaux.N1.length);  // 7 chapitres
console.log('N2:', allNiveaux.N2.length);  // 0 (shell vide)
```

---

## 🔍 COMPORTEMENT DÉTAILLÉ

### Étapes du chargement:

1. **Fetch JSON**
   ```
   fetch('data/chapitres-N1N4.json')
   ```

2. **Extraire niveau**
   ```javascript
   const niveau = data.niveaux.find(n => n.id === niveauId);
   // Trouve l'objet: { id: 'N1', chapitres: [...], ...}
   ```

3. **Récupérer chapitres**
   ```javascript
   const chapitres = niveau.chapitres || [];
   // [ch1, 101BT, ch2, ch3, ch4, ch5, 101AY] pour N1
   // [] pour N2, N3, N4 (vides)
   ```

4. **Charger données externes**
   ```javascript
   for (let chapitre of chapitres) {
       if (chapitre.externalDataFile) {
           await loadExternalChapterData(chapitre);
       }
   }
   // Pour 101BT: charge videos/101ab/video-manifest.json
   ```

5. **Initialiser storage**
   ```javascript
   for (let chapitre of chapitres) {
       initializeChapterStorage(chapitre);
   }
   // Crée localStorage["douane_lms_v2"].user.niveaux.N1.chapters.ch1, etc.
   ```

6. **Charger exercices**
   ```javascript
   const allExercises = await exerciseLoader.loadAll();
   // Charge TOUS les exercices
   ```

7. **Valider & Normaliser**
   ```javascript
   const chapitresNormalises = exerciseNormalizer.normalizeAll(chapitres);
   // Formate pour compatibilité app
   ```

8. **Retourner**
   ```javascript
   return chapitresNormalises;
   ```

---

## ⚠️ CAS SPÉCIAUX

### N1 (Formation de base)
```javascript
CHAPITRES = await loadChapitres('N1');
// ✅ Retourne: 7 chapitres
// ✅ Status: Toujours déverrouillé
```

### N2, N3, N4 (Vides pour MVP)
```javascript
CHAPITRES = await loadChapitres('N2');
// ✅ Retourne: [] (array vide)
// ⚠️ Status: Verrouillé si N1 != 100%
```

### Niveau inexistant
```javascript
CHAPITRES = await loadChapitres('N5');
// ⚠️ Console warning: "Niveau N5 non trouvé"
// ✅ Retourne: []
// ❌ N'affiche rien dans l'UI
```

---

## 🔌 INTÉGRATION AVEC STORAGE

### Initialisation DOMContentLoaded
```javascript
// js/app.js ligne 4720
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Init storage
    StorageManager.init();
    StorageManager.initializeNiveaux();
    
    // 2. Charger N1 (par défaut)
    CHAPITRES = await loadChapitres();
    
    // 3. Charger progression
    const chaptersProgress = StorageManager.getChaptersProgress();
    CHAPITRES.forEach(chapitre => {
        if (chaptersProgress[chapitre.id]) {
            const progress = chaptersProgress[chapitre.id];
            // Synchroniser UI avec progression sauvegardée
        }
    });
});
```

### Quand utilisateur change de niveau
```javascript
// Hypothétique: Bouton "Passer à N2"
async function switchToNiveau(niveauId) {
    // 1. Vérifier déblocage
    if (!StorageManager.isNiveauUnlocked(niveauId)) {
        alert(`Niveau ${niveauId} verrouillé`);
        return;
    }
    
    // 2. Charger chapitres du niveau
    CHAPITRES = await loadChapitres(niveauId);
    
    // 3. Mettre à jour UI
    renderChapitresToDOM(CHAPITRES);
}
```

---

## 📊 STRUCTURE RETOURNÉE

### Pour N1:
```javascript
[
    {
        "id": "ch1",
        "numero": 1,
        "titre": "Introduction à la Douane",
        "description": "Découvrez les bases...",
        "couleur": "#E0AAFF",
        "emoji": "🎯",
        "progression": 0,
        "etapes": [
            {
                "id": "ch1_step1",
                "titre": "Histoire de la Douane suisse",
                "type": "exercise_group",
                ...
            },
            ...
        ],
        ...
    },
    { "id": "101BT", ... },
    { "id": "ch2", ... },
    ...
]
```

### Pour N2-N4:
```javascript
[]  // Array vide
```

---

## 🧪 TESTS (Console Navigateur)

### Test 1: Charger N1
```javascript
// F12 → Console
let ch = await loadChapitres('N1');
console.log(`N1: ${ch.length} chapitres`);
// Output: N1: 7 chapitres
```

### Test 2: Charger N2 (vide pour MVP)
```javascript
let ch = await loadChapitres('N2');
console.log(`N2: ${ch.length} chapitres`);
// Output: N2: 0 chapitres
```

### Test 3: Afficher dans CHAPITRES global
```javascript
CHAPITRES = await loadChapitres('N1');
console.table(CHAPITRES.map(c => ({ id: c.id, titre: c.titre })));
```

### Test 4: Avec niveau inexistant
```javascript
let ch = await loadChapitres('N99');
console.log(`N99: ${ch.length} chapitres`);
// Output: ⚠️ Niveau N99 non trouvé
// Output: N99: 0 chapitres
```

---

## 🚀 COMPATIBILITÉ

### ✅ Backward Compatibility
- Appel sans paramètre: `loadChapitres()` → Charge N1 (défaut)
- Code existant continue à fonctionner sans modif

### ✅ Forward Compatibility
- Préparé pour ajouter chapitres à N2-N4 plus tard
- Pas besoin de refactoriser quand N2 sera rempli

### ✅ Storage Synchronization
- Chapitres chargés initialisent le storage
- localStorage créé automatiquement pour chaque chapitre
- Progression sauvegardée par niveau (StorageManager.niveaux.N1.chapters)

---

## 📝 LOGS CONSOLE

### Au chargement initial
```
✅ Chapitres du niveau N1 chargés: 7 chapitres
📚 Chargement exercices...
✅ 36 exercices chargés
✅ Validation OK
✅ Normalisation complète
📊 Chapitres du niveau N1 normalisés: (7) [...] 
✅ CHAPITRES et CHAPTERS alias initialisés
```

### Au changement de niveau
```
✅ Chapitres du niveau N2 chargés: 0 chapitres
📚 Chargement exercices...
✅ 36 exercices chargés
✅ Validation OK
✅ Normalisation complète
📊 Chapitres du niveau N2 normalisés: (0) []
✅ CHAPITRES et CHAPTERS alias initialisés
```

---

## ✅ CHECKLIST INTÉGRATION

- ✅ Signature modifiée: `loadChapitres(niveauId = 'N1')`
- ✅ Charge `data.niveaux[niveauId].chapitres` au lieu de `data.chapitres`
- ✅ Gère niveau non trouvé (avertissement + retour [])
- ✅ Initialise storage pour chaque chapitre chargé
- ✅ Normalise et retourne chapitres
- ✅ Appel ligne 4720 utilise défaut (N1 au démarrage)
- ✅ Prêt pour UI multi-niveaux

---

## 🎯 PROCHAINES ÉTAPES

1. **Créer UI niveaux** (affiche N1-N4 avec progress bars)
2. **Implémenter bouton "Passer à niveau"** 
3. **Ajouter condition déblocage** (verifier `StorageManager.isNiveauUnlocked()`)
4. **Tester navigation complète** 
5. **Remplir N2-N4** avec chapitres réels

---

**Status**: ✅ COMPLÉTÉ - loadChapitres() adapter pour structure multi-niveaux
