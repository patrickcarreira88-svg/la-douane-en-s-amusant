# 📋 Normalisation des Formats d'Exercices

## 📌 Vue d'ensemble

**Problème résolu**: Deux formats JSON incompatibles coexistent dans la base:
- **Format ancien** (CH1, CH2, CH3): `exercice.choix`, `exercice.question`
- **Format nouveau** (101-BT): `exercice.content.options`, `exercice.content.question`

**Solution**: Fonction `normalizeExercise()` convertit automatiquement tous les formats au standard unifié.

---

## 🔧 Fonction de Normalisation

### Location
**Fichier**: `js/app.js`  
**Fonction**: `normalizeExercise(exercice)`  
**Appelée dans**: `renderExercice()` (ligne 1), avant d'appeler la fonction de rendu spécifique

### Logique

```javascript
// ✅ Détecte si format ancien, convertit au format moderne
// ✅ Si déjà format moderne, retourne tel quel
// ✅ Supporte 9 types d'exercices
```

### Conversions Supportées

| Type | Ancien Format | Nouveau Format | Conversion |
|------|--------------|----------------|-----------|
| **QCM** | `exercice.choix` | `exercice.content.options` | ✅ Automatique |
| **Vrai/Faux** | `exercice.affirmations` | `exercice.content.items` | ✅ Automatique |
| **Drag-Drop** | `exercice.items` | `exercice.content.items` | ✅ Automatique |
| **Matching** | `exercice.paires` | `exercice.content.pairs` | ✅ Automatique |
| **Likert Scale** | `exercice.items` | `exercice.content.items` | ✅ Automatique |
| **Flashcards** | `exercice.cartes` | `exercice.content.cards` | ✅ Automatique |
| **Lecture** | `exercice.texte` | `exercice.content.text` | ✅ Automatique |
| **Quiz** | `exercice.questions` | `exercice.content.questions` | ✅ Automatique |
| **Video** | Format stable | Pas de conversion | ✅ Pas modifié |

---

## 📝 Exemples de Conversion

### ❌ AVANT (Format Ancien - CH1)

```json
{
  "id": "ch1_step2",
  "titre": "Organisation actuelle",
  "type": "qcm",
  "exercice": {
    "type": "qcm",
    "question": "Combien de cantons compte la Suisse?",
    "choix": [
      { "id": "a", "texte": "24 cantons", "correct": false },
      { "id": "b", "texte": "26 cantons", "correct": true },
      { "id": "c", "texte": "28 cantons", "correct": false }
    ],
    "explication": "La Suisse compte 26 cantons depuis 1975."
  }
}
```

### ✅ APRÈS (Format Unifié)

```json
{
  "id": "ch1_step2",
  "titre": "Organisation actuelle",
  "type": "qcm",
  "exercice": {
    "type": "qcm",
    "content": {
      "question": "Combien de cantons compte la Suisse?",
      "options": [
        "24 cantons",
        "26 cantons",
        "28 cantons"
      ],
      "correctAnswer": 1,
      "explanation": "La Suisse compte 26 cantons depuis 1975."
    }
  }
}
```

---

## 📋 Template JSON Unifié pour CH1

Voici la structure **correcte et complète** pour CH1 avec tous les formats unifiés:

```json
{
  "chapitres": [
    {
      "id": "ch1",
      "numero": 1,
      "titre": "Introduction à la Douane",
      "description": "Découvrez les bases de l'organisation douanière suisse",
      "couleur": "#E0AAFF",
      "emoji": "🎯",
      "progression": 0,
      "objectifs": [
        "Comprendre l'organisation douanière suisse",
        "Identifier les trois domaines d'action douanière",
        "Décrire les rôles et responsabilités des agents douaniers",
        "Appliquer les concepts de base à des cas réels"
      ],
      "etapes": [
        {
          "id": "ch1_step1",
          "numero": 1,
          "titre": "Histoire de la Douane suisse",
          "type": "video",
          "duree": "3 min",
          "completed": false,
          "points": 10,
          "exercice": {
            "type": "video",
            "titre": "Histoire de la Douane suisse",
            "url": "https://www.youtube.com/embed/jNQXAC9IVRw",
            "description": "Regardez la vidéo pour comprendre l'histoire de la douane"
          }
        },
        {
          "id": "ch1_step2",
          "numero": 2,
          "titre": "Organisation actuelle",
          "type": "qcm",
          "duree": "5 min",
          "completed": false,
          "points": 10,
          "exercice": {
            "type": "qcm",
            "content": {
              "question": "Combien de cantons compte la Suisse?",
              "options": [
                "24 cantons",
                "26 cantons",
                "28 cantons",
                "30 cantons"
              ],
              "correctAnswer": 1,
              "explanation": "La Suisse compte 26 cantons depuis 1975."
            }
          }
        },
        {
          "id": "ch1_step3",
          "numero": 3,
          "titre": "Rôles et responsabilités",
          "type": "lecture",
          "duree": "7 min",
          "completed": false,
          "points": 10,
          "exercice": {
            "type": "lecture",
            "content": {
              "text": "La douane suisse remplit plusieurs missions essentielles:\n\n1. FISCALE: Perception des droits et taxes\n2. PROTECTION: Lutte contre la contrebande\n3. SECURITE: Contrôle des marchandises dangereuses"
            }
          }
        },
        {
          "id": "ch1_step4",
          "numero": 4,
          "titre": "Les 3 domaines douaniers",
          "type": "flashcards",
          "duree": "10 min",
          "completed": false,
          "points": 10,
          "exercice": {
            "type": "flashcards",
            "content": {
              "cards": [
                {
                  "id": "card1",
                  "recto": "Quel est le domaine FISCAL?",
                  "verso": "La perception des droits de douane et taxes"
                },
                {
                  "id": "card2",
                  "recto": "Quel est le domaine de PROTECTION?",
                  "verso": "La lutte contre la contrebande et fraude"
                },
                {
                  "id": "card3",
                  "recto": "Quel est le domaine de SECURITE?",
                  "verso": "Le contrôle des marchandises dangereuses"
                }
              ]
            }
          }
        },
        {
          "id": "ch1_step5",
          "numero": 5,
          "titre": "Quiz: Maîtrise les bases?",
          "type": "quiz",
          "duree": "10 min",
          "completed": false,
          "points": 20,
          "exercice": {
            "type": "quiz",
            "content": {
              "questions": [
                {
                  "id": "q1",
                  "question": "La douane suisse dépend de quel département?",
                  "options": [
                    "Département de la Justice",
                    "Département des Finances",
                    "Département de l'Intérieur",
                    "Département de la Défense"
                  ],
                  "correctAnswer": 1
                },
                {
                  "id": "q2",
                  "question": "Quel est le rôle PRINCIPAL de la douane?",
                  "options": [
                    "Collecter les taxes et protéger les frontières",
                    "Gérer les prisons",
                    "Émettre les passeports",
                    "Gérer les aéroports"
                  ],
                  "correctAnswer": 0
                }
              ],
              "scoreMin": 1
            }
          }
        }
      ],
      "badge": {
        "id": "badge_ch1",
        "titre": "Apprenti Douanier",
        "emoji": "🎓",
        "description": "Vous avez complété le chapitre 1!"
      }
    }
  ]
}
```

---

## 🔄 Migration Progressive

### Stratégie Recommandée

**Phase 1** (✅ DÉJÀ FAITE)
- ✅ Fonction `normalizeExercise()` créée
- ✅ Intégration dans `renderExercice()`
- ✅ Compatible avec DEUX formats (ancien + nouveau)

**Phase 2** (OPTIONNEL - À FAIRE MANUELLEMENT)
- Convertir CH1, CH2, CH3 au format unifié
- Tester dans le navigateur
- Valider que tous les exercices fonctionnent

**Phase 3** (OPTIONNEL)
- Nettoyer les fichiers JSON
- Supprimer les champs obsolètes

---

## ✅ Test de Compatibilité

### Pour vérifier que ça fonctionne:

1. **Ouvrir la console** (F12)
2. **Naviguer** sur CH1 (format ancien)
3. **Observer les logs**:
   ```
   ✅ Exercice ch1_step2 normalisé:
   {type: 'qcm', content: {...}, ...}
   ```
4. **Tous les exercices doivent afficher** sans erreur

---

## 🚀 Avantages

| Avantage | Détail |
|----------|--------|
| **Rétro-compatible** | Ancien format toujours accepté |
| **Futur-proof** | Format nouveau standardisé |
| **Transparent** | Utilisateur ne voit pas la conversion |
| **Flexible** | Supporte formats mixtes |
| **Maintainable** | Centralisation en une seule fonction |

---

## 📊 Résumé des Modifications

### Fichiers Modifiés

1. **`js/app.js`**
   - ✅ Fonction `normalizeExercise()` ajoutée (~130 lignes)
   - ✅ Appel dans `renderExercice()` (ligne 1)

### Fichiers Non Modifiés (pour l'instant)

- `data/chapitres.json` - Fonctionne avec format ancien ET nouveau
- `data/101-BT.json` - Déjà au format unifié
- HTML/CSS - Aucun changement

---

## 🎯 Prochaines Étapes

**Option 1 - Compatibilité Complète** (Recommandé)
- Laisser la normalisation active
- Tester tous les chapitres
- Migrer progressivement vers format unifié

**Option 2 - Migration Immédiate**
- Convertir `chapitres.json` au format unifié
- Utiliser le template fourni ci-dessus
- Supprimer la fonction de normalisation après

**Option 3 - Hybride** (Flexible)
- Garder la normalisation
- Convertir progressivement au rythme voulu
- Pas de pression de migration rapide

---

## 📞 Support

Tous les logs de conversion s'affichent en console avec `✅` ou `❌` pour diagnostic rapide.
