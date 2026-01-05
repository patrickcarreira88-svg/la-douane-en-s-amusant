/**
 * GUIDE D'INTÉGRATION - storage.js MULTI-NIVEAUX
 * ================================================
 * 
 * 6 NOUVELLES FONCTIONS AJOUTÉES
 * Structure localStorage pour N1-N4
 * Migration automatique des données anciennes
 */

// ================================================================
// STRUCTURE LOCALSTORAGE APRÈS INTÉGRATION
// ================================================================

/*
{
  "douane_lms_v2": {
    "user": {
      "nickname": "Apprenti Douanier",
      "totalPoints": 450,
      "consecutiveDays": 5,
      "startDate": "2026-01-05T10:00:00.000Z",
      "lastActivityDate": "2026-01-05T15:30:00.000Z",
      "nom": null,
      "prenom": null,
      "matricule": null,
      "profileCreated": false,
      "niveaux": {                    // ← NOUVEAU: Structure multi-niveaux
        "N1": {
          "completion": 85,           // % global du niveau
          "chapters": {
            "ch1": {
              "completion": 100,
              "stepsCompleted": [...],
              "badgeEarned": true
            },
            "101BT": {
              "completion": 75,
              "stepsCompleted": [...],
              "badgeEarned": false
            },
            "ch2": { ... },
            "ch3": { ... },
            "ch4": { ... },
            "ch5": { ... },
            "101AY": {                // ← Nouveau chapitre
              "completion": 0,
              "stepsCompleted": [],
              "badgeEarned": false
            }
          }
        },
        "N2": {
          "completion": 0,            // Pas déverrouillé (N1 < 100%)
          "chapters": {}              // Vide
        },
        "N3": {
          "completion": 0,
          "chapters": {}
        },
        "N4": {
          "completion": 0,
          "chapters": {}
        }
      }
    },
    "chaptersProgress": { ... },      // ← Maintenu (rétrocompatibilité)
    "stepsPoints": { ... },
    "exercisesCompleted": { ... },
    "badges": [ ... ],
    "spacedRepetition": [ ... ],
    "journal": [ ... ]
  }
}
*/

// ================================================================
// 6 NOUVELLES FONCTIONS - DOCUMENTATION ET USAGE
// ================================================================

/**
 * 1. initializeNiveaux()
 * 
 * Initialise la structure multi-niveaux (N1-N4)
 * - Crée la structure si elle n'existe pas
 * - Migre les anciennes données (chapitre plat) vers nouveau format
 * - Appelée automatiquement au démarrage
 * 
 * USAGE:
 *   StorageManager.initializeNiveaux();
 *   // Résultat: Structure N1-N4 créée/migrée ✅
 * 
 * RETOUR: boolean (true si migration effectuée, false si déjà existant)
 */

/**
 * 2. calculateNiveauCompletion(niveauId)
 * 
 * Calcule le % de complétion d'un niveau
 * - Moyenne des % de complétion de ses chapitres
 * - Ex: N1 avec chapitres [100, 75, 60] = 78%
 * 
 * USAGE:
 *   const completion = StorageManager.calculateNiveauCompletion('N1');
 *   console.log(completion); // 78
 * 
 * RETOUR: number (0-100)
 */

/**
 * 3. updateNiveauProgress(niveauId)
 * 
 * Recalcule et sauvegarde la progression d'un niveau
 * - Appelée après chaque changement de chapitre
 * - Sauvegarde automatiquement dans localStorage
 * 
 * USAGE:
 *   const newCompletion = StorageManager.updateNiveauProgress('N1');
 *   console.log(newCompletion); // 82
 * 
 * RETOUR: number (nouveau % de complétion)
 */

/**
 * 4. getNiveauChapitres(niveauId)
 * 
 * Récupère TOUS les chapitres d'un niveau depuis localStorage
 * 
 * USAGE:
 *   const chapters = StorageManager.getNiveauChapitres('N1');
 *   console.log(chapters);
 *   // {
 *   //   ch1: { completion: 100, ... },
 *   //   101BT: { completion: 75, ... },
 *   //   ...
 *   // }
 * 
 * RETOUR: object { chapterId: { completion, stepsCompleted, ... } }
 */

/**
 * 5. isNiveauUnlocked(niveauId)
 * 
 * Vérifie si un niveau est déverrouillé
 * Logique de déblocage:
 *   - N1: TOUJOURS déverrouillé
 *   - N2: si N1.completion === 100
 *   - N3: si N2.completion === 100
 *   - N4: si N3.completion === 100
 * 
 * USAGE:
 *   if (StorageManager.isNiveauUnlocked('N2')) {
 *       console.log('N2 Accessible! N1 est complété!');
 *   } else {
 *       console.log('N2 Verrouillé - Complétez N1 d\'abord');
 *   }
 * 
 * RETOUR: boolean
 */

/**
 * 6. setChapterProgress(chapterId, updates)
 * 
 * Met à jour la progression d'un chapitre
 * - Trouve automatiquement quel niveau contient ce chapitre
 * - Met à jour le chapitre
 * - Recalcule la complétion du niveau
 * - Sauvegarde dans localStorage
 * 
 * USAGE:
 *   StorageManager.setChapterProgress('ch1', {
 *       completion: 85,
 *       stepsCompleted: ['ch1_step1', 'ch1_step2'],
 *       badgeEarned: true
 *   });
 *   // Résultat: ch1 mis à jour, N1.completion recalculé et sauvegardé ✅
 * 
 * RETOUR: object (chapitre mis à jour) ou null en cas d'erreur
 */

// ================================================================
// EXEMPLE COMPLET D'UTILISATION
// ================================================================

/*
// 1. Au démarrage de l'application
StorageManager.init();
StorageManager.initializeNiveaux();
// → Structure N1-N4 créée / migrée ✅

// 2. Charger les niveaux dans l'UI
const niveaux = ['N1', 'N2', 'N3', 'N4'];
niveaux.forEach(niveauId => {
    const completion = StorageManager.calculateNiveauCompletion(niveauId);
    const isUnlocked = StorageManager.isNiveauUnlocked(niveauId);
    const chapters = StorageManager.getNiveauChapitres(niveauId);
    
    console.log(`${niveauId}: ${completion}% | Déverrouillé: ${isUnlocked}`);
});

// 3. Après complétion d'un chapitre
StorageManager.setChapterProgress('ch1', {
    completion: 100,
    stepsCompleted: ['ch1_step1', 'ch1_step2', 'ch1_step3'],
    badgeEarned: true
});
// → N1.completion recalculé automatiquement
// → localStorage sauvegardé

// 4. Vérifier déblocage N2
if (StorageManager.isNiveauUnlocked('N2')) {
    console.log('N2 est maintenant accessible!');
}
*/

// ================================================================
// BACKWARD COMPATIBILITY (Rétrocompatibilité)
// ================================================================

/*
✅ CONSERVÉ:
  - user.totalPoints (compteur global)
  - chaptersProgress (ancien format, mantenu pour compatibilité)
  - Toutes les autres fonctions existantes

✅ NOUVEAU (côte à côte):
  - user.niveaux (N1-N4 structure)
  - 6 nouvelles fonctions pour gérer les niveaux

✅ MIGRATION:
  - initializeNiveaux() migre automatiquement les données
  - Les anciennes données dans chaptersProgress restent
  - Les nouvelles données se mettent dans user.niveaux
*/

// ================================================================
// INITIALISATION AUTOMATIQUE
// ================================================================

/*
Ajout dans le DOMContentLoaded:

document.addEventListener('DOMContentLoaded', () => {
    StorageManager.init();
    StorageManager.initializeNiveaux(); // ← Appelé automatiquement
});

✅ Aucune action manuelle requise!
*/

// ================================================================
// FICHIERS MODIFIÉS
// ================================================================

/*
✅ js/storage.js
  - Fonction setDefault() améliorée (inclut niveaux)
  - 6 nouvelles fonctions ajoutées
  - Initialisation automatique mise à jour

✅ data/chapitres-N1N4.json
  - Déjà préparé avec structure N1-N4

✅ js/app.js
  - Déjà pointant vers chapitres-N1N4.json
*/

// ================================================================
// POUR ACCÉDER AUX DONNÉES DU NIVEAU DANS app.js
// ================================================================

/*
// Récupérer tout un niveau
const niveauN1 = StorageManager.getUser().niveaux.N1;
console.log(niveauN1);
// {
//   completion: 85,
//   chapters: { ch1: {...}, 101BT: {...}, ... }
// }

// Ou utiliser les helpers
const chapitres = StorageManager.getNiveauChapitres('N1');
const completion = StorageManager.calculateNiveauCompletion('N1');
const isUnlocked = StorageManager.isNiveauUnlocked('N2');
*/

// ================================================================
// RÉSUMÉ DE L'INTÉGRATION
// ================================================================

/*
✅ ETAPE 1: setDefault() amélioré
✅ ETAPE 2: 6 nouvelles fonctions
✅ ETAPE 3: initializeNiveaux() automatique au démarrage
✅ ETAPE 4: Migration automatique des anciennes données
✅ ETAPE 5: Backward compatibility maintenue

🎯 RÉSULTAT: 
  - localStorage multi-niveaux fonctionnel
  - Déblocage conditionnel (N1→N2→N3→N4)
  - Progression par niveau tracked automatiquement
  - Migration transparente pour utilisateurs existants
*/
