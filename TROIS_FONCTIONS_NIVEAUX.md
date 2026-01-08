# 🎯 TROIS FONCTIONS DE GESTION DES NIVEAUX - IMPLÉMENTATION COMPLÈTE

## 📋 Résumé

Trois fonctions ont été créées dans `js/app.js` (objet `App`) pour gérer l'affichage et la navigation des niveaux (N1, N2, N3, N4).

---

## 🎯 FONCTION 1: `App.isNiveauUnlocked(niveauId)`

### Description
Vérifie si un niveau est déverrouillé selon le système de progression progressive.

### Signature
```javascript
isNiveauUnlocked(niveauId) -> boolean
```

### Logique
```
N1 = toujours true (premier niveau)
N2 = true si App.calculateNiveauCompletion('N1') === 100%
N3 = true si App.calculateNiveauCompletion('N2') === 100%
N4 = true si App.calculateNiveauCompletion('N3') === 100%
```

### Code (~18 lignes)
```javascript
isNiveauUnlocked(niveauId) {
    if (niveauId === 'N1') return true;
    
    const levelMap = { 'N2': 'N1', 'N3': 'N2', 'N4': 'N3' };
    const previousNiveau = levelMap[niveauId];
    
    if (!previousNiveau) return false;
    
    const previousCompletion = this.calculateNiveauCompletion(previousNiveau);
    const isUnlocked = previousCompletion === 100;
    
    console.log(`🔓 ${niveauId} ${isUnlocked ? 'déverrouillé' : 'verrouillé'} (${previousNiveau}: ${previousCompletion}%)`);
    return isUnlocked;
}
```

### Exemples d'utilisation
```javascript
App.isNiveauUnlocked('N1')  // → true (toujours)
App.isNiveauUnlocked('N2')  // → true si N1 = 100%, false sinon
App.isNiveauUnlocked('N3')  // → true si N2 = 100%, false sinon
App.isNiveauUnlocked('N4')  // → true si N3 = 100%, false sinon
```

---

## 🎯 FONCTION 2: `App.calculateNiveauCompletion(niveauId)`

### Description
Calcule le pourcentage de complétion d'un niveau basé sur les étapes complétées.

### Signature
```javascript
calculateNiveauCompletion(niveauId) -> number (0-100)
```

### Logique
1. Récupère `StorageManager.getUser().niveaux[niveauId]`
2. Compte les étapes complétées vs total d'étapes
3. Retourne: `(stepsCompleted / totalSteps) * 100`
4. Retourne 0 si aucune donnée

### Code (~21 lignes)
```javascript
calculateNiveauCompletion(niveauId) {
    try {
        // Obtenir les données du niveau depuis le fichier JSON
        const userData = StorageManager.getUser();
        if (!userData || !userData.niveaux || !userData.niveaux[niveauId]) {
            console.log(`📊 ${niveauId}: Aucune donnée utilisateur, completion = 0%`);
            return 0;
        }

        const niveauData = userData.niveaux[niveauId];
        const stepsCompleted = niveauData.stepsCompleted ? Object.keys(niveauData.stepsCompleted).filter(k => niveauData.stepsCompleted[k]).length : 0;
        const totalSteps = niveauData.totalSteps || 1;

        const completion = totalSteps > 0 ? Math.round((stepsCompleted / totalSteps) * 100) : 0;
        console.log(`📊 ${niveauId}: ${completion}% (${stepsCompleted}/${totalSteps} étapes)`);
        return completion;
    } catch (error) {
        console.error(`❌ Erreur calculateNiveauCompletion(${niveauId}):`, error);
        return 0;
    }
}
```

### Exemples d'utilisation
```javascript
App.calculateNiveauCompletion('N1')  // → 75 (75% complété)
App.calculateNiveauCompletion('N2')  // → 0 (pas commencé)
App.calculateNiveauCompletion('N3')  // → 30 (30% complété)
```

---

## 🎯 FONCTION 3: `App.afficherNiveau(niveauId)`

### Description
Affiche les chapitres d'un niveau avec liste interactive et vérification de déblocage.

### Signature
```javascript
async afficherNiveau(niveauId) -> void
```

### Logique
1. Vérifier `isNiveauUnlocked(niveauId)`
   - Si non: Afficher alerte "Verrouillé"
   - Si oui: Continuer
2. Charger chapitres du niveau avec `loadChapitres(niveauId)`
3. Générer HTML pour chaque chapitre:
   - Titre et description
   - Progress bar
   - Pourcentage (x/y étapes)
   - onclick: `App.afficherChapitre(chapitre.id)`
4. Ajouter bouton "◀ Retour" → `App.afficherAccueil()`
5. Injecter dans #app-content

### Code (~65 lignes)
```javascript
async afficherNiveau(niveauId) {
    // Vérifier déblocage
    if (!this.isNiveauUnlocked(niveauId)) {
        alert(`🔒 Niveau ${niveauId} verrouillé!\nComplétez le niveau précédent à 100% pour débloquer.`);
        return;
    }

    // Charger les chapitres du niveau
    try {
        CHAPITRES = await loadChapitres(niveauId);
        
        if (!CHAPITRES || CHAPITRES.length === 0) {
            alert(`Aucun chapitre trouvé pour le niveau ${niveauId}`);
            return;
        }

        // Générer HTML des chapitres
        let html = `
            <div class="page active">
                <div class="page-title" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span>📚</span>
                        <h2>Chapitres - ${niveauId}</h2>
                    </div>
                    <button class="btn btn--secondary" onclick="App.afficherAccueil()">◀ Retour</button>
                </div>

                <div class="chapitres-list">
        `;

        // Ajouter chaque chapitre
        CHAPITRES.forEach(chapitre => {
            const completed = chapitre.etapes.filter(e => e.completed).length;
            const total = chapitre.etapes.length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

            html += `
                <div class="chapitre-item" onclick="App.afficherChapitre('${chapitre.id}')" 
                     style="cursor: pointer; padding: 15px; margin: 10px 0; background: #f9f9f9; border-radius: 8px; 
                             border-left: 4px solid ${chapitre.couleur || '#667eea'};">
                    <h3>${chapitre.emoji || '📖'} ${chapitre.titre}</h3>
                    <p>${chapitre.description}</p>
                    <div class="progress-bar" style="margin-top: 10px;">
                        <div class="progress-fill" style="width: ${percent}%; 
                                                          background-color: ${chapitre.couleur || '#667eea'};"></div>
                    </div>
                    <span style="font-size: 12px; color: #999;">${percent}% (${completed}/${total})</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        // Mettre à jour le DOM
        const appContent = document.getElementById('app-content');
        if (appContent) {
            appContent.innerHTML = html;
        }

        console.log(`📚 Affichage ${CHAPITRES.length} chapitres du niveau ${niveauId}`);
    } catch (error) {
        console.error(`❌ Erreur afficherNiveau(${niveauId}):`, error);
        alert(`Erreur lors du chargement du niveau ${niveauId}`);
    }
}
```

### Exemples d'utilisation
```javascript
// Afficher N1 (toujours déverrouillé)
App.afficherNiveau('N1')

// Afficher N2 si N1 = 100%, sinon alerte
App.afficherNiveau('N2')

// Retourner à l'accueil
App.afficherAccueil()
```

---

## 🔧 FONCTION BONUS: `App.afficherAccueil()`

### Description
Affiche la page d'accueil (retour depuis un niveau).

### Signature
```javascript
afficherAccueil() -> void
```

### Code (~3 lignes)
```javascript
afficherAccueil() {
    this.loadPage('accueil');
}
```

---

## 📊 Interaction des 3 Fonctions

```
Utilisateur clique "▶ Continuer" (N2)
                ↓
App.afficherNiveau('N2') appelé
                ↓
isNiveauUnlocked('N2') → vérifie N1 = 100%
                ├─ Si false → Alerte "Verrouillé"
                └─ Si true → Continue
                ↓
loadChapitres('N2') → Charge chapitres du N2
                ↓
Génère HTML avec liste chapitres
                ├─ Chaque chapitre clickable
                ├─ onclick: App.afficherChapitre(chapitre.id)
                └─ Bouton "◀ Retour" → App.afficherAccueil()
                ↓
Injecte dans #app-content
```

---

## 📋 Checklist de Validation

✅ **Fonction 1: isNiveauUnlocked()**
- [x] N1 = toujours true
- [x] N2-N4 = progressive selon complétude précédent
- [x] Logging console
- [x] Pas d'erreur

✅ **Fonction 2: calculateNiveauCompletion()**
- [x] Utilise StorageManager
- [x] Calcule % correctement
- [x] Gère cas d'erreur (retourne 0)
- [x] Logging console
- [x] ~20 lignes max

✅ **Fonction 3: afficherNiveau()**
- [x] Vérification déblocage avec isNiveauUnlocked()
- [x] Alerte si verrouillé
- [x] Charge chapitres avec loadChapitres()
- [x] Affiche liste chapitres interactive
- [x] Progress bar pour chaque chapitre
- [x] Bouton "Retour" fonctionnel
- [x] onclick chapitre: App.afficherChapitre()
- [x] Gestion erreurs try/catch
- [x] ~65 lignes max

✅ **Fonction 4: afficherAccueil()**
- [x] Appelle loadPage('accueil')
- [x] Simple et clean

---

## 🎯 Emplacement dans js/app.js

Toutes les 4 fonctions sont situées dans l'objet `App` à partir de la ligne ~5300 (après `renderAccueil()`):

```
Ligne 5297: isNiveauUnlocked()
Ligne 5315: calculateNiveauCompletion()
Ligne 5335: afficherNiveau()
Ligne 5405: afficherAccueil()
Ligne 5410: renderChapitres() [existant]
```

---

## 🚀 Intégration dans renderAccueil()

Dans la fonction `renderAccueil()`, les cartes niveaux utilisent:

```javascript
const isUnlocked = App.isNiveauUnlocked(niveau.id);
const completion = App.calculateNiveauCompletion(niveau.id);

// Bouton onclick:
onclick="${isUnlocked ? `App.afficherNiveau('${niveau.id}')` : 'return false;'}"
```

---

## 📝 Notes Importantes

1. **Déblocage progressif**: N1 → N2 → N3 → N4
2. **Basé sur 100%**: Un niveau doit être complété à 100% pour débloquer le suivant
3. **StorageManager**: Les données sont lues depuis `StorageManager.getUser()`
4. **Gestion erreurs**: Tous les try/catch pour éviter crashes
5. **Console logging**: Logs pour debug et suivi utilisateur
6. **Async/await**: `afficherNiveau()` est async car `loadChapitres()` l'est

---

## ✅ SIGNATURE DE LIVRAISON

| Aspect | Détails |
|--------|---------|
| **Fichier modifié** | js/app.js |
| **Fonctions créées** | 4 (isNiveauUnlocked, calculateNiveauCompletion, afficherNiveau, afficherAccueil) |
| **Lignes de code** | ~110 total (~18 + ~21 + ~65 + ~3) |
| **Style** | Clean code, commentaires, error handling |
| **Production-ready** | ✅ OUI |

---

Date: 7 Janvier 2026  
Statut: ✅ COMPLET ET TESTÉ  
Qualité: Production-ready
