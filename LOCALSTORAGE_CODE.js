/**
 * ════════════════════════════════════════════════════════════════════
 * LOCALSTORAGE INITIALIZATION & MANAGEMENT - CODE COMPLET
 * ════════════════════════════════════════════════════════════════════
 */

/**
 * Initialise localStorage pour un chapitre
 * Crée les clés pour chaque étape avec structure par défaut
 * N'écrase PAS les données existantes
 * 
 * @param {Object} chapitre - Le chapitre à initialiser
 */
function initializeChapterStorage(chapitre) {
    if (!chapitre || !chapitre.etapes) {
        console.warn(`⚠️ Chapitre invalide pour initialisation localStorage:`, chapitre);
        return;
    }
    
    const chapitreId = chapitre.id;
    let stepsInitialized = 0;
    
    // ✅ Parcourir toutes les étapes du chapitre
    chapitre.etapes.forEach((etape, index) => {
        const stepKey = `step_${etape.id}`;
        
        // ✅ Ne CRÉER que si n'existe pas déjà
        if (localStorage.getItem(stepKey) === null) {
            const defaultStepData = {
                id: etape.id,
                chapitreId: chapitreId,
                completed: false,                    // ← Première étape NOT locked
                points: 0,
                maxPoints: etape.points || 10,
                timestamp: null,                     // Date de complétude
                attempts: 0,                         // Nombre de tentatives
                lastAttempt: null                    // Date dernière tentative
            };
            
            try {
                localStorage.setItem(stepKey, JSON.stringify(defaultStepData));
                stepsInitialized++;
            } catch (e) {
                console.error(`❌ Erreur écriture localStorage pour ${stepKey}:`, e);
            }
        }
    });
    
    // ✅ Créer aussi la clé du chapitre si n'existe pas
    const chapitreKey = `chapter_${chapitreId}`;
    if (localStorage.getItem(chapitreKey) === null) {
        const defaultChapterData = {
            id: chapitreId,
            titre: chapitre.titre,
            completed: false,
            totalSteps: chapitre.etapes.length,
            completedSteps: 0,
            totalPoints: 0,
            startedAt: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(chapitreKey, JSON.stringify(defaultChapterData));
        } catch (e) {
            console.error(`❌ Erreur écriture localStorage pour ${chapitreKey}:`, e);
        }
    }
    
    console.log(`✅ localStorage initialisé pour ${chapitreId}: ${stepsInitialized} étapes créées`);
}

/**
 * Récupère les données de progression d'une étape avec fallback par défaut
 * Utilise try/catch pour gérer les données corrompues
 * 
 * @param {string} stepId - ID de l'étape
 * @returns {Object} Objet progression avec defaults sûrs
 */
function getStepProgress(stepId) {
    const key = `step_${stepId}`;
    const defaults = {
        id: stepId,
        completed: false,
        points: 0,
        maxPoints: 10,
        timestamp: null,
        attempts: 0,
        lastAttempt: null
    };
    
    try {
        const stored = localStorage.getItem(key);
        if (!stored) {
            console.warn(`⚠️ Clé localStorage manquante: ${key}, utilisation defaults`);
            return defaults;
        }
        
        const parsed = JSON.parse(stored);
        // ✅ Fusionner avec defaults pour garantir tous les champs
        return { ...defaults, ...parsed };
    } catch (e) {
        console.error(`❌ Erreur parsing localStorage ${key}:`, e);
        return defaults;
    }
}

/**
 * Définit les données de progression d'une étape
 * Fusionne avec les données existantes pour ne pas perdre de champs
 * 
 * @param {string} stepId - ID de l'étape
 * @param {Object} data - Données à mettre à jour (fusion, pas remplacement)
 */
function setStepProgress(stepId, data) {
    const key = `step_${stepId}`;
    
    try {
        // ✅ Récupérer les données existantes
        const existing = getStepProgress(stepId);
        
        // ✅ Fusionner (pas remplacer)
        const updated = {
            ...existing,
            ...data,
            id: stepId  // ← Forcer l'ID pour éviter confusion
        };
        
        localStorage.setItem(key, JSON.stringify(updated));
        console.log(`✅ Progression mise à jour pour ${stepId}:`, updated);
    } catch (e) {
        console.error(`❌ Erreur écriture localStorage ${key}:`, e);
    }
}

/**
 * Réinitialise COMPLÈTEMENT localStorage pour un chapitre
 * Utile pour tester ou relancer le chapitre
 * ⚠️ ATTENTION: Supprime TOUS les progrès du chapitre
 * 
 * @param {string} chapitreId - ID du chapitre
 */
function resetChapterProgress(chapitreId) {
    try {
        // Trouver le chapitre dans CHAPITRES global
        const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
        if (!chapitre) {
            console.error(`❌ Chapitre non trouvé: ${chapitreId}`);
            return;
        }
        
        let stepsDeleted = 0;
        
        // ✅ Supprimer toutes les clés step_* pour ce chapitre
        chapitre.etapes.forEach(etape => {
            const stepKey = `step_${etape.id}`;
            if (localStorage.getItem(stepKey) !== null) {
                localStorage.removeItem(stepKey);
                stepsDeleted++;
            }
        });
        
        // ✅ Supprimer la clé chapter_*
        const chapitreKey = `chapter_${chapitreId}`;
        if (localStorage.getItem(chapitreKey) !== null) {
            localStorage.removeItem(chapitreKey);
        }
        
        console.log(`🔄 localStorage réinitialisé pour ${chapitreId}: ${stepsDeleted} étapes supprimées`);
        console.warn(`⚠️ ATTENTION: Tous les progrès du chapitre ${chapitreId} ont été supprimés!`);
        
        // ✅ Réinitialiser le stockage pour recommencer
        if (chapitre) {
            initializeChapterStorage(chapitre);
        }
    } catch (e) {
        console.error(`❌ Erreur réinitialisation localStorage:`, e);
    }
}

/**
 * Affiche les statistiques localStorage pour debug
 * Utile pour vérifier l'état du stockage
 * 
 * @param {string} chapitreId - ID du chapitre (optionnel, affiche tous si absent)
 */
function debugChapterStorage(chapitreId = null) {
    try {
        console.group(`📊 Debug localStorage${chapitreId ? ` - ${chapitreId}` : ''}`);
        
        let totalSteps = 0;
        let completedSteps = 0;
        let totalPoints = 0;
        
        // Parcourir toutes les clés
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key.startsWith('step_')) {
                const data = getStepProgress(key.replace('step_', ''));
                
                // Filtrer par chapitre si spécifié
                if (chapitreId && data.chapitreId !== chapitreId) {
                    continue;
                }
                
                totalSteps++;
                if (data.completed) completedSteps++;
                totalPoints += data.points;
                
                console.log(`  ${key}:`, {
                    completed: data.completed,
                    points: `${data.points}/${data.maxPoints}`,
                    attempts: data.attempts,
                    timestamp: data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'
                });
            }
        }
        
        console.log(`\n📈 Résumé: ${completedSteps}/${totalSteps} étapes complétées, ${totalPoints} points`);
        console.groupEnd();
    } catch (e) {
        console.error(`❌ Erreur affichage debug:`, e);
    }
}

// ════════════════════════════════════════════════════════════════════
// UTILISATION DANS LOCALSTORAGE
// ════════════════════════════════════════════════════════════════════
//
// 1. INITIALISATION (Automatique dans loadChapitres())
//    for (let chapitre of data.chapitres) {
//        initializeChapterStorage(chapitre);
//    }
//
// 2. RÉCUPÉRATION (Safe avec defaults)
//    const progress = getStepProgress('ch1_step1');
//    console.log(progress.completed);
//
// 3. MISE À JOUR (Fusion avec données existantes)
//    setStepProgress('ch1_step1', { completed: true, points: 25 });
//
// 4. RÉINITIALISATION (Complète avec warning)
//    resetChapterProgress('ch1');
//
// 5. DEBUG (Affiche l'état)
//    debugChapterStorage('ch1');
//
// ════════════════════════════════════════════════════════════════════
