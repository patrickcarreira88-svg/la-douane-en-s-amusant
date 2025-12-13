/**
 * StorageManager - Wrapper LocalStorage avec fallback
 * Gère TOUTES les données de l'application
 * 
 * Structure LocalStorage:
 * {
 *   user: { nickname, totalPoints, consecutiveDays, startDate },
 *   chaptersProgress: { ch1: { completion, etapes }, ch2: { ... } },
 *   exercisesCompleted: { ex1: true, ex2: false },
 *   badges: [ "badge1", "badge2" ],
 *   spacedRepetition: [ { exerciseId, niveau, nextReviewDate } ],
 *   journal: [ { id, date, chapter, reflection } ]
 * }
 */

const StorageManager = {
    // Clé principale
    APP_KEY: 'douane_lms_v2',
    
    /**
     * Initialise le storage avec données par défaut
     */
    init() {
        console.log('🔄 Initialisation StorageManager...');
        
        if (!this.exists()) {
            this.setDefault();
        }
        
        console.log('✅ StorageManager initialisé');
    },
    
    /**
     * Vérifie si le storage existe
     */
    exists() {
        try {
            return !!localStorage.getItem(this.APP_KEY);
        } catch (e) {
            console.warn('⚠️ LocalStorage non disponible', e);
            return false;
        }
    },
    
    /**
     * Définit les données par défaut
     */
    setDefault() {
        const defaultData = {
            user: {
                nickname: 'Apprenti Douanier',
                totalPoints: 0,
                consecutiveDays: 0,
                startDate: new Date().toISOString(),
                lastActivityDate: new Date().toISOString()
            },
            chaptersProgress: {
                ch1: {
                    title: 'Introduction Douane',
                    completion: 0,
                    stepsCompleted: [],
                    stepsLocked: [],
                    badgeEarned: false
                }
            },
            stepsPoints: {},  // Tracker les points gagnés par étape: {ch1_step1: 10, ch1_step2: 8, ...}
            exercisesCompleted: {},
            badges: [],
            spacedRepetition: [],
            journal: []
        };
        
        this.set(defaultData);
        console.log('📝 Données par défaut créées');
    },
    
    /**
     * Récupère TOUTES les données
     */
    getAll() {
        try {
            const data = localStorage.getItem(this.APP_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('❌ Erreur lecture storage', e);
            return null;
        }
    },
    
    /**
     * Sauvegarde TOUTES les données
     */
    set(data) {
        try {
            localStorage.setItem(this.APP_KEY, JSON.stringify(data));
            console.log('💾 Données sauvegardées');
            return true;
        } catch (e) {
            console.error('❌ Erreur sauvegarde storage', e);
            return false;
        }
    },
    
    /**
     * Récupère une clé spécifique
     */
    get(key) {
        const data = this.getAll();
        return data ? data[key] : null;
    },
    
    /**
     * Met à jour une clé spécifique
     */
    update(key, value) {
        const data = this.getAll();
        if (data) {
            data[key] = value;
            return this.set(data);
        }
        return false;
    },
    
    /**
     * Récupère les stats utilisateur
     */
    getUser() {
        return this.get('user') || {
            nickname: 'Apprenti Douanier',
            totalPoints: 0,
            consecutiveDays: 0
        };
    },
    
    /**
     * Met à jour les stats utilisateur
     */
    updateUser(updates) {
        const user = this.getUser();
        const updated = { ...user, ...updates };
        this.update('user', updated);
        return updated;
    },
    
    /**
     * Ajoute des points
     */
    addPoints(points = 10) {
        const user = this.getUser();
        user.totalPoints += points;
        this.update('user', user);
        console.log(`✨ +${points} points (Total: ${user.totalPoints})`);
        return user.totalPoints;
    },
    
    /**
     * Récupère les points gagnés par étape
     */
    getStepsPoints() {
        return this.get('stepsPoints') || {};
    },
    
    /**
     * Ajoute/met à jour les points pour une étape
     * Retourne: {pointsAdded, totalForStep, maxPoints}
     */
    addPointsToStep(stepId, pointsEarned, maxPoints) {
        const stepsPoints = this.getStepsPoints();
        const previousPoints = stepsPoints[stepId] || 0;
        const pointsToAdd = Math.max(0, Math.min(pointsEarned, maxPoints) - previousPoints);
        
        // Mettre à jour avec le max entre l'ancien et le nouveau score
        const newTotal = Math.max(previousPoints, Math.min(pointsEarned, maxPoints));
        stepsPoints[stepId] = newTotal;
        this.update('stepsPoints', stepsPoints);
        
        // Ajouter les points au compte utilisateur
        if (pointsToAdd > 0) {
            this.addPoints(pointsToAdd);
        }
        
        return {
            pointsAdded: pointsToAdd,
            totalForStep: newTotal,
            maxPoints: maxPoints,
            message: pointsToAdd > 0 ? `+${pointsToAdd} points!` : 'Excellent! Même score que précédemment.'
        };
    },
    
    /**
     * Récupère la progression chapitres
     */
    getChaptersProgress() {
        return this.get('chaptersProgress') || {};
    },
    
    /**
     * Met à jour progression chapitre
     */
    updateChapterProgress(chapterId, updates) {
        const chapters = this.getChaptersProgress();
        if (chapters[chapterId]) {
            chapters[chapterId] = { ...chapters[chapterId], ...updates };
            this.update('chaptersProgress', chapters);
        }
        return chapters[chapterId];
    },
    
    /**
     * Récupère les exercices complétés
     */
    getCompletedExercises() {
        return this.get('exercisesCompleted') || {};
    },
    
    /**
     * Marque un exercice comme complété
     */
    completeExercise(exerciseId) {
        const completed = this.getCompletedExercises();
        completed[exerciseId] = true;
        this.update('exercisesCompleted', completed);
        this.addPoints(10); // +10 points par exercice
        console.log(`✅ Exercice ${exerciseId} complété`);
        return completed;
    },
    
    /**
     * Récupère les badges
     */
    getBadges() {
        return this.get('badges') || [];
    },
    
    /**
     * Ajoute un badge
     */
    addBadge(badgeId) {
        const badges = this.getBadges();
        if (!badges.includes(badgeId)) {
            badges.push(badgeId);
            this.update('badges', badges);
            console.log(`🏆 Badge débloqué: ${badgeId}`);
        }
        return badges;
    },
    
    /**
     * Récupère les données spaced repetition
     */
    getSpacedRepetition() {
        return this.get('spacedRepetition') || [];
    },
    
    /**
     * Ajoute/met à jour une révision SM2
     */
    updateSpacedRep(exerciseId, niveau, nextReviewDate) {
        const sr = this.getSpacedRepetition();
        const index = sr.findIndex(item => item.exerciseId === exerciseId);
        
        if (index >= 0) {
            sr[index] = { exerciseId, niveau, nextReviewDate };
        } else {
            sr.push({ exerciseId, niveau, nextReviewDate });
        }
        
        this.update('spacedRepetition', sr);
        return sr;
    },
    
    /**
     * Récupère le journal
     */
    getJournal() {
        return this.get('journal') || [];
    },
    
    /**
     * Ajoute une entrée journal
     */
    addJournalEntry(chapterId, stepId, reflection) {
        const journal = this.getJournal();
        const entry = {
            id: `j${Date.now()}`,
            date: new Date().toISOString(),
            chapter: chapterId,
            step: stepId,
            reflection: reflection,
            mood: '😊'
        };
        
        journal.push(entry);
        this.update('journal', journal);
        console.log('📝 Entrée journal ajoutée');
        return entry;
    },
    
    /**
     * Exporte TOUTES les données (RGPD - Droit à la portabilité)
     */
    exportData() {
        const data = this.getAll();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `douane-lms-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('📥 Données exportées');
    },
    
    /**
     * Importe des données (RGPD - Droit à la portabilité)
     */
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.set(data);
                    console.log('📤 Données importées');
                    resolve(data);
                } catch (error) {
                    console.error('❌ Erreur import', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    },
    
    /**
     * Réinitialise TOUTES les données (RGPD - Droit à l'oubli)
     */
    reset() {
        if (confirm('⚠️ Voulez-vous vraiment réinitialiser toutes les données? Cette action est irréversible.')) {
            localStorage.removeItem(this.APP_KEY);
            this.setDefault();
            console.log('🗑️ Toutes les données réinitialisées');
            return true;
        }
        return false;
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    StorageManager.init();
});
