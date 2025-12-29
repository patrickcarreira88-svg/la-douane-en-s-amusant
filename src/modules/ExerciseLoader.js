/**
 * ExerciseLoader - Gestionnaire de chargement des exercices
 * Charge les exercices depuis Replit (API) ou fallback local
 */
class ExerciseLoader {
  constructor() {
    this.cache = {};
    this.types = ['qcm', 'dragdrop', 'fillblanks', 'matching', 'flashcards', 'scenario', 'video', 'lecture', 'quiz'];
    // URL Replit - à adapter selon l'environnement
    this.replitAPI = 'https://la-douane-en-s-amusant--patrickcarreira.replit.app';
  }

  /**
   * Charge les exercices d'un type spécifique
   * Essaie d'abord Replit, puis fallback local
   * @param {string} type - Type d'exercice (qcm, flashcards, video, etc.)
   * @returns {Promise<Array>} Array d'exercices du type
   */
  async loadByType(type) {
    try {
      // Vérifier le cache
      if (this.cache[type]) {
        console.log(`✅ ${type}: Chargé depuis cache`);
        return this.cache[type].exercises || [];
      }

      console.log(`📥 ${type}: Chargement en cours...`);
      
      let data;
      
      // 1️⃣ Essayer Replit en premier
      try {
        console.log(`🔌 ${type}: Tentative Replit...`);
        const response = await fetch(`${this.replitAPI}/api/exercises/${type}`, {
          timeout: 3000
        });
        
        if (response.ok) {
          data = await response.json();
          console.log(`✅ ${type}: Chargé depuis Replit (${data.exercises?.length || 0} exercices)`);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (replitError) {
        // 2️⃣ Fallback: charger depuis fichier local
        console.warn(`⚠️ ${type}: Replit indisponible, fallback local`, replitError.message);
        const response = await fetch(`data/exercises/${type}.json`);
        
        if (!response.ok) {
          console.error(`❌ ${type}: HTTP ${response.status} - ${response.statusText}`);
          this.cache[type] = { exercises: [] };
          return [];
        }

        data = await response.json();
        console.log(`✅ ${type}: Chargé depuis local (${data.exercises?.length || 0} exercices)`);
      }

      // Valider la structure
      if (!Array.isArray(data.exercises)) {
        console.error(`❌ ${type}: Format invalide - 'exercises' n'est pas un array`);
        this.cache[type] = { exercises: [] };
        return [];
      }

      // Stocker en cache
      this.cache[type] = data;
      console.log(`✅ ${type}: ${data.exercises.length} exercices prêts`);
      return data.exercises;

    } catch (error) {
      console.error(`❌ ${type}: Erreur lors du chargement`, error.message);
      this.cache[type] = { exercises: [] };
      return [];
    }
  }

  /**
   * Charge tous les types d'exercices en parallèle
   * @returns {Promise<Array>} Array fusionné de tous les exercices
   */
  async loadAll() {
    try {
      console.log('🔄 Chargement de tous les exercices...');
      
      // Charger tous les types en parallèle
      const promises = this.types.map(type => this.loadByType(type));
      const results = await Promise.all(promises);

      // Fusionner tous les exercices
      const allExercises = results.reduce((acc, exercises) => {
        return acc.concat(exercises);
      }, []);

      console.log(`📊 Total: ${allExercises.length} exercices chargés`);
      return allExercises;

    } catch (error) {
      console.error('❌ Erreur lors du chargement de tous les exercices', error);
      return [];
    }
  }

  /**
   * Cherche un exercice par son ID
   * @param {string} id - ID de l'exercice
   * @returns {Promise<Object|null>} Exercice trouvé ou null
   */
  async loadExerciseById(id) {
    try {
      // Si le cache est vide, charger tous les exercices
      if (Object.keys(this.cache).length === 0) {
        await this.loadAll();
      }

      // Chercher l'ID dans tous les types
      for (const type of this.types) {
        if (this.cache[type] && Array.isArray(this.cache[type].exercises)) {
          const exercise = this.cache[type].exercises.find(ex => ex.id === id);
          if (exercise) {
            console.log(`✅ Exercice trouvé: ${id} (type: ${type})`);
            return exercise;
          }
        }
      }

      console.warn(`⚠️ Exercice non trouvé: ${id}`);
      return null;

    } catch (error) {
      console.error(`❌ Erreur lors de la recherche de ${id}`, error);
      return null;
    }
  }

  /**
   * Récupère un exercice par type ET par ID
   * @param {string} type - Type d'exercice
   * @param {string} id - ID de l'exercice
   * @returns {Promise<Object|null>} Exercice trouvé ou null
   */
  async loadExerciseByTypeAndId(type, id) {
    try {
      // Charger le type s'il n'est pas en cache
      if (!this.cache[type]) {
        await this.loadByType(type);
      }

      // Chercher l'exercice
      const exercise = this.cache[type].exercises?.find(ex => ex.id === id);
      
      if (exercise) {
        console.log(`✅ ${type}/${id} trouvé`);
        return exercise;
      }

      console.warn(`⚠️ ${type}/${id} non trouvé`);
      return null;

    } catch (error) {
      console.error(`❌ Erreur lors de la recherche ${type}/${id}`, error);
      return null;
    }
  }

  /**
   * Récupère tous les exercices d'un chapitre
   * @param {string} chapterId - ID du chapitre
   * @returns {Promise<Array>} Exercices du chapitre
   */
  async loadByChapter(chapterId) {
    try {
      // Si le cache est vide, charger tous les exercices
      if (Object.keys(this.cache).length === 0) {
        await this.loadAll();
      }

      // Filtrer par chapterId
      const filtered = [];
      for (const type of this.types) {
        if (this.cache[type] && Array.isArray(this.cache[type].exercises)) {
          const matching = this.cache[type].exercises.filter(ex => ex.chapterId === chapterId);
          filtered.push(...matching);
        }
      }

      console.log(`✅ ${filtered.length} exercices trouvés pour ${chapterId}`);
      return filtered;

    } catch (error) {
      console.error(`❌ Erreur lors du filtrage ${chapterId}`, error);
      return [];
    }
  }

  /**
   * Récupère les statistiques de chargement
   * @returns {Object} Statistiques
   */
  getStats() {
    const stats = {
      total: 0,
      byType: {},
      types: []
    };

    for (const type of this.types) {
      if (this.cache[type]) {
        const count = this.cache[type].exercises?.length || 0;
        stats.byType[type] = count;
        stats.total += count;
        stats.types.push(type);
      }
    }

    return stats;
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.cache = {};
    console.log('🗑️ Cache vidé');
  }
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExerciseLoader;
}
