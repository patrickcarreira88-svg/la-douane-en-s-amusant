# CHECKLIST RAPIDE - Audit Structures (Réutilisable)

**Utilisation**: Avant de commiter ou déployer des modifications chapitres.json  
**Durée**: ~10 min  
**Fréquence**: Chaque modification majeure (recommandé: hebdomadaire)

---

## ⚡ QUICKSTART (2 min)

### Run audit automatique
```bash
cd "C:\Users\patri\OneDrive\Bureau\LMS Brevet Fédéral"
python audit_structures_exercices.py
```

### Expected output
```
✓ JSON charge: data/chapitres.json
✓ 6 types trouves dans CH1
✓ Audit complete: 0 ecarts detectes  ← Ce nombre doit être 0

[Affichage structures de ref...]
AUCUN ECART DETECTE - TOUTES STRUCTURES CONFORMES!
```

**Si écarts détectés**: `python audit_structures_exercices.py --fix`

---

## ✅ CHECKLIST MANUELLE (5 min)

### 1. JSON Syntax
```bash
# Terminal
python -c "import json; json.load(open('data/chapitres.json')); print('✓ OK')"
```
- [ ] Aucune erreur JSON

### 2. Comptage exercices
```javascript
// F12 Console
fetch('data/chapitres.json').then(r=>r.json()).then(d=>{
  let c=0; d.chapitres.forEach(ch=>ch.etapes.forEach(e=>e.exercices.forEach(ex=>c++)));
  console.log('Exercices:', c);
});
```
- [ ] Nombre exercices = nombre attendu (~31)

### 3. Videos CH2-CH5 ont `url`
```javascript
// F12 Console
fetch('data/chapitres.json').then(r=>r.json()).then(d=>{
  ['ch2','ch3','ch4','ch5'].forEach(chId=>{
    const ch=d.chapitres.find(c=>c.id===chId);
    ch.etapes.forEach(e=>e.exercices.forEach(ex=>{
      if(ex.type==='video') console.log(
        (('url' in ex)?'✓':'✗') + ' ' + ex.id + ' has url'
      );
    }));
  });
});
```
- [ ] Tous les vidéos CH2-CH5 ont ✓ (url present)

### 4. Structures conformes
```javascript
// F12 Console
fetch('data/chapitres.json').then(r=>r.json()).then(d=>{
  const ch1=d.chapitres[0];
  ['flashcards','lecture','qcm','quiz','video'].forEach(type=>{
    const ch1Ex=ch1.etapes.flatMap(e=>e.exercices).find(ex=>ex.type===type);
    const ch1Keys=ch1Ex?Object.keys(ch1Ex).sort():[];
    
    ['ch2','ch3','ch4','ch5'].forEach(chId=>{
      const ch=d.chapitres.find(c=>c.id===chId);
      const chEx=ch.etapes.flatMap(e=>e.exercices).find(ex=>ex.type===type);
      if(!chEx) return;
      
      const chKeys=Object.keys(chEx).sort();
      const ok=JSON.stringify(chKeys)===JSON.stringify(ch1Keys);
      console.log((ok?'✓':'✗')+' '+type+' in '+chId);
    });
  });
});
```
- [ ] Tous les types affichent ✓

### 5. Aucune erreur console
- [ ] Pas de rouge dans F12 Console
- [ ] Pas de warnings critiques

---

## 📋 AVANT DE COMMITER

```bash
# 1. Audit
python audit_structures_exercices.py

# 2. Si écarts
python audit_structures_exercices.py --fix

# 3. Valider JSON
python -c "import json; json.load(open('data/chapitres.json')); print('OK')"

# 4. Git diff
git diff data/chapitres.json  # Vérifier changements attendus

# 5. Commit
git add data/chapitres.json
git commit -m "fix(data): harmonize video url structure CH2-CH5"
```

---

## 🚨 POINTS À VÉRIFIER

### Les 5 types d'exercices
- [ ] **Flashcards** - clés: `['id', 'type', 'titre', 'description', 'content', 'points']`
- [ ] **Lecture** - clés: `['id', 'type', 'titre', 'description', 'content', 'points']`
- [ ] **QCM** - clés: `['id', 'type', 'titre', 'description', 'content', 'points']`
- [ ] **Quiz** - clés: `['id', 'type', 'titre', 'description', 'content', 'points']`
- [ ] **Vidéo** - clés: `['id', 'type', 'titre', 'description', 'url', 'content', 'points']`

### Clé critique pour VIDÉOS
- [ ] **Tous les VIDEO (CH2-CH5) DOIVENT avoir `url` au niveau racine**
  ```javascript
  video.url // ← Cette clé DOIT exister
  ```

### Content structure
- [ ] **Flashcards.content**: clé `cards` (array)
- [ ] **Lecture.content**: clé `text` (string)
- [ ] **QCM.content**: clés `question`, `options`, `correctAnswer`, `explanation`
- [ ] **Quiz.content**: clé `questions` (array)
- [ ] **Vidéo.content**: clés `url`, `description`

---

## 📊 INDICATEURS SANTÉ

| Métrique | OK | À CORRIGER |
|----------|-----|-----------|
| JSON syntax | `python -c "import json..."` OK | Erreur parse |
| Nombre exo | 31 | ≠ 31 |
| Videos CH2-CH5 avec url | 4/4 | < 4/4 |
| Écarts détectés | 0 | > 0 |
| Console errors | Aucun | Présents |

---

## 🔄 WORKFLOW NORMAL

```
Modifier chapitres.json
    ↓
Lancer audit (2 min)
    ↓
Écarts? → Corriger auto (fix)
    ↓
Validation F12 (3 min)
    ↓
Git diff (1 min)
    ↓
Commit & push
```

**Temps total**: ~10 min

---

## 🆘 TROUBLESHOOTING RAPIDE

| Symptôme | Solution |
|----------|----------|
| JSON parse error | `python audit_structures_exercices.py` affiche l'erreur |
| Écarts détectés | Relancer: `python audit_structures_exercices.py --fix` |
| Video sans `url` | Vérifier `content.url` existe, puis fix auto |
| Type de clés incorrect | Examiner CH1 comme référence |
| Console errors F12 | Vérifier JSON valide (`python -c ...`) |

---

## ✅ FINAL CHECKLIST (Avant commit)

- [ ] Audit exécuté (`python audit_structures_exercices.py`)
- [ ] Écarts = 0
- [ ] JSON valide (`python -c "import json..."`)
- [ ] Comptage exercices correct (~31)
- [ ] Videos CH2-CH5 ont `url` ✓
- [ ] Structures conformes vs CH1 ✓
- [ ] Aucun console.error (F12)
- [ ] `git diff` montre changements attendus uniquement
- [ ] Commit message clair
- [ ] Push + deploy

---

## 📞 QUICK REFERENCE

### Fichier audit à utiliser
```bash
audit_structures_exercices.py
```

### Fichiers à consulter si besoin détails
| Question | Fichier |
|----------|---------|
| "Audit échoue, c'est quoi?" | AUDIT_EXERCICES_STRUCTURES.md |
| "Comment corriger?" | RAPPORT_FINAL_CORRECTION.md |
| "Détails tests?" | GUIDE_TEST_VALIDATION.md |
| "Cas particulier?" | RESUME_EXECUTIF_AUDIT.md |

### Un-liner pour vérification complète
```bash
python audit_structures_exercices.py && \
python -c "import json; json.load(open('data/chapitres.json')); print('✓ OK')" && \
echo "✓ Ready to commit"
```

---

## 🎯 RÈGLES D'OR

1. **Toujours auditer avant commit**
   ```bash
   python audit_structures_exercices.py
   ```

2. **Écarts = correction automatique**
   ```bash
   python audit_structures_exercices.py --fix
   ```

3. **JSON doit être valide**
   ```bash
   python -c "import json; json.load(open('data/chapitres.json'))"
   ```

4. **Vidéos CH2-CH5 doivent avoir `url`**
   - Non-négociable!

5. **Structures doivent matcher CH1**
   - CH1 = référence absolue

---

**Créé**: 7 janvier 2026  
**Version**: 1.0  
**Mise à jour**: Régulière (avec modifications chapitres.json)

*Imprimer et afficher sur le bureau du développeur! 📋*
