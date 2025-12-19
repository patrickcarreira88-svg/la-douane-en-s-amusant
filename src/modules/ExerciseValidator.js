/**
 * ExerciseValidator - Validateur d'exercices
 * Valide la structure et le contenu des exercices
 */
class ExerciseValidator {
  constructor() {
    // Champs obligatoires pour tous les exercices
    this.requiredFields = ['id', 'chapterId', 'stepId', 'title', 'type', 'points', 'content'];
    
    // Spécifications par type d'exercice
    this.typeSpecs = {
      qcm: {
        contentFields: ['question', 'options', 'correctAnswer', 'explanation'],
        validate: (content) => this._validateQCM(content)
      },
      dragdrop: {
        contentFields: ['items', 'targets'],
        validate: (content) => this._validateDragDrop(content)
      },
      fillblanks: {
        contentFields: ['text', 'blanks'],
        validate: (content) => this._validateFillBlanks(content)
      },
      matching: {
        contentFields: ['leftItems', 'rightItems', 'pairs'],
        validate: (content) => this._validateMatching(content)
      },
      flashcards: {
        contentFields: ['cards'],
        validate: (content) => this._validateFlashcards(content)
      },
      scenario: {
        contentFields: ['scenario', 'questions'],
        validate: (content) => this._validateScenario(content)
      },
      video: {
        contentFields: ['url', 'description'],
        validate: (content) => this._validateVideo(content)
      },
      lecture: {
        contentFields: ['text'],
        validate: (content) => this._validateLecture(content)
      },
      quiz: {
        contentFields: ['questions'],
        validate: (content) => this._validateQuiz(content)
      }
    };
  }

  /**
   * Valide un exercice individuel
   * @param {Object} exercise - Exercice à valider
   * @param {string} type - Type d'exercice
   * @returns {Object} {valid: boolean, errors: Array}
   */
  validateExercise(exercise, type) {
    const errors = [];

    // Vérifier que c'est un objet
    if (!exercise || typeof exercise !== 'object') {
      return { valid: false, errors: ['L\'exercice doit être un objet'] };
    }

    // Vérifier les champs obligatoires généraux
    for (const field of this.requiredFields) {
      if (!(field in exercise)) {
        errors.push(`❌ Champ obligatoire manquant: "${field}"`);
      } else if (typeof exercise[field] === 'string' && exercise[field].trim() === '') {
        errors.push(`❌ Champ vide: "${field}"`);
      }
    }

    // Vérifier le type
    if (!this.typeSpecs[type]) {
      errors.push(`❌ Type d'exercice inconnu: "${type}"`);
      return { valid: false, errors };
    }

    // Vérifier les champs spécifiques au type
    const spec = this.typeSpecs[type];
    if (spec.validate) {
      const typeErrors = spec.validate(exercise.content, exercise);
      errors.push(...typeErrors);
    }

    // Vérifier les points
    if (!Number.isInteger(exercise.points) || exercise.points <= 0) {
      errors.push(`❌ Points invalides: ${exercise.points} (doit être un entier positif)`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Valide un fichier JSON d'exercices
   * @param {Object} jsonContent - Contenu du fichier JSON
   * @param {string} type - Type d'exercice
   * @returns {Object} {valid, errors, exercisesCount}
   */
  validateExerciseFile(jsonContent, type) {
    const errors = [];

    // Vérifier la structure globale
    if (!jsonContent || typeof jsonContent !== 'object') {
      return { valid: false, errors: ['Le fichier doit être un objet'], exercisesCount: 0 };
    }

    if (!Array.isArray(jsonContent.exercises)) {
      return { valid: false, errors: ['Le fichier doit contenir un array "exercises"'], exercisesCount: 0 };
    }

    const exercises = jsonContent.exercises;
    let validCount = 0;

    // Valider chaque exercice
    exercises.forEach((exercise, index) => {
      const result = this.validateExercise(exercise, type);
      if (!result.valid && result.errors) {
        errors.push(`Exercice ${index} (${exercise.id || 'unknown'}):`);
        errors.push(...result.errors);
      } else {
        validCount++;
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      exercisesCount: exercises.length,
      validCount: validCount
    };
  }

  /**
   * Valide tous les exercices
   * @param {Array} allExercises - Tous les exercices chargés
   * @returns {Object} Rapport complet de validation
   */
  async validateAllFiles(allExercises) {
    const report = {
      valid: true,
      errors: [],
      warnings: [],
      stats: {
        total: allExercises.length,
        byType: {},
        duplicateIds: [],
        invalidChapterIds: [],
        invalidStepIds: []
      }
    };

    // Vérifier les IDs en doublon
    const idMap = {};
    for (const exercise of allExercises) {
      if (idMap[exercise.id]) {
        report.errors.push(`❌ ID en doublon: "${exercise.id}"`);
        report.stats.duplicateIds.push(exercise.id);
        report.valid = false;
      }
      idMap[exercise.id] = true;
    }

    // Compter par type
    for (const exercise of allExercises) {
      const type = exercise.type;
      if (!report.stats.byType[type]) {
        report.stats.byType[type] = 0;
      }
      report.stats.byType[type]++;

      // Valider la structure
      const validation = this.validateExercise(exercise, type);
      if (!validation.valid && validation.errors) {
        report.errors.push(...validation.errors);
        report.valid = false;
      }
    }

    // Vérifier la cohérence des chapterId (si chapitres.json est chargé)
    if (window.CHAPITRES) {
      const validChapterIds = window.CHAPITRES.map(ch => ch.id);
      for (const exercise of allExercises) {
        if (!validChapterIds.includes(exercise.chapterId)) {
          report.warnings.push(`⚠️ ChapterId invalide: "${exercise.chapterId}" (ex: ${exercise.id})`);
          report.stats.invalidChapterIds.push(exercise.chapterId);
        }
      }
    }

    // Résumé
    report.summary = {
      totalExercises: report.stats.total,
      typesFound: Object.keys(report.stats.byType).length,
      duplicateIds: report.stats.duplicateIds.length,
      invalidChapters: report.stats.invalidChapterIds.length,
      warnings: report.warnings.length,
      errors: report.errors.length
    };

    return report;
  }

  /**
   * Validateurs spécifiques par type
   */

  _validateQCM(content) {
    const errors = [];
    if (!content.question || typeof content.question !== 'string') {
      errors.push(`  ❌ QCM: "question" manquante ou invalide`);
    }
    if (!Array.isArray(content.options) || content.options.length < 2) {
      errors.push(`  ❌ QCM: "options" doit être un array avec au moins 2 options`);
    }
    if (!Number.isInteger(content.correctAnswer) || content.correctAnswer < 0) {
      errors.push(`  ❌ QCM: "correctAnswer" invalide`);
    }
    if (!content.explanation || typeof content.explanation !== 'string') {
      errors.push(`  ❌ QCM: "explanation" manquante ou invalide`);
    }
    return errors;
  }

  _validateDragDrop(content) {
    const errors = [];
    if (!Array.isArray(content.items)) {
      errors.push(`  ❌ DragDrop: "items" doit être un array`);
    }
    if (!Array.isArray(content.targets)) {
      errors.push(`  ❌ DragDrop: "targets" doit être un array`);
    }
    return errors;
  }

  _validateFillBlanks(content) {
    const errors = [];
    if (!content.text || typeof content.text !== 'string') {
      errors.push(`  ❌ FillBlanks: "text" manquant ou invalide`);
    }
    if (!Array.isArray(content.blanks)) {
      errors.push(`  ❌ FillBlanks: "blanks" doit être un array`);
    }
    return errors;
  }

  _validateMatching(content) {
    const errors = [];
    if (!Array.isArray(content.leftItems)) {
      errors.push(`  ❌ Matching: "leftItems" doit être un array`);
    }
    if (!Array.isArray(content.rightItems)) {
      errors.push(`  ❌ Matching: "rightItems" doit être un array`);
    }
    if (!Array.isArray(content.pairs)) {
      errors.push(`  ❌ Matching: "pairs" doit être un array`);
    }
    return errors;
  }

  _validateFlashcards(content) {
    const errors = [];
    if (!Array.isArray(content.cards) || content.cards.length === 0) {
      errors.push(`  ❌ Flashcards: "cards" doit être un array non-vide`);
      return errors;
    }
    content.cards.forEach((card, idx) => {
      if (!card.recto || !card.verso) {
        errors.push(`  ❌ Flashcards: Carte ${idx} manque "recto" ou "verso"`);
      }
    });
    return errors;
  }

  _validateScenario(content) {
    const errors = [];
    if (!content.scenario || typeof content.scenario !== 'object') {
      errors.push(`  ❌ Scenario: "scenario" manquant ou invalide`);
    }
    if (!Array.isArray(content.questions) || content.questions.length === 0) {
      errors.push(`  ❌ Scenario: "questions" doit être un array non-vide`);
    }
    return errors;
  }

  _validateVideo(content) {
    const errors = [];
    if (!content.url && !content.videoId) {
      errors.push(`  ❌ Video: "url" ou "videoId" requis`);
    }
    if (!content.description || typeof content.description !== 'string') {
      errors.push(`  ❌ Video: "description" manquante ou invalide`);
    }
    return errors;
  }

  _validateLecture(content) {
    const errors = [];
    if (!content.text || typeof content.text !== 'string' || content.text.trim().length === 0) {
      errors.push(`  ❌ Lecture: "text" manquant ou vide`);
    }
    return errors;
  }

  _validateQuiz(content) {
    const errors = [];
    if (!Array.isArray(content.questions) || content.questions.length === 0) {
      errors.push(`  ❌ Quiz: "questions" doit être un array non-vide`);
      return errors;
    }
    content.questions.forEach((q, idx) => {
      if (!q.question) {
        errors.push(`  ❌ Quiz: Question ${idx} sans texte`);
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`  ❌ Quiz: Question ${idx} - moins de 2 options`);
      }
      if (!Number.isInteger(q.correctAnswer)) {
        errors.push(`  ❌ Quiz: Question ${idx} - "correctAnswer" invalide`);
      }
    });
    return errors;
  }

  /**
   * Affiche un rapport de validation formaté
   */
  printReport(report) {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  📋 RAPPORT DE VALIDATION EXERCICES   ║');
    console.log('╚════════════════════════════════════════╝');
    
    console.log(`\n📊 Statistiques:`);
    console.log(`  Total: ${report.summary.totalExercises}`);
    console.log(`  Types: ${report.summary.typesFound}`);
    Object.entries(report.stats.byType).forEach(([type, count]) => {
      console.log(`    ${type}: ${count}`);
    });

    if (report.errors.length > 0) {
      console.error(`\n❌ ${report.errors.length} ERREUR(S):`);
      report.errors.forEach(err => console.error(`  ${err}`));
    } else {
      console.log(`\n✅ Aucune erreur`);
    }

    if (report.warnings.length > 0) {
      console.warn(`\n⚠️  ${report.warnings.length} AVERTISSEMENT(S):`);
      report.warnings.forEach(warn => console.warn(`  ${warn}`));
    }

    console.log(`\n${report.valid ? '✅ VALIDATION RÉUSSIE' : '❌ VALIDATION ÉCHOUÉE'}`);
  }
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExerciseValidator;
}
