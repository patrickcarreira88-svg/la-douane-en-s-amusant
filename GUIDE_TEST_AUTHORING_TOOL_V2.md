#!/bin/bash
# GUIDE_TEST_AUTHORING_TOOL_V2.md

# 🚀 GUIDE DE TEST - AUTHORING-TOOL-V2.HTML

## ⚡ DÉMARRAGE RAPIDE

### 1️⃣ Lancer le serveur backend
```bash
cd "c:\Users\patri\OneDrive\Bureau\LMS Brevet Fédéral"
npm start
# Serveur démarre sur http://localhost:5000
```

### 2️⃣ Accéder à l'outil
```
http://localhost:5000/authoring-tool-v2.html
```

### 3️⃣ Vérifier la console
```
F12 → Console (pour voir logs et erreurs)
```

---

## 📝 TEST 1: CRÉER UN QCM

### Étapes:
1. **Ouvrir l'outil** → Page d'accueil "Sélectionnez un chapitre"
2. **Créer un chapitre:**
   - Cliquer "+ Nouveau Chapitre"
   - Sélectionner niveau: "N1"
   - Titre: "Chapitre Test"
   - Cliquer "Créer"
3. **Attendre chargement** (1-2 secondes)
4. **Créer une étape:**
   - Onglet "Étapes"
   - Cliquer "+ Nouvelle Étape"
   - Titre: "Étape 1"
   - Type: "Apprentissage"
   - Cliquer "Créer"
5. **Attendre chargement** → affiche "Aucun exercice"
6. **Créer un exercice QCM:**
   - Cliquer "+ Nouvel Exercice"
   - Titre: "QCM: Capitales"
   - Type: "QCM"
   - Cliquer "Créer"
7. **Voir le formulaire QCM:**
   - ✅ 3 options pré-créées avec radios
   - ✅ Bouton "+ Ajouter une option"
   - ✅ Chaque option a un bouton "🗑️"

### Remplir le QCM:
1. **Question:** "Quelle est la capitale de la France?"
2. **Option 1:** "Londres"
3. **Option 2:** "Paris" → **Cliquer radio** "✓ Bonne réponse"
4. **Option 3:** "Berlin"
5. **Explication:** "Paris est la capitale de la France"
6. **Sauvegarder**

### Vérifications ✅:
- ✅ Message "✅ Exercice sauvegardé" en vert
- ✅ Retour automatique à la liste d'étapes
- ✅ QCM "QCM: Capitales" apparaît dans la liste

---

## 📝 TEST 2: ÉDITER LE QCM

### Étapes:
1. **Cliquer sur le QCM** dans la liste
2. **Voir le formulaire rechargé:**
   - ✅ Question remplie
   - ✅ Options avec radios remplis
   - ✅ Option 2 (Paris) a la radio cochée ✓
3. **Ajouter une option:**
   - Cliquer "+ Ajouter une option"
   - Voir animation slideDown
   - Remplir: "Madrid"
4. **Supprimer option:**
   - Cliquer 🗑️ sur "Londres"
   - Voir réindexation des radios
5. **Changer bonne réponse:**
   - Cliquer radio pour "Madrid"
6. **Sauvegarder**

### Vérifications ✅:
- ✅ Animation slideDown lors ajout
- ✅ Réindexation des valeurs radios
- ✅ Sauvegarde correcte en BD

---

## ❌ TEST 3: VALIDATION (ERREURS)

### Test 3A: Question vide
1. Créer QCM
2. Laisser question vide
3. Cliquer "Sauvegarder"
4. ✅ Erreur: "❌ Question requise"

### Test 3B: Moins de 2 options
1. Créer QCM
2. Supprimer 2 options (garder 1)
3. Cliquer "Sauvegarder"
4. ✅ Erreur: "❌ Au moins 2 options requises"

### Test 3C: Option vide
1. Créer QCM
2. Laisser l'une des options vide
3. Cliquer "Sauvegarder"
4. ✅ Erreur: "❌ Toutes les options doivent avoir du texte"

### Test 3D: Pas de bonne réponse sélectionnée
1. Créer QCM
2. Remplir options
3. **NE PAS cocher de radio** pour bonne réponse
4. Cliquer "Sauvegarder"
5. ✅ Erreur: "❌ Sélectionnez quelle option est correcte"

---

## 🔄 TEST 4: RETOUR FORMAT BD

### Ouvrir DevTools (F12)

#### 1️⃣ Aller à Application → LocalStorage
ou

#### 2️⃣ Exécuter dans console:
```javascript
// Afficher le dernier exercice créé
const req = indexedDB.open('LMSAuthoringDB');
req.onsuccess = () => {
    const db = req.result;
    const store = db.transaction('exercices').objectStore('exercices');
    const getReq = store.getAll();
    getReq.onsuccess = () => console.log(JSON.stringify(getReq.result, null, 2));
};
```

### Vérifier la structure ✅:
```json
{
  "id": "N1_ch01_step01_ex001",
  "titre": "QCM: Capitales",
  "type": "qcm",
  "points": 10,
  "content": {
    "question": "Quelle est la capitale de la France?",
    "options": [
      { "label": "Paris", "correct": true },
      { "label": "Berlin", "correct": false },
      { "label": "Madrid", "correct": false }
    ],
    "correctAnswer": 0,
    "explanation": "Paris est la capitale de la France"
  }
}
```

✅ **Points clés:**
- ✅ `options` est un array d'objets
- ✅ Chaque objet a `label` et `correct`
- ✅ Exactement **1 seul** `correct: true`
- ✅ `correctAnswer` = index de l'option avec `correct: true`

---

## 🎨 TEST 5: AUTRES TYPES D'EXERCICES

Tester que les autres types fonctionnent toujours:

### ✅ Vrai/Faux
- Créer exercice type "Vrai/Faux"
- Remplir énoncé
- Sélectionner réponse (Vrai/Faux)
- Sauvegarder

### ✅ Flashcards
- Créer exercice type "Flashcards"
- Format: "Recto 1 | Verso 1"
- Sauvegarder

### ✅ Vidéo
- Créer exercice type "Vidéo"
- URL: `https://www.youtube.com/embed/...`
- Sauvegarder

### ✅ Lecture
- Créer exercice type "Lecture"
- Contenu markdown
- Sauvegarder

### ✅ Drag&Drop
- Créer exercice type "Drag&Drop"
- Instruction et éléments
- Sauvegarder

### ✅ Scénario
- Créer exercice type "Scénario"
- Scénario et questions JSON
- Sauvegarder

**Tous doivent fonctionner sans erreur** ✅

---

## 📊 TEST 6: WORKFLOW COMPLET

### Créer une hiérarchie complète:
1. **Niveau:** N2
2. **Chapitre:** "Mathématiques"
3. **Étape 1:** "Diagnostic"
4. **Exercices:**
   - QCM: "Quel est 5+3?"
   - Vrai/Faux: "5+3=8"
   - QCM: "Quel est 10-2?"

### Tester navigation:
- Cliquer niveau N2 → Déplier chapitres
- Cliquer "Mathématiques" → Afficher étapes
- Cliquer "Diagnostic" → Afficher exercices
- Cliquer chaque exercice → Voir formulaire
- Éditer et sauvegarder

### Vérifications:
- ✅ Données persistent après rechargement F5
- ✅ Git commit automatique (vérifier dans terminal)
- ✅ Tous les exercices sauvegardés correctement

---

## 🐛 TROUBLESHOOTING

### Problème: Exercice ne se sauvegarde pas
**Solution:**
1. Ouvrir console (F12)
2. Chercher erreur réseau
3. Vérifier que serveur tourne: `http://localhost:5000/api/niveaux`
4. Si erreur CORS: vérifier server.js ligne 10

### Problème: Radios ne s'affichent pas
**Solution:**
1. Console (F12) → chercher erreur
2. Vérifier `qcm-options-container` existe
3. Vérifier `updateExerciceForm()` a été appelée
4. Vérifier `addQCMOption()` fonctionne (console: `addQCMOption()`)

### Problème: Validation QCM trop stricte
**Solution:**
Validation cherche:
- Question non vide ✅
- Min 2 options ✅
- Toutes options remplies ✅
- Exactement 1 radio cochée ✅
- `correctAnswer` = index radio ✅

Vérifier tous les points avant POST.

### Problème: Données incohérentes en BD
**Solution:**
Ne devrait pas arriver si validation fonctionne.
Si ça arrive:
1. Supprimer exercice
2. Le recréer
3. Signaler le bug avec logs console

---

## ✅ CHECKLIST FINALE

### Avant de déclarer "DONE":
- [ ] QCM crée avec radios ✅
- [ ] 3 options pré-remplies ✅
- [ ] Ajout option fonctionne + animation ✅
- [ ] Suppression option fonctionne + réindexation ✅
- [ ] Validation question requise ✅
- [ ] Validation min 2 options ✅
- [ ] Validation options remplies ✅
- [ ] Validation radio cochée ✅
- [ ] Format BD: `{label, correct}` ✅
- [ ] Édition QCM recharge radios ✅
- [ ] Autres types fonctionnent ✅
- [ ] Données persist après F5 ✅
- [ ] Pas d'erreurs console ✅

---

## 📞 SUPPORT

En cas de problème:
1. **Vérifier console (F12)** pour erreurs
2. **Vérifier serveur tourne:** `npm start` affiche "Server listening on :5000"
3. **Vérifier network (F12 → Network)** pour requêtes API
4. **Tester API directement:** `http://localhost:5000/api/niveaux`

---

**Status:** 🟢 Prêt pour test  
**Dernière mise à jour:** 11 Janvier 2026
