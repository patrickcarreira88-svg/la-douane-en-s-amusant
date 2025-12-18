/**
 * TEST INTÉGRATION: ExerciseNormalizer avec data101-BT.json
 * 
 * Charge le fichier réel data101-BT.json et normalise tous ses exercices
 * Vérification complète que la structure a clé 'content' pour tous
 */

const fs = require('fs');
const path = require('path');

// Charger le normalizer (simplifié - même classe)
class ExerciseNormalizer {
  constructor() {
    this.stats = {
      totalProcessed: 0,
      normalized: 0,
      skipped: 0,
      errors: []
    };
  }

  normalizeQCM(oldFormat) {
    if (oldFormat.content && oldFormat.content.question !== undefined && 
        oldFormat.content.options !== undefined) {
      return oldFormat;
    }

    const normalized = { ...oldFormat };
    
    if (oldFormat.exercice && oldFormat.exercice.choix) {
      normalized.content = {
        question: oldFormat.exercice.question || oldFormat.content?.question || "",
        options: oldFormat.exercice.choix.map((choice, index) => ({
          id: `opt${index + 1}`,
          text: choice.texte || choice.text || choice,
          correct: choice.correct || false,
          explanation: choice.explanation || ""
        })),
        correctAnswer: this._calculateCorrectAnswer(oldFormat.exercice.choix),
        explanation: oldFormat.exercice.explanation || oldFormat.content?.explanation || ""
      };
      
      if (oldFormat.exercice.points) normalized.points = oldFormat.exercice.points;
      if (oldFormat.exercice.titre) normalized.titre = oldFormat.exercice.titre;
      
      delete normalized.exercice;
      return normalized;
    }

    if (!normalized.content) {
      normalized.content = {
        question: oldFormat.question || "",
        options: oldFormat.options || [],
        correctAnswer: oldFormat.correctAnswer !== undefined ? oldFormat.correctAnswer : 0,
        explanation: oldFormat.explanation || ""
      };
    }

    return normalized;
  }

  normalizeFlashcard(oldFormat) {
    if (oldFormat.content && oldFormat.content.cards !== undefined) {
      return oldFormat;
    }

    const normalized = { ...oldFormat };

    if (oldFormat.exercice && oldFormat.exercice.cartes) {
      normalized.content = {
        cards: oldFormat.exercice.cartes.map((card, index) => ({
          id: card.id || `card${index + 1}`,
          recto: card.recto || card.front || card.question || "",
          verso: card.verso || card.back || card.answer || "",
          difficulty: card.difficulty || "normal"
        }))
      };

      if (oldFormat.exercice.points) normalized.points = oldFormat.exercice.points;
      if (oldFormat.exercice.titre) normalized.titre = oldFormat.exercice.titre;

      delete normalized.exercice;
      return normalized;
    }

    if (!normalized.content) {
      normalized.content = {
        cards: oldFormat.cards || []
      };
    }

    return normalized;
  }

  normalizeAll(chapters) {
    const isArray = Array.isArray(chapters);
    const chaptersArray = isArray ? chapters : [chapters];

    const normalized = chaptersArray.map(chapter => {
      const normalizedChapter = { ...chapter };

      if (normalizedChapter.etapes && Array.isArray(normalizedChapter.etapes)) {
        normalizedChapter.etapes = normalizedChapter.etapes.map(step => {
          const normalizedStep = { ...step };
          
          if (normalizedStep.exercices && Array.isArray(normalizedStep.exercices)) {
            normalizedStep.exercices = normalizedStep.exercices.map(exercise => {
              return this._normalizeExercise(exercise);
            });
          }
          
          return normalizedStep;
        });
      }

      if (normalizedChapter.exercices && Array.isArray(normalizedChapter.exercices)) {
        normalizedChapter.exercices = normalizedChapter.exercices.map(exercise => {
          return this._normalizeExercise(exercise);
        });
      }

      return normalizedChapter;
    });

    return isArray ? normalized : normalized[0];
  }

  _normalizeExercise(exercise) {
    this.stats.totalProcessed++;

    try {
      const type = exercise.type || (exercise.exercice ? exercise.exercice.type : "unknown");

      let normalized;
      switch (type) {
        case "qcm":
        case "quiz":
          normalized = this.normalizeQCM(exercise);
          break;
        case "flashcard":
        case "flashcards":
          normalized = this.normalizeFlashcard(exercise);
          break;
        default:
          // Pour les autres types, vérifier si content existe
          normalized = { ...exercise };
          
          // Si pas de content mais a exercice, migrer exercice vers content
          if (!normalized.content && normalized.exercice) {
            normalized.content = normalized.exercice;
            delete normalized.exercice;
          }
          
          // Si pas de content mais a d'autres propriétés de structure
          // Wrapper ces propriétés dans 'content'
          if (!normalized.content) {
            const contentKeys = ['pairs', 'statuses', 'scenario', 'questions', 'items', 
                               'leftItems', 'rightItems', 'targets', 'cards', 
                               'question', 'options', 'rows', 'text', 'timeline',
                               'url', 'videoId', 'description', 'recto', 'verso'];
            
            const hasStructuredContent = contentKeys.some(key => key in normalized);
            
            if (hasStructuredContent) {
              normalized.content = {};
              
              // Migrer toutes les propriétés de structure vers content
              for (const key of contentKeys) {
                if (key in normalized) {
                  normalized.content[key] = normalized[key];
                  delete normalized[key];
                }
              }
            }
          }
      }

      if (!normalized.content) {
        this.stats.errors.push({
          exerciseId: exercise.id,
          message: "Normalisation incomplète: clé 'content' manquante",
          type: type
        });
      } else {
        this.stats.normalized++;
      }

      return normalized;
    } catch (error) {
      this.stats.errors.push({
        exerciseId: exercise.id,
        message: error.message,
        type: exercise.type
      });
      this.stats.skipped++;
      return exercise;
    }
  }

  _calculateCorrectAnswer(choices) {
    const correctIndex = choices.findIndex(choice => choice.correct === true);
    return correctIndex >= 0 ? correctIndex : 0;
  }

  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalProcessed > 0 
        ? ((this.stats.normalized / this.stats.totalProcessed) * 100).toFixed(2) + "%"
        : "N/A"
    };
  }

  resetStats() {
    this.stats = {
      totalProcessed: 0,
      normalized: 0,
      skipped: 0,
      errors: []
    };
  }

  printReport() {
    const stats = this.getStats();
    console.group("📊 ExerciseNormalizer - Rapport de Normalisation");
    console.log(`Total traités: ${stats.totalProcessed}`);
    console.log(`Normalisés: ${stats.normalized}`);
    console.log(`Taux de succès: ${stats.successRate}`);
    
    if (stats.errors.length > 0) {
      console.group(`❌ ${stats.errors.length} erreur(s)`);
      stats.errors.forEach(error => {
        console.error(`  ${error.exerciseId}: ${error.message}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }
}

// ============================================================================
// TEST D'INTÉGRATION AVEC data101-BT.json
// ============================================================================

const dataPath = path.join(__dirname, 'data', 'data101-BT.json');

console.log("=".repeat(70));
console.log("TEST INTÉGRATION: data101-BT.json");
console.log("=".repeat(70));

try {
  // Charger data101-BT.json
  const jsonContent = fs.readFileSync(dataPath, 'utf-8');
  const data101BT = JSON.parse(jsonContent);

  console.log(`\n✓ Fichier chargé: ${path.basename(dataPath)}`);
  console.log(`  ID du chapitre: ${data101BT.id}`);
  console.log(`  Titre: ${data101BT.titre}`);
  console.log(`  Étapes: ${data101BT.etapes.length}`);

  // Compter les exercices avant normalisation
  let exercisesBeforeNormalization = 0;
  data101BT.etapes.forEach(step => {
    if (step.exercices) {
      exercisesBeforeNormalization += step.exercices.length;
    }
  });
  console.log(`  Exercices totaux: ${exercisesBeforeNormalization}`);

  // Normaliser
  const normalizer = new ExerciseNormalizer();
  const normalized = normalizer.normalizeAll(data101BT);

  console.log("\n" + "=".repeat(70));
  console.log("RÉSULTATS DE NORMALISATION");
  console.log("=".repeat(70));

  // Vérifier que tous les exercices ont 'content'
  let exercisesAfterNormalization = 0;
  let exercisesWithContent = 0;
  let exercisesByType = {};

  normalized.etapes.forEach((step, stepIndex) => {
    if (step.exercices) {
      step.exercices.forEach((exercise, exIndex) => {
        exercisesAfterNormalization++;

        if (exercise.content) {
          exercisesWithContent++;
        } else {
          console.error(`❌ Étape ${stepIndex + 1}, Exercice ${exIndex + 1} (${exercise.id}): MANQUE 'content'`);
        }

        // Compter par type
        const type = exercise.type || "unknown";
        exercisesByType[type] = (exercisesByType[type] || 0) + 1;
      });
    }
  });

  console.log(`\nExercices traités: ${exercisesAfterNormalization}`);
  console.log(`Exercices avec 'content': ${exercisesWithContent}/${exercisesAfterNormalization}`);

  console.log("\nExercices par type:");
  Object.entries(exercisesByType).sort().forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });

  // Afficher le rapport
  normalizer.printReport();

  // Validation finale
  console.log("\n" + "=".repeat(70));
  if (exercisesWithContent === exercisesAfterNormalization && normalizer.getStats().errors.length === 0) {
    console.log("✅ VALIDATION COMPLÈTE: SUCCESS");
    console.log("   Tous les exercices sont normalisés avec clé 'content'");
  } else {
    console.log("❌ VALIDATION FAILED");
  }
  console.log("=".repeat(70));

  // Afficher quelques exemples
  console.log("\n📋 EXEMPLES D'EXERCICES NORMALISÉS:\n");
  
  let exampleCount = 0;
  normalized.etapes.forEach(step => {
    if (step.exercices && exampleCount < 5) {
      step.exercices.forEach(ex => {
        if (exampleCount < 5) {
          console.log(`[${ex.type.toUpperCase()}] ${ex.id}`);
          console.log(`  ID: ${ex.id}`);
          console.log(`  Titre: ${ex.titre}`);
          console.log(`  Content keys: ${Object.keys(ex.content).join(", ")}`);
          
          if (ex.type === "qcm" || ex.type === "quiz") {
            console.log(`  Question: ${ex.content.question?.substring(0, 50)}...`);
            console.log(`  Options: ${ex.content.options?.length || 0}`);
            console.log(`  Correct answer: ${ex.content.correctAnswer}`);
          } else if (ex.type === "flashcard") {
            console.log(`  Cards: ${ex.content.cards?.length || 0}`);
          }
          console.log();
          exampleCount++;
        }
      });
    }
  });

} catch (error) {
  console.error(`❌ Erreur: ${error.message}`);
  console.error(error.stack);
}
