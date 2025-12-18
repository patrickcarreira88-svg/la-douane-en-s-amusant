/**
 * ExerciseNormalizer
 * 
 * Normalise les exercices de l'ancien format au nouveau format unifié.
 * Supporte la rétrocompatibilité complète : détecte le format et convertit silencieusement.
 */
class ExerciseNormalizer {
  constructor() {
    this.stats = {
      totalProcessed: 0,
      normalized: 0,
      skipped: 0,
      errors: []
    };
  }

  /**
   * Normalise un exercice QCM de l'ancien format au nouveau format
   * Ancien format:
   *   - exercice.choix[] → convertir en content.options[]
   *   - exercice.question → déplacer dans content.question
   *   - correctAnswer absent → calculer depuis choix[].correct
   * 
   * @param {Object} oldFormat - Exercice au format ancien
   * @returns {Object} Exercice au format normalisé
   */
  normalizeQCM(oldFormat) {
    // Si déjà au nouveau format (has 'content' key)
    if (oldFormat.content && oldFormat.content.question !== undefined && 
        oldFormat.content.options !== undefined) {
      return oldFormat;
    }

    const normalized = { ...oldFormat };
    
    // Vérifier si ancien format avec 'choix'
    if (oldFormat.exercice && oldFormat.exercice.choix) {
      // Convertir choix[] en options[]
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
      
      // Copier les autres champs métadonnées
      if (oldFormat.exercice.points) normalized.points = oldFormat.exercice.points;
      if (oldFormat.exercice.titre) normalized.titre = oldFormat.exercice.titre;
      
      delete normalized.exercice; // Supprimer ancien format
      return normalized;
    }

    // Sinon, vérifier si déjà au nouveau format
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

  /**
   * Normalise un exercice Flashcard de l'ancien format au nouveau format
   * Ancien format:
   *   - exercice.cartes[] → convertir en content.cards[]
   *   - Garder id, recto, verso
   * 
   * @param {Object} oldFormat - Exercice au format ancien
   * @returns {Object} Exercice au format normalisé
   */
  normalizeFlashcard(oldFormat) {
    // Si déjà au nouveau format
    if (oldFormat.content && oldFormat.content.cards !== undefined) {
      return oldFormat;
    }

    const normalized = { ...oldFormat };

    // Vérifier si ancien format avec 'cartes'
    if (oldFormat.exercice && oldFormat.exercice.cartes) {
      normalized.content = {
        cards: oldFormat.exercice.cartes.map((card, index) => ({
          id: card.id || `card${index + 1}`,
          recto: card.recto || card.front || card.question || "",
          verso: card.verso || card.back || card.answer || "",
          difficulty: card.difficulty || "normal"
        }))
      };

      // Copier les métadonnées
      if (oldFormat.exercice.points) normalized.points = oldFormat.exercice.points;
      if (oldFormat.exercice.titre) normalized.titre = oldFormat.exercice.titre;

      delete normalized.exercice;
      return normalized;
    }

    // Sinon, vérifier si déjà au nouveau format
    if (!normalized.content) {
      normalized.content = {
        cards: oldFormat.cards || []
      };
    }

    return normalized;
  }

  /**
   * Normalise tous les exercices d'une collection de chapitres
   * Itère sur tous les chapitres → tous les exercices → normalise selon le type
   * 
   * @param {Object|Array} chapters - Les chapitres à normaliser
   * @returns {Object|Array} Les chapitres normalisés
   */
  normalizeAll(chapters) {
    // Gérer à la fois les objets et les arrays
    const isArray = Array.isArray(chapters);
    const chaptersArray = isArray ? chapters : [chapters];

    const normalized = chaptersArray.map(chapter => {
      const normalizedChapter = { ...chapter };

      // Si le chapitre a des étapes avec exercices (data101-BT.json format)
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

      // Si le chapitre a des exercices au root level (chapitres.json format)
      if (normalizedChapter.exercices && Array.isArray(normalizedChapter.exercices)) {
        normalizedChapter.exercices = normalizedChapter.exercices.map(exercise => {
          return this._normalizeExercise(exercise);
        });
      }

      return normalizedChapter;
    });

    return isArray ? normalized : normalized[0];
  }

  /**
   * Normalise un exercice individuel selon son type
   * @private
   * 
   * @param {Object} exercise - L'exercice à normaliser
   * @returns {Object} L'exercice normalisé
   */
  _normalizeExercise(exercise) {
    this.stats.totalProcessed++;

    try {
      // Déterminer le type
      const type = exercise.type || (exercise.exercice ? exercise.exercice.type : "unknown");

      // Appliquer la normalisation selon le type
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
          
          // Si pas de content mais a d'autres propriétés de structure (matching, scenario, etc)
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
                  delete normalized[key];  // ⭐ Supprimer du niveau racine
                }
              }
              
              // Préserver les propriétés métadonnées au niveau exercise
              // Les clés gardées à la racine: id, type, titre, order, points, bloomLevel, difficulty, duree, etc.
            }
          }
      }

      // Vérifier que le résultat a la clé "content"
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

  /**
   * Calcule la réponse correcte depuis un array de choix
   * @private
   * 
   * @param {Array} choices - Array de choix avec propriété 'correct'
   * @returns {number} Index du choix correct
   */
  _calculateCorrectAnswer(choices) {
    const correctIndex = choices.findIndex(choice => choice.correct === true);
    return correctIndex >= 0 ? correctIndex : 0;
  }

  /**
   * Retourne les statistiques de normalisation
   * @returns {Object} Objet avec statistiques
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalProcessed > 0 
        ? ((this.stats.normalized / this.stats.totalProcessed) * 100).toFixed(2) + "%"
        : "N/A"
    };
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats() {
    this.stats = {
      totalProcessed: 0,
      normalized: 0,
      skipped: 0,
      errors: []
    };
  }

  /**
   * Affiche un rapport de normalisation dans la console
   */
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

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExerciseNormalizer;
}
