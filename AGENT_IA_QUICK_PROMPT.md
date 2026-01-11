# AGENT IA - QUICK PROMPT

## TASK: Corriger 2 bugs dans storage.js

### BUG 1: Ajouter "steps: {}" à 7 chapitres dans setDefault()

**Fichier:** `js/storage.js` → fonction `setDefault()`

**Action:** Ajouter `steps: {},` à chaque chapitre:
- ch1
- 101BT
- ch2
- ch3
- ch4
- ch5
- ch6

**Exemple:**
```javascript
ch1: {
  title: 'Introduction Douane',
  completion: 0,
  stepsCompleted: [],
  stepsLocked: [],
  steps: {},           // ← AJOUTER CETTE LIGNE
  badgeEarned: false
}
```

---

### BUG 2: Remplacer saveEtapeState() par version robuste

**Fichier:** `js/storage.js` → fonction `saveEtapeState`

**Action:** Remplacer ENTIÈREMENT par:

```javascript
saveEtapeState: function(chapitreId, etapeIndex, stateData) {
  if (!this.exists()) {
    this.init();
  }
  
  const data = this.get();
  
  // Initialize structure
  if (!data.chaptersProgress) data.chaptersProgress = {};
  if (!data.chaptersProgress[chapitreId]) {
    data.chaptersProgress[chapitreId] = {
      completion: 0,
      stepsCompleted: [],
      stepsLocked: [],
      steps: {},
      badgeEarned: false
    };
  }
  if (!data.chaptersProgress[chapitreId].steps) {
    data.chaptersProgress[chapitreId].steps = {};
  }
  
  // Save step state
  data.chaptersProgress[chapitreId].steps[etapeIndex] = stateData;
  
  // Update stepsCompleted
  if (stateData.completed && !data.chaptersProgress[chapitreId].stepsCompleted.includes(etapeIndex)) {
    data.chaptersProgress[chapitreId].stepsCompleted.push(etapeIndex);
  }
  
  this.set(data);
  console.log(`✅ [saveEtapeState] ${chapitreId}:${etapeIndex} saved`);
  return true;
}
```

---

## TEST

Console F12:
```javascript
// TEST 1: Vérifier que la fonction existe
console.log('✅ saveEtapeState exists:', typeof StorageManager.saveEtapeState === 'function');

// TEST 2: Tester un appel
localStorage.clear();
StorageManager.setDefault();
const result = StorageManager.saveEtapeState('ch1', 0, { completed: true });
console.log('✅ saveEtapeState result:', result);

// TEST 3: Vérifier que c'est sauvegardé
const data = JSON.parse(localStorage.getItem('douanelmsv2'));
console.log('✅ All chapters have steps:', Object.keys(data.chaptersProgress).map(ch => `${ch}: ${!!data.chaptersProgress[ch].steps}`));
console.log('✅ Step saved:', data.chaptersProgress.ch1.steps);
```

**Expected:** 
```
✅ saveEtapeState exists: true
✅ saveEtapeState result: true
✅ All chapters have steps: ch1: true, 101BT: true, ch2: true, ch3: true, ch4: true, ch5: true, ch6: true
✅ Step saved: { '0': { completed: true } }
```

---

## RESULT
✅ Bug 1: Fixed
✅ Bug 2: Fixed
🚀 PRODUCTION READY
