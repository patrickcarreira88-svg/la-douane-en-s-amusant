/**
 * App.js - Contrôleur Principal
 * Gère: Routing, pages, gamification
 */

// ═══════════════════════════════════════════════════════════════
// IMPORTS ET INSTANCES GLOBALES
// ═══════════════════════════════════════════════════════════════

// Modules d'exercices
const exerciseLoader = new ExerciseLoader();
const exerciseValidator = new ExerciseValidator();
const exerciseNormalizer = new ExerciseNormalizer();

// ═══════════════════════════════════════════════════════════════
// CHARGE DES DONNÉES ET FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════

/**
 * Charge les données des chapitres depuis chapitres-N1N4.json
 */
async function loadChapitres(niveauId = 'N1') {
    try {
        const response = await fetch('data/chapitres-N1N4.json');
        if (!response.ok) throw new Error('Erreur chargement chapitres-N1N4.json');
        
        const data = await response.json();
        
        // Extraire les chapitres du niveau spécifié
        const niveau = data.niveaux.find(n => n.id === niveauId);
        if (!niveau) {
            console.warn(`⚠️ Niveau ${niveauId} non trouvé`);
            return [];
        }
        
        const chapitres = niveau.chapitres || [];
        console.log(`✅ Chapitres du niveau ${niveauId} chargés: ${chapitres.length} chapitres`);
        
        // Charger les données externes pour les chapitres qui les requièrent
        for (let chapitre of chapitres) {
            if (chapitre.externalDataFile) {
                await loadExternalChapterData(chapitre);
            }
        }
        
        // ✅ INITIALISER localStorage APRÈS chargement
        for (let chapitre of chapitres) {
            initializeChapterStorage(chapitre);
        }
        
        // Nouveau: Charger tous les exercices
        console.log('📚 Chargement exercices...');
        const allExercises = await exerciseLoader.loadAll();
        console.log(`✅ ${allExercises.length} exercices chargés`);
        
        // Valider
        const validation = await exerciseValidator.validateAllFiles(allExercises);
        if (!validation.valid) {
            console.error('❌ Erreurs validation:', validation.errors);
        } else {
            console.log('✅ Validation OK');
        }
        
        // Normaliser (compat ancien format)
        const chapitresNormalises = exerciseNormalizer.normalizeAll(chapitres);
        console.log('✅ Normalisation complète');
        console.log(`📊 Chapitres du niveau ${niveauId} normalisés:`, chapitresNormalises);
        
        return chapitresNormalises;
    } catch (error) {
        console.error('❌ Erreur chargement chapitres:', error);
        return [];
    }
}

/**
 * Vérifie si un niveau est déverrouillé
 * 
 * Règles de déblocage:
 * - N1: Toujours déverrouillé ✅
 * - N2: Déverrouillé si N1.completion === 100%
 * - N3: Déverrouillé si N2.completion === 100%
 * - N4: Déverrouillé si N3.completion === 100%
 * 
 * @param {string} niveauId - ID du niveau ('N1', 'N2', 'N3', 'N4')
 * @returns {boolean} true si déverrouillé, false si verrouillé
 */
function isNiveauUnlocked(niveauId) {
    try {
        const unlocked = StorageManager.isNiveauUnlocked(niveauId);
        const status = unlocked ? '✅ Déverrouillé' : '🔒 Verrouillé';
        console.log(`🔓 Niveau ${niveauId}: ${status}`);
        return unlocked;
    } catch (error) {
        console.error(`❌ Erreur vérification déblocage ${niveauId}:`, error);
        return false;
    }
}

/**
 * Obtient l'état d'un niveau avec complétude
 * 
 * @param {string} niveauId - ID du niveau
 * @returns {Object} { unlocked: boolean, completion: number, chapitres: number }
 */
function getNiveauState(niveauId) {
    try {
        const user = StorageManager.getUser();
        const niveau = user.niveaux?.[niveauId];
        
        if (!niveau) {
            console.warn(`⚠️ Niveau ${niveauId} non trouvé dans storage`);
            return { unlocked: false, completion: 0, chapitres: 0 };
        }
        
        return {
            unlocked: isNiveauUnlocked(niveauId),
            completion: niveau.completion || 0,
            chapitres: Object.keys(niveau.chapters || {}).length
        };
    } catch (error) {
        console.error(`❌ Erreur récupération état ${niveauId}:`, error);
        return { unlocked: false, completion: 0, chapitres: 0 };
    }
}

/**
 * Affiche les 4 niveaux avec cartes interactives
 * Génère HTML avec progress ring SVG, titre, description, statut
 * 
 * @async
 * @returns {Promise<string>} HTML des 4 niveaux
 */
async function afficherNiveaux() {
    try {
        // 1. Charger JSON
        const response = await fetch('data/chapitres-N1N4.json');
        if (!response.ok) throw new Error('Erreur chargement chapitres-N1N4.json');
        
        const data = await response.json();
        
        // 2. Vérifier structure
        if (!data.niveaux || !Array.isArray(data.niveaux)) {
            throw new Error('Structure niveaux invalide dans JSON');
        }
        
        // 3. Générer HTML des 4 niveaux
        let html = '<div class="niveaux-section">\n';
        html += '<h2>🎯 Niveaux de Formation</h2>\n';
        html += '<div class="niveaux-grid">\n';
        
        const niveaux = ['N1', 'N2', 'N3', 'N4'];
        
        niveaux.forEach(niveauId => {
            // Récupérer l'état du niveau
            const state = getNiveauState(niveauId);
            
            // Récupérer les infos du JSON
            const niveauData = data.niveaux.find(n => n.id === niveauId);
            const titre = niveauData?.titre || `Niveau ${niveauId}`;
            const description = niveauData?.description || 'Compétences essentielles';
            const couleur = niveauData?.couleur || 'E0AAFF';
            
            // Calculer offset du progress ring (circumference = 2*π*r = 2*π*54 ≈ 339)
            const circumference = 2 * Math.PI * 54;
            const strokeDashoffset = circumference * (100 - state.completion) / 100;
            
            // Générer HTML carte
            html += `
    <div class="niveau-card" data-niveau="${niveauId}" data-locked="${!state.unlocked}">
        <div class="niveau-header">
            <h3>${niveauId}</h3>
            <span class="niveau-status">${state.unlocked ? '✅' : '🔒'}</span>
        </div>
        
        <h4>${titre}</h4>
        <p class="niveau-description">${description}</p>
        
        <!-- Progress Ring SVG -->
        <svg class="progress-ring" viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r="54" class="progress-background" />
            <circle cx="60" cy="60" r="54" class="progress-fill" 
                    style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset};" />
            <text x="60" y="70" class="progress-text" text-anchor="middle">${state.completion}%</text>
        </svg>
        
        <div class="niveau-stats">
            <p class="stat"><strong>${state.chapitres}</strong> chapitres</p>
            <p class="stat"><strong>${state.completion}%</strong> complété</p>
        </div>
        
        <div class="niveau-footer">
            ${state.unlocked 
                ? `<button class="btn btn--primary btn--small" onclick="App.afficherNiveau('${niveauId}')">Commencer</button>`
                : `<button class="btn btn--disabled" disabled>Verrouillé</button>`
            }
            ${!state.unlocked 
                ? `<p class="unlock-message">🔒 Déblocage: Complétez N${parseInt(niveauId.slice(1))-1} à 100%</p>`
                : ''
            }
        </div>
    </div>
`;
        });
        
        html += '</div>\n</div>\n';
        
        console.log('✅ Niveaux HTML générés');
        return html;
        
    } catch (error) {
        console.error('❌ Erreur afficherNiveaux():', error);
        return '<p class="error">Erreur chargement des niveaux</p>';
    }
}

/**
 * ════════════════════════════════════════════════════════════════════
 * LOCALSTORAGE INITIALIZATION & MANAGEMENT
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

/**
 * Charge les données externes d'un chapitre (exercices, steps, etc.)
 * @param {object} chapitre - L'objet chapitre
 */
/**
 * Fusionne intelligemment les étapes externes avec les étapes existantes
 * @param {Array} existingEtapes - Étapes existantes du chapitre
 * @param {Array} externalEtapes - Étapes chargées du fichier externe
 * @returns {Array} Étapes fusionnées
 */
function mergeEtapes(existingEtapes = [], externalEtapes = []) {
    if (!existingEtapes || existingEtapes.length === 0) {
        return externalEtapes;
    }
    
    return existingEtapes.map((etape, index) => {
        const externalEtape = externalEtapes[index];
        
        if (!externalEtape) {
            return etape;
        }
        
        // Fusion intelligente : conserver la structure existante + ajouter les exercices
        return {
            ...etape,                                    // Copier toutes les propriétés existantes
            ...externalEtape,                            // Surcharger avec données externes
            // Fusionner les exercices (ne pas remplacer complètement)
            exercices: mergeExercices(
                etape.exercices || [],
                externalEtape.exercices || []
            ),
            // Fusionner les propriétés critiques
            id: etape.id || externalEtape.id,
            titre: etape.titre || externalEtape.titre,
            description: etape.description || externalEtape.description
        };
    });
}

/**
 * Fusionne les exercices de deux étapes
 * @param {Array} existingExercices - Exercices existants
 * @param {Array} externalExercices - Exercices externes
 * @returns {Array} Exercices fusionnés
 */
function mergeExercices(existingExercices = [], externalExercices = []) {
    if (!existingExercices || existingExercices.length === 0) {
        return externalExercices;
    }
    
    // Fusionner par index
    return existingExercices.map((exercice, index) => {
        const externalExercice = externalExercices[index];
        
        if (!externalExercice) {
            return exercice;
        }
        
        return {
            ...exercice,           // Propriétés existantes (type, titre, etc.)
            ...externalExercice,   // Données externes (questions, options, etc.)
            // Préserver l'ID du chapitre si défini
            chapitre: exercice.chapitre || externalExercice.chapitre
        };
    });
}

async function loadExternalChapterData(chapitre) {
    try {
        const response = await fetch(chapitre.externalDataFile);
        if (!response.ok) throw new Error(`Erreur chargement ${chapitre.externalDataFile}`);
        
        const externalData = await response.json();
        console.log(`✅ Données externes chargées pour ${chapitre.id}:`, externalData);
        
        // Fusionner INTELLIGEMMENT les données externes avec le chapitre
        const sourceEtapes = externalData.etapes || externalData.steps || [];
        
        if (sourceEtapes.length > 0) {
            chapitre.etapes = mergeEtapes(chapitre.etapes, sourceEtapes);
            console.log(`✅ Étapes fusionnées pour ${chapitre.id}:`, chapitre.etapes);
        }
        
        // Fusionner les métadonnées supplémentaires
        if (externalData.metadata) {
            chapitre.metadata = { ...chapitre.metadata, ...externalData.metadata };
        }
        
    } catch (error) {
        console.error(`❌ Erreur chargement données externes:`, error);
    }
}

/**
 * ════════════════════════════════════════════════════════════════════
 * DRAG-AND-DROP MANAGEMENT
 * ════════════════════════════════════════════════════════════════════
 */

/**
 * Initialise les événements drag-and-drop HTML5 pour un conteneur
 * @param {string} dragId - ID du conteneur drag-drop
 */
function initDragDrop(dragId) {
    const container = document.getElementById(dragId);
    if (!container) {
        console.warn(`❌ Container drag-drop introuvable: ${dragId}`);
        return;
    }
    
    const itemsContainer = container.querySelector('.drag-items');
    if (!itemsContainer) {
        console.warn(`❌ Conteneur d'items introuvable pour: ${dragId}`);
        return;
    }
    
    const items = itemsContainer.querySelectorAll('.drag-item');
    console.log(`✅ Initialisation drag-drop pour ${dragId} - ${items.length} items`);
    
    let draggedElement = null; // Stockage global du contexte de drag
    
    /**
     * DRAGSTART - Au commencement du drag
     * Stocke les informations de l'élément en cours de déplacement
     */
    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedElement = item;
            
            // ✅ Indiquer visuellement l'élément en cours de déplacement
            item.style.opacity = '0.5';
            item.style.transform = 'scale(0.95)';
            item.style.borderLeft = '4px solid rgba(255, 255, 255, 0.5)';
            item.style.cursor = 'grabbing';
            
            // ✅ Stocker l'ID du conteneur dans le dataTransfer
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', item.innerHTML);
            
            console.log(`🎯 Drag started: ${item.textContent.trim()}`);
        });
        
        /**
         * DRAGOVER - Lorsqu'un élément est survolé pendant le drag
         * Affiche la zone de drop active
         */
        item.addEventListener('dragover', (e) => {
            e.preventDefault(); // ⚠️ OBLIGATOIRE pour permettre le drop
            
            // Indiquer que le drop est accepté
            e.dataTransfer.dropEffect = 'move';
            
            // Afficher la zone de drop si on survole un élément différent
            if (draggedElement && draggedElement !== item) {
                item.style.backgroundColor = 'rgba(76, 175, 80, 0.3)'; // Vert semi-transparent
                item.style.borderTop = '3px solid rgba(76, 175, 80, 0.8)';
                item.style.transform = 'scale(1.02)';
            }
        });
        
        /**
         * DRAGLEAVE - Lorsqu'on quitte un élément pendant le drag
         * Nettoie les styles de drop active
         */
        item.addEventListener('dragleave', (e) => {
            if (draggedElement !== item) {
                item.style.backgroundColor = '';
                item.style.borderTop = '';
                // Ne pas réinitialiser le transform ici si c'est pas draggedElement
            }
        });
        
        /**
         * DROP - Lorsqu'on relâche l'élément draggé
         * Exécute l'échange d'éléments dans le DOM
         */
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Nettoyer les styles
            item.style.backgroundColor = '';
            item.style.borderTop = '';
            item.style.transform = '';
            
            // Si c'est un vrai drop (pas sur le même élément)
            if (draggedElement && draggedElement !== item) {
                // ✅ VRAI SWAP DOM : utiliser insertBefore pour un vrai échange
                const allItems = Array.from(itemsContainer.querySelectorAll('.drag-item'));
                const draggedIndex = allItems.indexOf(draggedElement);
                const targetIndex = allItems.indexOf(item);
                
                // Insérer l'élément draggé à la bonne place
                if (draggedIndex < targetIndex) {
                    item.parentElement.insertBefore(draggedElement, item.nextSibling);
                } else {
                    item.parentElement.insertBefore(draggedElement, item);
                }
                
                console.log(`✅ Éléments échangés: position ${draggedIndex} ↔ position ${targetIndex}`);
                
                // ✅ Mettre à jour les data-attributes avec les positions actuelles
                const updatedItems = itemsContainer.querySelectorAll('.drag-item');
                updatedItems.forEach((el, idx) => {
                    el.setAttribute('data-current-position', idx);
                    // ✅ Réinitialiser les styles IMMÉDIATEMENT après swap
                    el.style.opacity = '1';
                    el.style.backgroundColor = '';
                    el.style.borderTop = '';
                    el.style.transform = '';
                    el.style.borderLeft = '4px solid transparent';
                    el.style.cursor = 'move';
                });
                
                // ✅ Mettre à jour le stockage DRAG_DATA
                updateDragOrder(dragId);
            }
        });
        
        /**
         * DRAGEND - À la fin du drag (avec ou sans drop)
         * Nettoie tous les styles temporaires
         */
        item.addEventListener('dragend', (e) => {
            // ✅ NETTOYER TOUS LES STYLES COMPLÈTEMENT
            itemsContainer.querySelectorAll('.drag-item').forEach(el => {
                el.style.opacity = '1';
                el.style.backgroundColor = '';
                el.style.borderTop = '';
                el.style.transform = '';
                el.style.borderLeft = '4px solid transparent';
                el.style.cursor = 'move';
            });
            
            draggedElement = null; // Réinitialiser le référence
            console.log(`🔚 Drag ended - Tous les styles réinitialisés`);
        });
    });
    
    console.log(`✅ Événements drag-drop attachés pour ${dragId}`);
}

/**
 * Met à jour l'ordre des éléments après drag-drop
 * @param {string} dragId - ID du conteneur
 */
function updateDragOrder(dragId) {
    const container = document.getElementById(dragId);
    if (!container || !window.DRAG_DATA?.[dragId]) return;
    
    const items = container.querySelectorAll('.drag-item');
    const newOrder = Array.from(items).map((item, idx) => ({
        id: item.dataset.itemId,
        position: idx,
        correctPosition: parseInt(item.dataset.correctPosition)
    }));
    
    window.DRAG_DATA[dragId].currentOrder = newOrder;
    console.log(`✅ Ordre mis à jour:`, newOrder);
}

/**
 * Valide l'ordre des éléments drag-drop et attribue les points
 * @param {string} dragId - ID du conteneur drag-drop
 */
function initDragDropValidation(dragId) {
    const container = document.getElementById(dragId);
    const feedbackDiv = document.getElementById(`feedback_${dragId}`);
    
    if (!container || !feedbackDiv || !window.DRAG_DATA?.[dragId]) {
        console.error(`❌ Validation impossible pour ${dragId}`);
        return;
    }
    
    const dragData = window.DRAG_DATA[dragId];
    const items = container.querySelectorAll('.drag-item');
    
    // Vérifier l'ordre correct
    let isCorrect = true;
    const correctPositions = dragData.items.map(item => 
        item.correctPosition !== undefined ? item.correctPosition : dragData.items.indexOf(item)
    );
    
    items.forEach((item, currentIdx) => {
        const itemId = item.dataset.itemId || item.dataset.itemId;
        const correctPos = parseInt(item.dataset.correctPosition);
        
        if (correctPos !== currentIdx) {
            isCorrect = false;
            item.style.borderLeft = '4px solid #f44336'; // Rouge pour erreur
        } else {
            item.style.borderLeft = '4px solid #4caf50'; // Vert pour correct
        }
    });
    
    // Afficher le feedback
    if (isCorrect) {
        feedbackDiv.innerHTML = `
            <div style="background: rgba(76, 175, 80, 0.1); border-left: 4px solid #4caf50; padding: var(--spacing-md); border-radius: var(--radius-md); color: #2e7d32; font-weight: 600;">
                ✅ Bravo! L'ordre est correct!
            </div>
        `;
        feedbackDiv.style.display = 'block';
        
        // ✅ Ajouter les points
        if (dragData.exerciseId) {
            const points = 25; // Points par défaut
            addPoints(points);
            console.log(`✅ +${points} points pour l'exercice ${dragData.exerciseId}`);
        }
    } else {
        feedbackDiv.innerHTML = `
            <div style="background: rgba(244, 67, 54, 0.1); border-left: 4px solid #f44336; padding: var(--spacing-md); border-radius: var(--radius-md); color: #c62828; font-weight: 600;">
                ❌ L'ordre n'est pas correct. Réessayez!
            </div>
        `;
        feedbackDiv.style.display = 'block';
    }
    
    console.log(`📊 Validation drag-drop: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
}

/**
 * ════════════════════════════════════════════════════════════════════
 * EXERCICE FORMAT NORMALIZATION
 * ════════════════════════════════════════════════════════════════════
 */

/**
 * Normalise un exercice d'un ancien format vers le format unifié
 * Convertit automatiquement les champs incompatibles
 * @param {Object} exercice - L'exercice à normaliser
 * @returns {Object} Exercice au format unifié
 */
function normalizeExercise(exercice) {
    if (!exercice || typeof exercice !== 'object') {
        return exercice;
    }
    
    // ✅ Créer une copie pour ne pas modifier l'original
    const normalized = { ...exercice };
    
    // ✅ Si le format est déjà moderne (a une clé 'content'), retourner tel quel
    if (normalized.content && typeof normalized.content === 'object') {
        return normalized;
    }
    
    /**
     * CONVERSION FORMAT ANCIEN → FORMAT UNIFIÉ
     * Détecte et convertit les champs spécifiques à chaque type d'exercice
     */
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1️⃣ QCM: "choix" → "options"
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (normalized.type === 'qcm' && normalized.choix && !normalized.content) {
        normalized.content = {
            question: normalized.question || 'Question',
            options: normalized.choix.map(choice => choice.texte || choice),
            correctAnswer: normalized.choix.findIndex(c => c.correct === true),
            explanation: normalized.explication || ''
        };
        delete normalized.choix;
        delete normalized.question;
        delete normalized.explication;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2️⃣ VRAI/FAUX: "affirmations" → "items"
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (normalized.type === 'true_false' && normalized.affirmations && !normalized.content) {
        normalized.content = {
            items: normalized.affirmations.map(aff => ({
                statement: aff.texte || aff.affirmation || aff,
                answer: aff.correct === true || aff.answer === true
            }))
        };
        delete normalized.affirmations;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3️⃣ DRAG-DROP: "items" → "content.items"
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (normalized.type === 'drag_drop' && normalized.items && !normalized.content) {
        normalized.content = {
            items: normalized.items
        };
        delete normalized.items;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 4️⃣ MATCHING: "paires" → "content.pairs"
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (normalized.type === 'matching' && normalized.paires && !normalized.content) {
        normalized.content = {
            pairs: normalized.paires
        };
        delete normalized.paires;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 5️⃣ LIKERT SCALE: "items" → "content.items"
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (normalized.type === 'likert_scale' && normalized.items && !normalized.content) {
        normalized.content = {
            items: normalized.items
        };
        delete normalized.items;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 6️⃣ FLASHCARDS: "cartes" → "content.cards"
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (normalized.type === 'flashcards' && normalized.cartes && !normalized.content) {
        normalized.content = {
            cards: normalized.cartes
        };
        delete normalized.cartes;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 7️⃣ LECTURE: "texte" → "content.text"
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (normalized.type === 'lecture' && normalized.texte && !normalized.content) {
        normalized.content = {
            text: normalized.texte
        };
        delete normalized.texte;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 8️⃣ QUIZ: "questions" → "content.questions"
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (normalized.type === 'quiz' && normalized.questions && !normalized.content) {
        normalized.content = {
            questions: normalized.questions
        };
        delete normalized.questions;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 9️⃣ VIDEO: Pas de conversion nécessaire (déjà OK)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    console.log(`✅ Exercice ${normalized.id || normalized.type} normalisé:`, normalized);
    return normalized;
}

// Stocker les chapitres globalement
let CHAPITRES = [];
// Alias pour faciliter debug console
window.CHAPTERS = CHAPITRES;

/**
 * Charge et affiche les objectifs du chapitre sélectionné
 * @param {string} chapitreId - ID du chapitre
 * @returns {array} Tableau des objectifs
 */
function getChapitreObjectifs(chapitreId) {
  const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
  if (!chapitre || !chapitre.objectifs) {
    console.warn(`Aucun objectif trouvé pour ${chapitreId}`);
    return [];
  }
  return chapitre.objectifs;
}

/**
 * Génère le SVG du chemin serpentin
 */
function generatePathSVG(etapes, chapitre = null) {
    const stepSize = 60;
    const spacing = 100;
    const verticalSpacing = 120;
    const lineWidth = 3;
    const lineColor = '#C77DFF';
    
    let positions = [];
    let row = 0;
    let col = 0;
    
    // ✅ AJOUTER LES JALONS SPÉCIAUX
    let allItems = [];
    
    // 1. Jalon Objectifs en premier
    if (chapitre && chapitre.objectifs) {
        allItems.push({
            id: `objectives-${chapitre.id}`,
            titre: 'Objectifs du chapitre',
            completed: false,
            isObjectives: true,
            chapitre: chapitre
        });
    }
    
    // 2. Ajouter les étapes
    allItems.push(...etapes);
    
    // 3. Jalon Portfolio à la fin (et au milieu si > 10 étapes)
    if (chapitre && chapitre.objectifs) {
        const totalItems = allItems.length;
        
        // Si plus de 10 étapes, ajouter portfolio au milieu aussi
        if (totalItems > 10) {
            const midPoint = Math.floor(totalItems / 2);
            allItems.splice(midPoint, 0, {
                id: `portfolio-mid-${chapitre.id}`,
                titre: 'Plan de révision (Checkpoint)',
                completed: false,
                isPortfolio: true,
                isMidpoint: true,
                chapitre: chapitre
            });
        }
        
        // Ajouter portfolio à la fin
        allItems.push({
            id: `portfolio-${chapitre.id}`,
            titre: 'Plan de révision final',
            completed: false,
            isPortfolio: true,
            chapitre: chapitre
        });
    }
    
    // Calculer les positions
    allItems.forEach((item, index) => {
        const x = col * spacing + 50;
        const y = row * verticalSpacing + 50;
        positions.push({ x, y, step: item, index });
        
        col++;
        if (col >= 5) {
            col = 0;
            row++;
        }
    });
    
    let lines = '';
    for (let i = 0; i < positions.length - 1; i++) {
        const from = positions[i];
        const to = positions[i + 1];
        
        lines += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" 
                        stroke="${lineColor}" stroke-width="${lineWidth}" 
                        stroke-dasharray="5,5" opacity="0.5"/>`;
    }
    
    let steps = '';
    positions.forEach(({ x, y, step, index }) => {
        // ✅ NOUVEAU : Charger l'état réel depuis localStorage
        let isCompleted = step.completed;
        
        if (step.id && !step.isObjectives && !step.isPortfolio) {
            const progress = localStorage.getItem(`step_${step.id}`);
            if (progress) {
                try {
                    const parsed = JSON.parse(progress);
                    isCompleted = parsed.completed === true;
                } catch (e) {
                    console.error('Erreur parsing localStorage:', e);
                    isCompleted = false;
                }
            }
        }
        
        const isLocked = index > 0 && !positions[index - 1].step.completed;
        const isObjectives = step.isObjectives;
        const isPortfolio = step.isPortfolio;
        
        let bgColor = '#95A5A6';
        let emoji = '🔒';
        
        // ✅ COULEURS SPÉCIALES POUR LES JALONS
        if (isObjectives) {
            bgColor = '#6B5B95';  // Pourpre spécial
            emoji = '📋';         // Symbole objectifs
        } else if (isPortfolio) {
            bgColor = '#FF6B9D';  // Rose/magenta spécial
            emoji = '🎯';         // Symbole portfolio
        } else if (isCompleted) {
            bgColor = '#2ECC71';
            emoji = '✅';
        } else if (!isLocked) {
            bgColor = '#F39C12';
            emoji = '⚡';
        }
        
        steps += `
            <g class="step-group" data-step-id="${step.id}" data-is-objectives="${isObjectives}" data-is-portfolio="${isPortfolio}" data-is-midpoint="${step.isMidpoint || false}">
                <rect x="${x - stepSize/2}" y="${y - stepSize/2}" 
                      width="${stepSize}" height="${stepSize}" 
                      rx="12" fill="${bgColor}" 
                      stroke="${lineColor}" stroke-width="2"
                      class="step-box"/>
                <text x="${x}" y="${y + 8}" 
                      text-anchor="middle" font-size="28" 
                      class="step-emoji">${emoji}</text>
                <title>${step.titre}</title>
                <!-- ✅ SUPPRIMÉ: Affichage des titres sous les icônes (trop chargé visuellement) -->
            </g>
        `;
        console.log("Titres supprimés du SVG");
    });
    
    const width = 550;
    const height = Math.max(200, (Math.floor((allItems.length - 1) / 5) + 1) * verticalSpacing + 100);
    
    return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
             class="path-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <style>
                    .step-box {
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    .step-box:hover {
                        filter: brightness(1.1);
                    }
                    .step-emoji {
                        pointer-events: none;
                    }
                </style>
            </defs>
            ${lines}
            ${steps}
        </svg>
    `;
}

/**
 * Affiche une notification stylisée au centre de l'écran
 */
function showSuccessNotification(title, message, icon = '🎉', duration = 2000) {
    const existingNotif = document.getElementById('success-notification');
    if (existingNotif) existingNotif.remove();
    
    const notif = document.createElement('div');
    notif.id = 'success-notification';
    notif.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px 60px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        min-width: 350px;
        animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    notif.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 15px; animation: bounce 0.6s ease-in-out;">${icon}</div>
        <h2 style="margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">${title}</h2>
        <p style="margin: 0; font-size: 16px; opacity: 0.95;">${message}</p>
    `;
    
    document.body.appendChild(notif);
    
    // Ajouter les animations CSS si elles n'existent pas
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translate(-50%, -60%);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, -50%);
                    opacity: 1;
                }
            }
            
            @keyframes bounce {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translate(-50%, -50%);
                    opacity: 1;
                }
                to {
                    transform: translate(-50%, -60%);
                    opacity: 0;
                }
            }
            
            @keyframes shake {
                0%, 100% {
                    transform: rotate(0deg);
                }
                25% {
                    transform: rotate(-10deg);
                }
                75% {
                    transform: rotate(10deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Supprimer après la durée
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => notif.remove(), 400);
    }, duration);
}

/**
 * Affiche une notification d'erreur stylisée
 */
function showErrorNotification(message, duration = 2000) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #E74C3C 0%, #C0392B 100%);
        color: white;
        padding: 30px 40px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(231, 76, 60, 0.3);
        z-index: 10000;
        text-align: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        max-width: 90%;
    `;
    
    notif.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 15px; animation: bounce 0.6s ease-in-out;">⚠️</div>
        <p style="margin: 0; font-size: 16px; opacity: 0.95;">${message}</p>
    `;
    
    document.body.appendChild(notif);
    
    // Supprimer après la durée
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => notif.remove(), 400);
    }, duration);
}

// ═══════════════════════════════════════════════════════════════
// GESTION VIDÉOS MODULE 101AB
// ═══════════════════════════════════════════════════════════════

/**
 * Charger module vidéo du chapitre
 * S'appelle automatiquement quand on clique sur un chapitre
 */
async function loadChapterVideos(chapterId) {
  try {
    const response = await fetch('/assets/videos/101ab/video-manifest.json');
    const manifest = await response.json();
    
    // Filtrer vidéos du chapitre
    const chapterVideos = manifest.videos.filter(v => v.module === chapterId);
    
    console.log(`🎬 ${chapterVideos.length} vidéos trouvées pour ${chapterId}`);
    
    chapterVideos.forEach(video => {
      renderVideoPlayer(video);
    });
    
  } catch (error) {
    console.error('❌ Erreur chargement vidéos:', error);
  }
}

/**
 * Afficher composant vidéo dans le DOM
 */
function renderVideoPlayer(videoData) {
  const container = document.querySelector(`[data-step-id="${videoData.stepId}"]`);
  
  if (!container) {
    console.warn('⚠️ Conteneur non trouvé pour:', videoData.stepId);
    return;
  }

  // Vérifier si vidéo déjà présente
  if (container.querySelector('video-player')) {
    return;
  }

  // Créer élément vidéo
  const videoElement = document.createElement('video-player');
  videoElement.setAttribute('video-id', videoData.id);
  videoElement.setAttribute('title', videoData.title);
  videoElement.className = 'video-player-container';

  // Insérer dans le conteneur
  container.appendChild(videoElement);

  // Listener pour complétude vidéo
  videoElement.addEventListener('video-completed', (e) => {
    handleVideoCompleted(videoData, e.detail);
  });

  console.log('✅ Vidéo insertée:', videoData.title);
}

/**
 * Gestion complétude vidéo
 * - Déverrouille étape suivante
 * - Attribue points
 * - Met à jour progression
 */
function handleVideoCompleted(videoData, completionData) {
  console.log('✅ Vidéo complétée:', videoData.title);
  
  // Ajouter points au total
  if (App.addPoints) {
    App.addPoints(completionData.points, `Vidéo: ${videoData.title}`);
  }

  // Déverrouiller exercices associés
  if (videoData.relatedExercises && videoData.relatedExercises.length > 0) {
    console.log(`🔓 Déverrouillage ${videoData.relatedExercises.length} exercices`);
  }

  // Mettre à jour progression module
  if (App.updateChapterProgress) {
    App.updateChapterProgress(videoData.module);
  }
}

/**
 * Adapter bitrate en fonction vitesse réseau
 */
function getOptimalBitrate() {
  if (!navigator.connection) return '720p';

  const effectiveType = navigator.connection.effectiveType;
  const downlink = navigator.connection.downlink;

  if (effectiveType === '4g' && downlink >= 5) {
    return '720p';
  } else if (effectiveType === '3g' || downlink < 5) {
    return '480p';
  } else {
    return '360p';
  }
}

/**
 * Envoyer événement tracking
 */
function trackEvent(eventName, data = {}) {
  console.log(`📊 Event: ${eventName}`, data);
  
  if (window.analytics) {
    window.analytics.track(eventName, data);
  }
}

// ═══════════════════════════════════════════════════════════════
// OBJET APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const App = {
    currentPage: 'accueil',
    eventsAttached: false,
    
    init() {
        console.log('🚀 Initialisation App...');
        
        // Vérifier si le profil doit être créé au premier démarrage
        const user = StorageManager.getUser();
        if (!user.profileCreated) {
            console.log('📝 Premier démarrage détecté - affichage modal création profil');
            this.showProfileCreationModal();
            return; // Ne pas continuer l'initialisation jusqu'à création du profil
        }
        
        this.loadPage('accueil');
        
        if (!this.eventsAttached) {
            this.setupNavigation();
            this.eventsAttached = true;
        }
        
        this.updateHeader();
        
        console.log('✅ App initialisée');
    },
    
    setupNavigation() {
        console.log('🔗 Attachement événements navigation...');
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });
    },

    /**
     * Ajouter des points à l'utilisateur
     */
    addPoints(points, reason = '') {
        const user = StorageManager.getUser();
        user.totalPoints = (user.totalPoints || 0) + points;
        StorageManager.updateUser(user);
        
        console.log(`⭐ +${points} points${reason ? ' (' + reason + ')' : ''}`);
        
        // Mettre à jour header
        this.updateHeader();
        
        // Afficher notification
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage(`⭐ +${points} points! ${reason}`);
        }
    },

    /**
     * Mettre à jour progression chapitre
     */
    updateChapterProgress(chapterId) {
        console.log(`📊 Mise à jour progression: ${chapterId}`);
        
        const user = StorageManager.getUser();
        if (!user.chaptersProgress) user.chaptersProgress = {};
        
        const chapitre = CHAPITRES.find(ch => ch.id === chapterId);
        if (chapitre) {
            const completedSteps = chapitre.etapes.filter(e => e.completed).length;
            const totalSteps = chapitre.etapes.length;
            const percentage = Math.round((completedSteps / totalSteps) * 100);
            
            user.chaptersProgress[chapterId] = {
                completed: completedSteps,
                total: totalSteps,
                percentage: percentage,
                lastUpdated: new Date().toISOString()
            };
            
            StorageManager.updateUser(user);
        }
    },
    
    navigateTo(pageName) {
        console.log(`📖 Navigation vers: ${pageName}`);
        
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        this.loadPage(pageName);
        this.currentPage = pageName;
    },
    
    loadPage(pageName) {
        const content = document.getElementById('app-content');
        
        if (!content) {
            console.error('❌ #app-content non trouvé!');
            return;
        }
        
        // ✅ TRACKER LA PAGE COURANTE
        window.currentPageName = pageName;
        console.log(`📄 Chargement page: ${pageName}`);
        
        let html = '';
        
        switch (pageName) {
            case 'accueil':
                html = this.renderAccueil();
                break;
            case 'chapitres':
                html = this.renderChapitres();
                break;
            case 'pratique':
                html = this.renderPratique();
                break;
            case 'journal':
                html = this.renderJournal();
                break;
            case 'profil':
                html = this.renderProfil();
                break;
            default:
                html = `<p>Page non trouvée</p>`;
        }
        
        content.innerHTML = html;
        this.attachPageEvents(pageName);
    },
    
    attachPageEvents(pageName) {
        console.log(`📌 Événements pour ${pageName} attachés`);

        if (pageName === 'accueil') {
            // ✅ CHARGER LES NIVEAUX dynamiquement
            afficherNiveaux().then(niveauxHtml => {
                const container = document.getElementById('niveaux-container-accueil');
                if (container) {
                    container.innerHTML = niveauxHtml;
                    console.log('✅ Niveaux chargés dans accueil');
                }
            }).catch(error => {
                console.error('❌ Erreur chargement niveaux:', error);
            });
            
            document.querySelectorAll('.chapitre-card-accueil').forEach(card => {
                card.addEventListener('click', () => {
                    const chapitreId = card.dataset.chapitreId;
                    console.log(`📖 Clic chapitre: ${chapitreId}`);
                    App.navigateTo('chapitres');
                    setTimeout(() => {
                        App.afficherChapitre(chapitreId);
                    }, 100);
                });
            });
        }

        if (pageName === 'chapitres') {
            // Attacher les event listeners aux cartes chapitres
            document.querySelectorAll('.chapitre-card').forEach(card => {
                card.addEventListener('click', () => {
                    const chapitreId = card.dataset.chapitreId;
                    if (chapitreId) {
                        console.log(`📖 Clic chapitre: ${chapitreId}`);
                        App.afficherChapitre(chapitreId);
                    }
                });
            });
        }
    },

    /**
     * Affiche un chapitre spécifique
     */
    afficherChapitre(chapitreId) {
        // ✅ Afficher directement le contenu (chemin SVG)
        this.afficherChapitreContenu(chapitreId);
    },
    
    /**
     * Affiche les chapitres d'un niveau spécifique
     * @param {string} niveauId - ID du niveau (N1, N2, N3, N4)
     */
    async afficherNiveau(niveauId) {
        try {
            // 1. Vérifier déblocage
            if (!isNiveauUnlocked(niveauId)) {
                console.warn(`❌ Niveau ${niveauId} verrouillé`);
                alert(`❌ Le niveau ${niveauId} est verrouillé.\n\nDéblocage: Complétez le niveau précédent à 100%.`);
                return;
            }
            
            console.log(`📚 Chargement niveau ${niveauId}`);
            
            // 2. Charger chapitres du niveau
            CHAPITRES = await loadChapitres(niveauId);
            
            if (!CHAPITRES || CHAPITRES.length === 0) {
                console.warn(`⚠️ Aucun chapitre pour ${niveauId}`);
                alert(`⚠️ Le niveau ${niveauId} n'a pas encore de chapitres.`);
                return;
            }
            
            // 3. Créer container
            const container = document.getElementById('app-content');
            if (!container) {
                console.error('❌ Container #app-content manquant');
                return;
            }
            
            // 4. Générer HTML
            let html = `
                <div class="niveau-view">
                    <button class="btn btn--secondary" onclick="App.navigateTo('accueil')" style="margin-bottom: 20px;">
                        ← Retour aux niveaux
                    </button>
                    <h1>📚 ${niveauId} - Chapitres</h1>
                    <div class="chapitres-list">
            `;
            
            // 5. Boucler chapitres
            const chapitresArray = Array.isArray(CHAPITRES) ? CHAPITRES : Object.values(CHAPITRES);
            
            chapitresArray.forEach(chapitre => {
                if (!chapitre || !chapitre.id) return;
                
                const completion = chapitre.progression || 0;
                const chapId = chapitre.id;
                const titre = chapitre.titre || chapitre.id;
                const description = chapitre.description || '';
                const etapes = chapitre.etapes?.length || 0;
                const exercices = chapitre.exercices?.length || 0;
                
                // Déterminer l'icône et le texte du bouton
                let btnText = 'Commencer';
                let btnIcon = '▶';
                if (completion === 100) {
                    btnText = 'Réviser';
                    btnIcon = '🔄';
                } else if (completion > 0) {
                    btnText = 'Continuer';
                    btnIcon = '▶';
                }
                
                html += `
                    <div class="chapitre-card" data-chapitre="${chapId}" style="border-left: 5px solid ${chapitre.couleur || '#C77DFF'};">
                        <div class="chapitre-header">
                            <h3>${chapitre.emoji || '📖'} ${titre}</h3>
                            <span class="chapitre-status">${completion}%</span>
                        </div>
                        <p class="chapitre-description">${description}</p>
                        <div class="chapitre-meta">
                            <span>📝 ${etapes} étapes</span>
                            <span>•</span>
                            <span>✏️ ${exercices} exercices</span>
                        </div>
                        <div class="chapitre-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${completion}%;"></div>
                            </div>
                        </div>
                        <button class="btn btn--primary" onclick="App.afficherChapitre('${chapId}')" style="width: 100%;">
                            ${btnIcon} ${btnText}
                        </button>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
            
            // 6. Injecter HTML
            container.innerHTML = html;
            console.log(`✅ ${niveauId}: ${chapitresArray.length} chapitres affichés`);
            
        } catch (error) {
            console.error(`❌ Erreur afficherNiveau(${niveauId}):`, error);
            alert('Erreur lors du chargement du niveau');
        }
    },
    
    /**
     * Affiche une étape (simple et fonctionnelle)
     * @param {string} chapitreId - ID du chapitre
     * @param {number|string} stepIndexOrId - Index de l'étape ou ID
     */
    afficherEtape(chapitreId, stepIndexOrId) {
        // ✅ Chercher le chapitre dans TOUS les niveaux (pas juste CHAPITRES global)
        let chapitre = null;
        
        // D'abord chercher dans CHAPITRES (variable globale du niveau courant)
        if (CHAPITRES && Array.isArray(CHAPITRES)) {
            chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
        }
        
        // Si pas trouvé, chercher dans tous les niveaux (si chargés)
        if (!chapitre && window.allNiveaux) {
            for (let niveauId in window.allNiveaux) {
                const chapitres = window.allNiveaux[niveauId];
                if (Array.isArray(chapitres)) {
                    chapitre = chapitres.find(ch => ch.id === chapitreId);
                    if (chapitre) break;
                }
            }
        }
        
        if (!chapitre) {
            console.error(`❌ Chapitre ${chapitreId} non trouvé dans tous les niveaux`);
            return;
        }

        // Déterminer l'index de l'étape
        let index = 0;
        if (typeof stepIndexOrId === 'number') {
            index = stepIndexOrId;
        } else if (typeof stepIndexOrId === 'string') {
            // Si c'est un ID, chercher l'index
            index = chapitre.etapes.findIndex(e => e.id === stepIndexOrId);
            if (index === -1) {
                console.error(`❌ Étape ${stepIndexOrId} non trouvée`);
                return;
            }
        }

        const etape = chapitre.etapes[index];
        if (!etape) {
            console.error(`❌ Étape ${index} n'existe pas`);
            return;
        }

        const totalEtapes = chapitre.etapes.length;
        const progression = Math.round(((index + 1) / totalEtapes) * 100);

        // ✅ Seulement refuse si étape > 0 ET étape précédente non complétée
        if (index > 0 && !chapitre.etapes[index - 1].completed) {
            alert('⛔ Complétez l\'étape précédente d\'abord!');
            return;
        }

        // Construire le HTML
        let html = `
            <div class="etape-view">
                <button class="btn btn--secondary" onclick="App.afficherChapitreContenu('${chapitreId}')" style="margin-bottom: 20px;">
                    ← Retour au chapitre
                </button>

                <div class="etape-header" style="background: linear-gradient(135deg, ${chapitre.couleur} 0%, rgba(${chapitre.couleur}, 0.7) 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <h1 style="margin: 0 0 10px 0; font-size: 1.8em; color: var(--color-text);">${etape.emoji || '📖'} ${etape.titre}</h1>
                        <p style="margin: 0; opacity: 0.9; color: var(--color-text-light);">${etape.contenu || ''}</p>
                    </div>
                    <div style="text-align: right; opacity: 0.9; white-space: nowrap; color: var(--color-text-light);">
                        <div>⏱️ ${etape.duree || '-'}</div>
                        <div>🎯 ${etape.points || 0} pts</div>
                    </div>
                </div>

                <div class="etape-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progression}%;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.9em; color: var(--color-text-light);">
                        <span>Étape ${index + 1} / ${totalEtapes}</span>
                        <span>${progression}%</span>
                    </div>
                </div>

                <div class="etape-content" id="etape-exercices">
                    <!-- Exercices ici -->
                </div>

                <div class="etape-navigation" style="display: flex; gap: 12px; margin-top: 30px; justify-content: space-between;">
                    ${index > 0 ? `
                        <button class="btn btn--secondary" onclick="App.afficherEtape('${chapitreId}', ${index - 1})">
                            ← Étape précédente
                        </button>
                    ` : `
                        <div></div>
                    `}
                    
                    ${index < totalEtapes - 1 ? `
                        <button class="btn btn--primary" onclick="App.nextEtape('${chapitreId}', ${index})">
                            Étape suivante →
                        </button>
                    ` : `
                        <button class="btn btn--success" onclick="App.completerChapitre('${chapitreId}')" style="background: #2ECC71; border: none; color: white;">
                            ✅ Terminer le chapitre
                        </button>
                    `}
                </div>
            </div>
        `;

        // Injecter
        document.getElementById('app-content').innerHTML = html;
        console.log(`✅ Étape ${index + 1}/${totalEtapes} affichée: ${etape.titre}`);

        // ✅ Détecter si l'étape a des exercices
        const hasExercises = etape.exercices && etape.exercices.length > 0;

        if (!hasExercises) {
            // 🎬 Vidéo seule = auto-complète (passable immédiatement)
            StorageManager.saveEtapeState(chapitreId, index, {
                visited: true,
                completed: true,
                status: 'completed'
            });
            console.log(`🎬 Étape vidéo seule → auto-complétée`);
        } else {
            // 📝 Avec exercices = in_progress (user doit valider)
            StorageManager.saveEtapeState(chapitreId, index, {
                visited: true,
                completed: false,
                status: 'in_progress'
            });
            console.log(`📝 Étape avec exercices → in_progress`);
        }

        // Remplir exercices
        setTimeout(() => {
            this.remplirExercicesEtape(etape);
        }, 100);
    },

    /**
     * Complète l'étape actuelle et avance à la suivante
     * Utilise localStorage directement (bypass StorageManager)
     */
    nextEtape(chapitreId, etapeIndex) {
        // ✅ DIRECT localStorage - clé simple et fiable
        localStorage.setItem(`etape_${chapitreId}_${etapeIndex}_completed`, 'true');
        console.log(`✅ Étape ${etapeIndex} marquée completed via localStorage`);
        
        // ✅ Avancer à l'étape suivante
        this.afficherEtape(chapitreId, etapeIndex + 1);
    },

    /**
     * Remplir les exercices de l'étape
     */
    remplirExercicesEtape(etape) {
        const container = document.getElementById('etape-exercices');
        if (!container) return;

        if (!etape.exercices || etape.exercices.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-light);">Aucun exercice pour cette étape.</p>';
            return;
        }

        let html = '';
        etape.exercices.forEach((exo, idx) => {
            // ✅ Normaliser l'exercice pour gérer différents formats
            const normalized = normalizeExercise(exo);
            const type = normalized.type || 'unknown';
            
            // Générer HTML selon le type d'exercice normalisé
            html += this.renderExerciceHTML(normalized, type);
        });

        container.innerHTML = html;
        
        // ✅ Attacher les event listeners après rendu
        setTimeout(() => {
            this.attachExerciceEvents(etape);
        }, 100);
    },

    /**
     * Générer le HTML pour un exercice selon son type
     */
    renderExerciceHTML(exercice, type) {
        const titre = exercice.titre || 'Exercice';
        const description = exercice.description || '';
        const baseStyle = 'margin-bottom: 20px; border-left: 4px solid var(--color-accent); padding: 15px; background: #f9f9f9; border-radius: 8px;';
        
        if (type === 'video') {
            const videoUrl = exercice.content?.url || '';
            const iframeUrl = this.convertToEmbed(videoUrl);
            return `
                <div style="${baseStyle}">
                    <h4 style="margin: 0 0 10px 0; color: var(--color-primary);">${titre}</h4>
                    <p style="color: var(--color-text-light); margin-bottom: 15px;">${description}</p>
                    ${iframeUrl ? `
                        <iframe width="100%" height="400" src="${iframeUrl}" title="${titre}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 4px;"></iframe>
                    ` : `
                        <a href="${videoUrl}" target="_blank" class="btn btn--primary">🎬 Regarder la vidéo</a>
                    `}
                </div>
            `;
        } 
        else if (type === 'qcm') {
            const q = exercice.content?.question || '';
            const opts = exercice.content?.options || [];
            let optionsHtml = '';
            opts.forEach((o, idx) => {
                const label = typeof o === 'string' ? o : o.label;
                optionsHtml += `
                    <label style="display: block; margin: 10px 0; padding: 10px; border: 1px solid var(--color-border); border-radius: 4px; cursor: pointer; transition: all 0.2s;">
                        <input type="radio" name="qcm_${exercice.id}" value="${idx}" style="margin-right: 10px; cursor: pointer;">
                        ${label}
                    </label>
                `;
            });
            return `
                <div style="${baseStyle}">
                    <h4 style="margin: 0 0 10px 0; color: var(--color-primary);">${titre}</h4>
                    <p style="font-weight: 500; margin-bottom: 15px;">${q}</p>
                    <div style="margin-bottom: 15px;">
                        ${optionsHtml}
                    </div>
                    <button class="btn btn--primary" onclick="App.validerQCM('${exercice.id}', '${(exercice.content?.explanation || '').replace(/'/g, "\\'")}')">
                        ✓ Valider
                    </button>
                </div>
            `;
        }
        else if (type === 'true_false') {
            const items = exercice.content?.items || [];
            let itemsHtml = '';
            items.forEach((item, idx) => {
                const statement = typeof item === 'string' ? item : item.statement;
                itemsHtml += `
                    <div style="margin: 12px 0; padding: 10px; border: 1px solid var(--color-border); border-radius: 4px;">
                        <div style="margin-bottom: 8px; font-weight: 500;">${statement}</div>
                        <div>
                            <label style="margin-right: 15px; cursor: pointer;">
                                <input type="radio" name="tf_${exercice.id}_${idx}" value="true" style="margin-right: 5px;">
                                Vrai
                            </label>
                            <label style="cursor: pointer;">
                                <input type="radio" name="tf_${exercice.id}_${idx}" value="false" style="margin-right: 5px;">
                                Faux
                            </label>
                        </div>
                    </div>
                `;
            });
            return `
                <div style="${baseStyle}">
                    <h4 style="margin: 0 0 10px 0; color: var(--color-primary);">${titre}</h4>
                    ${itemsHtml}
                    <button class="btn btn--primary" onclick="App.validerExercice('${exercice.id}', 'true_false')">
                        ✓ Valider
                    </button>
                </div>
            `;
        }
        else if (type === 'drag_drop') {
            return `
                <div style="${baseStyle}">
                    <h4 style="margin: 0 0 10px 0; color: var(--color-primary);">${titre}</h4>
                    <p style="color: var(--color-text-light);">Exercice Drag & Drop - À implémentation interactive complète</p>
                    <button class="btn btn--primary" onclick="App.afficherExerciceInteractif('${exercice.id}')">
                        🎯 Lancer l'exercice
                    </button>
                </div>
            `;
        }
        else if (type === 'matching') {
            return `
                <div style="${baseStyle}">
                    <h4 style="margin: 0 0 10px 0; color: var(--color-primary);">${titre}</h4>
                    <p style="color: var(--color-text-light);">Exercice Matching - À implémentation interactive complète</p>
                    <button class="btn btn--primary" onclick="App.afficherExerciceInteractif('${exercice.id}')">
                        🎯 Lancer l'exercice
                    </button>
                </div>
            `;
        }
        else {
            // Type inconnu ou autre
            return `
                <div style="${baseStyle}">
                    <h4 style="margin: 0 0 10px 0; color: var(--color-primary);">${titre}</h4>
                    <p>${description || 'Contenu non disponible'}</p>
                </div>
            `;
        }
    },

    /**
     * Attacher les event listeners aux exercices
     */
    attachExerciceEvents(etape) {
        // À étendre selon les types d'exercices interactifs
        // (Drag-drop, matching, etc.)
    },

    /**
     * Afficher un exercice interactif (Drag-drop, Matching, etc.)
     */
    afficherExerciceInteractif(exerciceId) {
        alert('🎯 Exercice interactif à implémenter: ' + exerciceId);
        // TODO: Charger le module d'exercice interactif
    },

    /**
     * Convertir URL vidéo YouTube en iframe embed
     */
    convertToEmbed(url) {
        if (!url) return '';
        
        // YouTube
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
        }
        
        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }
        
        return '';
    },

    /**
     * Valider QCM
     */
    validerQCM(exerciceId, explanation) {
        const radio = document.querySelector(`input[name="qcm_${exerciceId}"]:checked`);
        if (!radio) {
            alert('⚠️ Sélectionnez une réponse');
            return;
        }
        
        alert(`✅ Merci!\n\n${explanation || 'Vous avez répondu.'}`);
    },

    /**
     * Compléter un chapitre
     */
    completerChapitre(chapitreId) {
        const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
        if (!chapitre) return;

        chapitre.etapes.forEach(e => { e.completed = true; });
        chapitre.progression = 100;

        if (window.StorageManager) {
            StorageManager.updateChapterProgress(chapitreId, 100);
        }

        alert(`✅ Bravo! "${chapitre.titre}" terminé!`);
        this.afficherChapitreContenu(chapitreId);
    },

    /**
     * ATTACHER LES ÉVÉNEMENTS POUR MATCHING
     */
    attachMatchingEvents() {
        document.querySelectorAll('.matching-situation').forEach(situation => {
            situation.addEventListener('click', (e) => {
                e.stopPropagation();
                const containerId = situation.closest('.matching-container')?.id;
                if (containerId) {
                    this.selectSituation(situation, containerId);
                }
            });
        });

        document.querySelectorAll('.matching-status-button').forEach(statusBtn => {
            statusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const containerId = statusBtn.closest('.matching-container')?.id;
                if (containerId) {
                    this.selectStatus(statusBtn, containerId);
                }
            });
        });
    },

    /**
     * Rend les exercices d'une étape (gère exercise_group et exercices uniques)
     * Affiche UN SEUL exercice à la fois avec navigation
     */
    renderExercices(etape, type) {
        // ✅ Si c'est un groupe d'exercices (exercise_group), afficher UN SEUL à la fois
        if (type === 'exercise_group' && etape.exercices && Array.isArray(etape.exercices)) {
            if (etape.exercices.length === 0) {
                return '<p>Aucun exercice</p>';
            }
            
            // Initialiser l'index si pas encore fait
            if (!window.currentExerciceIndex) {
                window.currentExerciceIndex = 0;
            }
            if (!window.currentEtapeId) {
                window.currentEtapeId = etape.id;
            }
            
            const currentIndex = window.currentExerciceIndex;
            const exercice = etape.exercices[currentIndex];
            const totalExercices = etape.exercices.length;
            
            // Construire l'entête avec progression
            let html = `
                <div style="margin-bottom: var(--spacing-lg); padding-bottom: var(--spacing-lg); border-bottom: 1px solid var(--color-border);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
                        <span style="color: var(--color-text-light); font-size: 0.9em;">
                            📍 Exercice <strong>${currentIndex + 1}</strong> / <strong>${totalExercices}</strong>
                        </span>
                        <div style="width: 150px; height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${((currentIndex + 1) / totalExercices) * 100}%; height: 100%; background: var(--color-accent);"></div>
                        </div>
                    </div>
                    ${this.renderExercice(exercice, exercice.type, etape)}
                </div>
            `;
            
            return html;
        }
        
        // ✅ Si c'est un exercice unique (pas de groupe)
        if (etape.exercice) {
            return this.renderExercice(etape.exercice, etape.type, etape);
        }
        
        return '<p>Aucun exercice</p>';
    },

    /**
     * Passe à l'exercice suivant d'une étape
     */
    allerExerciceSuivant() {
        const chapitreId = window.currentChapitreId;
        const stepId = window.currentStepId;
        
        if (!chapitreId || !stepId) {
            console.error('❌ Contexte d\'étape invalide');
            return;
        }
        
        const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
        const etape = chapitre?.etapes.find(e => e.id === stepId);
        
        if (!etape || etape.type !== 'exercise_group') {
            console.error('❌ Étape invalide ou pas de groupe d\'exercices');
            return;
        }
        
        if (!window.currentExerciceIndex) {
            window.currentExerciceIndex = 0;
        }
        
        const totalExercices = etape.exercices.length;
        const nextIndex = window.currentExerciceIndex + 1;
        
        if (nextIndex < totalExercices) {
            window.currentExerciceIndex = nextIndex;
            // Réafficher l'étape avec le nouvel exercice
            this.afficherEtape(stepId, chapitreId);
        } else {
            // Tous les exercices complétés - marquer l'étape comme complète et revenir aux étapes
            const stepProgress = {
                completed: true,
                timestamp: new Date().toISOString(),
                score: 100
            };
            localStorage.setItem(`step_${stepId}`, JSON.stringify(stepProgress));
            this.marquerEtapeComplete(chapitreId, stepId);
            
            const maxPoints = etape?.points || 10;
            StorageManager.addPointsToStep(stepId, maxPoints, maxPoints);
            this.updateHeader();
            
            showSuccessNotification('🎉 Étape complétée!', 'Retour au chemin des étapes...', '✅', 2000);
            window.currentExerciceIndex = 0; // Reset
            setTimeout(() => {
                App.fermerModal();
                // Revenir à l'affichage du chapitre pour voir les autres étapes
                App.afficherChapitre(chapitreId);
            }, 2000);
        }
    },

    /**
     * Rend l'exercice selon son type
     */
    renderExercice(exercice, etapeType = null, etape = null) {
        if (!exercice) return '<p>Aucun exercice</p>';
        
        // ✅ NORMALISER L'EXERCICE (convertir ancien format → format unifié)
        exercice = normalizeExercise(exercice);
        
        // ⭐ Si exercice incomplet (pas de content), ajouter script pour le charger async
        if (!exercice.content) {
            return `
                <div id="exercice-${exercice.id}" data-exercice-id="${exercice.id}">
                    <div style="text-align: center; padding: var(--spacing-lg);">
                        <p>⏳ Chargement de l'exercice...</p>
                    </div>
                </div>
                <script>
                    (async function() {
                        const exerciceId = '${exercice.id}';
                        const container = document.getElementById('exercice-' + exerciceId);
                        if (!container) return;
                        
                        try {
                            console.log('📚 Chargement exercice async:', exerciceId);
                            const fullExercice = await exerciseLoader.loadExerciseById(exerciceId);
                            if (!fullExercice) {
                                container.innerHTML = '<p>❌ Exercice non trouvé</p>';
                                return;
                            }
                            console.log('✅ Exercice chargé:', exerciceId);
                            const html = App.renderExercice(fullExercice, fullExercice.type);
                            container.outerHTML = html;
                        } catch (error) {
                            console.error('❌ Erreur chargement exercice:', error);
                            container.innerHTML = '<p>❌ Erreur lors du chargement</p>';
                        }
                    })();
                </script>
            `;
        }
        
        // Passer l'étape aux fonctions de rendu pour accès au videoId
        switch(exercice.type) {
            case 'video':
                return this.renderExerciceVideo(exercice, etape);
            case 'qcm':
                return this.renderExerciceQCM(exercice);
            case 'true_false':
                return this.renderExerciceVraisFaux(exercice);
            case 'drag_drop':
                return this.renderExerciceDragDrop(exercice);
            case 'matching':
                return this.renderExerciceMatching(exercice);
            case 'qcm_scenario':
                return this.renderExerciceQCMScenario(exercice);
            case 'likert_scale':
                return this.renderExerciceLikertScale(exercice);
            case 'lecture':
                return this.renderExerciceLecture(exercice);
            case 'flashcards':
                return this.renderExerciceFlashcards(exercice);
            case 'calculation':
                return this.renderExerciceCalculation(exercice);
            case 'quiz':
                return this.renderExerciceQuiz(exercice);
            default:
                return `
                    <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                        <h3>${exercice.titre || 'Exercice'}</h3>
                        <p>${exercice.description || ''}</p>
                        <p style="color: var(--color-text-light); margin-top: var(--spacing-md);">
                            ℹ️ Type d'exercice non supporté: <strong>${exercice.type}</strong>
                        </p>
                        <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.validerExercice('default')">✅ Marquer comme lu</button>
                    </div>
                `;
        }
    },

    /**
     * Rendu VIDEO (Support à la fois YouTube et lecteur local)
     */
    renderExerciceVideo(exercice, etape = null) {
        // ✅ DÉTECTION YOUTUBE - Gérer les différents formats d'URL YouTube
        // Chercher l'URL au niveau racine OU dans content
        const videoUrl = exercice.url || exercice.videoUrl || exercice.content?.url;
        
        console.log(`📹 renderExerciceVideo - videoUrl: ${videoUrl}`, exercice);
        
        if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
            let embedUrl = videoUrl;
            
            // ✅ CONVERSION DES FORMATS YOUTUBE
            if (embedUrl.includes('watch?v=')) {
                // Format: https://www.youtube.com/watch?v=jNQXAC9IVRw
                const videoId = embedUrl.split('v=')[1]?.split('&')[0];
                if (videoId) {
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                }
            } else if (embedUrl.includes('youtu.be/')) {
                // Format: https://youtu.be/jNQXAC9IVRw
                const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
                if (videoId) {
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                }
            } else if (!embedUrl.includes('/embed/')) {
                // Si l'URL n'est pas déjà au format embed, essayer de l'extraire
                const videoIdMatch = embedUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\s]{11})/);
                if (videoIdMatch && videoIdMatch[1]) {
                    embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
                }
            }
            
            console.log(`✅ Vidéo YouTube chargée: ${embedUrl}`);
            
            return `
                <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                    <h3>${exercice.titre}</h3>
                    <p style="color: var(--color-text-light); margin-bottom: var(--spacing-md);">${exercice.description || ''}</p>
                    <div class="video-container">
                        <iframe title="${exercice.titre}" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                    <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.validerExercice('video')">✅ J'ai regardé la vidéo</button>
                </div>
            `;
        }
        
        // Si c'est une vidéo locale avec notre VideoPlayer
        const videoId = etape?.videoId || exercice.videoId;
        if (videoId) {
            // Générer un container ID unique pour le VideoPlayer
            const containerId = `video-container-${videoId}`;
            
            return `
                <div class="video-section">
                    <h3>🎬 ${exercice.titre}</h3>
                    <p style="color: var(--color-text-light); margin-bottom: 20px;">${exercice.description}</p>
                    
                    <div id="${containerId}" style="width: 100%; margin-bottom: var(--spacing-md);">
                        <video-player video-id="${videoId}"></video-player>
                    </div>
                    
                    <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.validerExercice('video')">✅ J'ai regardé la vidéo</button>
                </div>
            `;
        }
        
        console.warn(`❌ Format vidéo non supporté pour:`, exercice);
        return `<p>❌ Format vidéo non supporté</p>`;
    },

    /**
     * Rendu QCM - Sécurisé (pas d'exposition réponses en HTML)
     */
    renderExerciceQCM(exercice) {
        const qcmId = 'qcm_' + Math.random().toString(36).substr(2, 9);
        
        // ✅ Extraire les données du format JSON
        const content = exercice.content;
        if (!content || !content.question || !content.options) {
            return '<p>❌ Format QCM invalide</p>';
        }
        
        // ✅ Stocker les bonnes réponses en mémoire SEULE, jamais en HTML
        window.QCM_ANSWERS = window.QCM_ANSWERS || {};
        window.QCM_ANSWERS[qcmId] = {
            correctAnswer: content.correctAnswer,
            options: content.options,
            question: content.question,
            explication: content.explanation
        };

        let html = `
            <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);" data-qcm-id="${qcmId}">
                <h3>❓ ${content.question}</h3>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md); margin-top: var(--spacing-md);">
        `;
        
        content.options.forEach((option, index) => {
            // ✅ NE PAS ajouter data-correct en HTML
            const optionText = typeof option === 'string' ? option : option.label;
            html += `
                <label style="display: flex; align-items: center; padding: var(--spacing-md); border: 2px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;">
                    <input type="radio" name="qcm_${qcmId}" value="${index}" style="margin-right: var(--spacing-md);" class="qcm-input">
                    <span>${optionText}</span>
                </label>
            `;
        });
        
        html += `
                </div>
                <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.validerQCMSecurise('${qcmId}')">Soumettre la réponse</button>
                <div id="feedback_${qcmId}" style="margin-top: var(--spacing-md); display: none;"></div>
            </div>
        `;
        
        return html;
    },

    /**
     * Rendu VRAI/FAUX
     */
    renderExerciceVraisFaux(exercice) {
        const vrfId = 'vf_' + Math.random().toString(36).substr(2, 9);
        const content = exercice.content;
        
        if (!content || !content.items || !Array.isArray(content.items)) {
            return '<p>❌ Format Vrai/Faux invalide</p>';
        }
        
        // ✅ Stocker les données pour la validation
        window.VRF_DATA = window.VRF_DATA || {};
        window.VRF_DATA[vrfId] = {
            items: content.items
        };
        
        let html = `
            <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h3>✔️ ${exercice.titre || 'Vrai ou Faux?'}</h3>
                <div style="margin-top: var(--spacing-md);">
        `;
        
        content.items.forEach((item, index) => {
            const itemId = `${vrfId}_${index}`;
            html += `
                <div style="margin-bottom: var(--spacing-lg); padding-bottom: var(--spacing-lg); border-bottom: 1px solid var(--color-border);">
                    <p style="margin-bottom: var(--spacing-md); font-weight: 500;">${index + 1}. ${item.statement}</p>
                    <div style="display: flex; gap: var(--spacing-md);">
                        <label style="display: flex; align-items: center; padding: var(--spacing-sm) var(--spacing-md); border: 2px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer;">
                            <input type="radio" name="${itemId}" value="true" style="margin-right: var(--spacing-sm);" class="vf-input">
                            <span>✅ Vrai</span>
                        </label>
                        <label style="display: flex; align-items: center; padding: var(--spacing-sm) var(--spacing-md); border: 2px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer;">
                            <input type="radio" name="${itemId}" value="false" style="margin-right: var(--spacing-sm);" class="vf-input">
                            <span>❌ Faux</span>
                        </label>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.validerVraisFaux('${vrfId}', ${content.items.length})">Soumettre</button>
                <div id="feedback_${vrfId}" style="margin-top: var(--spacing-md); display: none;"></div>
            </div>
        `;
        
        return html;
    },

    /**
     * Rendu DRAG-DROP
     */
    /**
     * Rendu DRAG-DROP - Approche stable avec IDs uniques
     */
    renderExerciceDragDrop(exercice) {
        const dragId = 'drag_' + Math.random().toString(36).substr(2, 9);
        const content = exercice.content;
        
        if (!content || !content.items) {
            return '<p>❌ Format Drag-Drop invalide</p>';
        }
        
        let html = `
            <div id="${dragId}" class="drag-container" style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h3>🎯 ${exercice.titre || 'Ordonner les éléments'}</h3>
                <p style="color: var(--color-text-light); margin-bottom: var(--spacing-md);">Drag and drop pour ordonner correctement</p>
                <div class="drag-items" style="display: flex; flex-direction: column; gap: var(--spacing-md); min-height: 100px; border: 2px dashed var(--color-border); padding: var(--spacing-md); border-radius: var(--radius-md);">
        `;
        
        // ✅ Stocker les données
        window.DRAG_DATA = window.DRAG_DATA || {};
        window.DRAG_DATA[dragId] = {
            items: content.items,
            correctOrder: content.items.map((item, idx) => item.correctPosition !== undefined ? item.correctPosition : idx),
            currentOrder: content.items.map((_, idx) => idx),
            exerciseId: exercice.id
        };
        
        content.items.forEach((item, index) => {
            html += `
                <div class="drag-item" 
                     data-item-id="${item.id || index}"
                     data-correct-position="${item.correctPosition !== undefined ? item.correctPosition : index}"
                     data-current-position="${index}"
                     draggable="true"
                     data-drag-id="${dragId}"
                     style="
                        padding: var(--spacing-md);
                        background: var(--color-accent);
                        color: white;
                        border-radius: var(--radius-md);
                        cursor: move;
                        user-select: none;
                        transition: all 0.2s ease;
                        border-left: 4px solid transparent;
                     ">
                    <span style="font-weight: 600;">${item.label || item}</span>
                </div>
            `;
        });
        
        html += `
                </div>
                <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="initDragDropValidation('${dragId}')">Vérifier l'ordre</button>
                <div id="feedback_${dragId}" style="margin-top: var(--spacing-md); display: none;"></div>
            </div>
        `;
        
        // ✅ Initialiser les événements drag-drop après rendu
        setTimeout(() => {
            initDragDrop(dragId);
        }, 100);
        
        return html;
    },

    /**
     * Rendu LIKERT SCALE (Auto-évaluation)
     */
    renderExerciceLikertScale(exercice) {
        const likertId = 'likert_' + Math.random().toString(36).substr(2, 9);
        const content = exercice.content;
        
        if (!content || !content.items) {
            return '<p>❌ Format Likert Scale invalide</p>';
        }
        
        const scale = ['Pas du tout', 'Un peu', 'Moyennement', 'Beaucoup', 'Totalement'];
        
        let html = `
            <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h3>📊 ${exercice.titre || 'Auto-évaluation'}</h3>
                <div style="margin-top: var(--spacing-md);">
        `;
        
        content.items.forEach((item, itemIndex) => {
            html += `
                <div style="margin-bottom: var(--spacing-lg); padding-bottom: var(--spacing-lg); border-bottom: 1px solid var(--color-border);">
                    <p style="margin-bottom: var(--spacing-md); font-weight: 500;">${item.label || item.competencyId}</p>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--spacing-sm);">
            `;
            
            scale.forEach((scaleLabel, scaleIndex) => {
                const inputId = `${likertId}_${itemIndex}_${scaleIndex}`;
                html += `
                    <label style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                        <input type="radio" name="likert_${itemIndex}" value="${scaleIndex}" style="margin-bottom: var(--spacing-sm);" class="likert-input">
                        <span style="font-size: 0.8em; text-align: center;">${scaleLabel}</span>
                    </label>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.validerLikert('${likertId}')">Valider l'auto-évaluation</button>
                <div id="feedback_${likertId}" style="margin-top: var(--spacing-md); display: none;"></div>
            </div>
        `;
        
        return html;
    },

    /**
     * Rendu LECTURE
     */
    renderExerciceLecture(exercice) {
        // Extraire le texte du format unifié
        const lectureText = exercice.content?.text || exercice.texte || '';
        
        return `
            <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h3>${exercice.titre}</h3>
                <div style="white-space: pre-wrap; line-height: 1.6; margin: var(--spacing-md) 0; color: var(--color-text);">
                    ${lectureText}
                </div>
                <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.validerExercice('lecture')">✅ J'ai lu la leçon</button>
            </div>
        `;
    },

    /**
     * Rendu FLASHCARDS
     */
    renderExerciceFlashcards(exercice) {
        // Extraire les cartes du format unifié
        const cards = exercice.content?.cards || exercice.cartes || [];
        
        if (!cards || cards.length === 0) {
            return '<p>❌ Aucune flashcard trouvée</p>';
        }
        
        let html = `
            <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h3>🎴 Flashcards - Mémorisation</h3>
                <p style="color: var(--color-text-light); margin-bottom: var(--spacing-md);">Cliquez sur une carte pour voir la réponse (${cards.length} cartes)</p>
                <div id="flashcard-container" style="perspective: 1000px;">
        `;
        
        cards.forEach((carte, index) => {
            const safeId = `card-${index}`;
            const recto = carte.recto || carte.question || '';
            const verso = carte.verso || carte.answer || '';

            html += `
                <div class="flashcard-wrapper" style="
                    margin: 20px 0;
                    height: 220px;
                    cursor: pointer;
                " data-index="${index}">
                    <div class="flashcard-inner" style="
                        position: relative;
                        width: 100%;
                        height: 100%;
                        transition: transform 0.6s;
                        transform-style: preserve-3d;
                    ">
                        <!-- RECTO (Face avant) -->
                        <div class="flashcard-recto" style="
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            border-radius: 12px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            font-size: 18px;
                            font-weight: 600;
                            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                            backface-visibility: hidden;
                            -webkit-backface-visibility: hidden;
                        ">
                            <span style="font-size: 14px; opacity: 0.8; margin-bottom: 10px;">❓ QUESTION</span>
                            <span>${recto}</span>
                            <span style="font-size: 12px; opacity: 0.7; margin-top: 15px;">(Cliquer pour répondre)</span>
                        </div>
                        
                        <!-- VERSO (Face arrière) -->
                        <div class="flashcard-verso" style="
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                            color: white;
                            padding: 30px;
                            border-radius: 12px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            font-size: 18px;
                            font-weight: 600;
                            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                            transform: rotateY(180deg);
                            backface-visibility: hidden;
                            -webkit-backface-visibility: hidden;
                        ">
                            <span style="font-size: 14px; opacity: 0.8; margin-bottom: 10px;">✅ RÉPONSE</span>
                            <span>${verso}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                <div style="margin-top: var(--spacing-lg); text-align: center;">
                    <p style="color: var(--color-text-light); font-size: 14px; margin-bottom: var(--spacing-md);">
                        Naviguez à travers les cartes et cliquez pour révéler les réponses
                    </p>
                    <button class="btn btn--primary" style="width: 100%; padding: var(--spacing-md);" onclick="App.validerExercice('flashcards')">✅ J'ai maîtrisé ces cartes</button>
                </div>
            </div>
        `;
        
        // Retourner le HTML et attacher les événements après le rendu
        setTimeout(() => {
            document.querySelectorAll('.flashcard-wrapper').forEach(wrapper => {
                const inner = wrapper.querySelector('.flashcard-inner');
                let isFlipped = false;
                
                // Clic pour retourner la carte
                wrapper.addEventListener('click', function(e) {
                    e.preventDefault();
                    isFlipped = !isFlipped;
                    inner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
                });
                
                // Hover pour feedback visuel
                wrapper.addEventListener('mouseover', function() {
                    this.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
                    this.style.transform = 'translateY(-5px)';
                });
                
                wrapper.addEventListener('mouseout', function() {
                    this.style.boxShadow = 'none';
                    this.style.transform = 'translateY(0)';
                });
                
                // Support tactile pour mobile
                let touchStartX = 0;
                wrapper.addEventListener('touchstart', function(e) {
                    touchStartX = e.touches[0].clientX;
                });
                
                wrapper.addEventListener('touchend', function(e) {
                    const touchEndX = e.changedTouches[0].clientX;
                    const diff = Math.abs(touchEndX - touchStartX);
                    
                    // Si déplacement minimal, considérer comme un clic
                    if (diff < 20) {
                        isFlipped = !isFlipped;
                        inner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
                    }
                });
            });
        }, 100);
        
        return html;
    },

    /**
     * Rendu CALCULATION - Questions numériques avec validation
     */
    renderExerciceCalculation(exercice) {
        if (!exercice.content || !exercice.content.questions) {
            return '<p>❌ Format exercice calcul invalide</p>';
        }

        const content = exercice.content;
        const calcId = 'calc_' + Math.random().toString(36).substr(2, 9);

        // Stocker les réponses correctes en mémoire
        window.CALC_ANSWERS = window.CALC_ANSWERS || {};
        window.CALC_ANSWERS[calcId] = {
            questions: content.questions,
            scenario: content.scenario,
            summary: content.summary
        };

        let html = `
            <div class="exercice-calculation" id="${calcId}">
                <div style="background: #f0f4ff; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #8b5cf6;">
                    <h4 style="margin-top: 0; color: #5b21b6; font-size: 16px;">📋 Scénario</h4>
                    <pre style="white-space: pre-wrap; font-size: 14px; line-height: 1.5; color: #333; font-family: inherit;">
${content.scenario}
                    </pre>
                </div>

                <div class="questions-container">
        `;

        // Générer chaque question numérique
        content.questions.forEach((question, qIndex) => {
            const inputId = `${calcId}_q${qIndex}`;
            html += `
                <div style="margin-bottom: 24px; padding: 16px; background: #fafafa; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 15px;">
                        Q${qIndex + 1}: ${question.question}
                    </label>
                    
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
                        <input 
                            type="number" 
                            id="${inputId}" 
                            placeholder="Votre réponse..."
                            step="0.01"
                            style="flex: 1; padding: 10px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 14px;"
                        />
                        <span style="min-width: 60px; color: #666; font-weight: 500;">
                            ${question.unit || ''}
                        </span>
                    </div>

                    <details style="margin-bottom: 8px;">
                        <summary style="cursor: pointer; color: #0066cc; font-weight: 500; user-select: none;">💡 Indice</summary>
                        <p style="margin: 8px 0 0 0; padding: 8px; background: #fff3cd; border-left: 3px solid #ffc107; color: #856404; border-radius: 4px;">
                            ${question.hint}
                        </p>
                    </details>

                    <div id="feedback_${inputId}" style="display: none; padding: 12px; border-radius: 6px; margin-top: 8px; font-weight: 500; border: 2px solid;"></div>
                </div>
            `;
        });

        html += `
                </div>

                <button 
                    onclick="App.validerCalculation('${calcId}')"
                    class="btn btn--primary"
                    style="width: 100%; padding: 12px; margin-top: 20px; font-size: 16px; font-weight: 600;"
                >
                    📊 Valider mes réponses
                </button>

                <div id="summary_${calcId}" style="display: none; margin-top: 20px; padding: 16px; background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px;">
                    <h4 style="margin-top: 0; color: #065f46;">✅ Résumé</h4>
                    <pre style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #333; margin: 0; font-family: inherit;">
${content.summary}
                    </pre>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Valide les réponses de calcul avec tolérance
     */
    validerCalculation(calcId) {
        const calcData = window.CALC_ANSWERS?.[calcId];
        if (!calcData) {
            showErrorNotification('❌ Erreur: données de calcul non trouvées');
            return;
        }

        let allCorrect = true;
        let correctCount = 0;
        const questions = calcData.questions;

        // Vérifier chaque réponse
        questions.forEach((question, qIndex) => {
            const inputId = `${calcId}_q${qIndex}`;
            const userInput = document.getElementById(inputId);
            const userAnswer = parseFloat(userInput.value);
            const correctAnswer = question.correctAnswer;
            const tolerance = question.tolerance || 0;

            const isCorrect = Math.abs(userAnswer - correctAnswer) <= tolerance;
            const feedback = document.getElementById(`feedback_${inputId}`);

            if (isCorrect) {
                correctCount++;
                feedback.style.background = '#dcfce7';
                feedback.style.color = '#166534';
                feedback.style.borderColor = '#22c55e';
                feedback.innerHTML = `
                    ✅ <strong>Correct!</strong> ${question.explanation}
                `;
                userInput.style.borderColor = '#22c55e';
            } else {
                allCorrect = false;
                feedback.style.background = '#fee2e2';
                feedback.style.color = '#991b1b';
                feedback.style.borderColor = '#ef4444';
                feedback.innerHTML = `
                    ❌ <strong>Incorrect.</strong> Votre réponse: <strong>${userAnswer}</strong>, Correcte: <strong>${correctAnswer}</strong><br/><br/>
                    ${question.explanation}
                `;
                userInput.style.borderColor = '#ef4444';
            }

            feedback.style.display = 'block';
        });

        // Afficher résumé
        const summaryDiv = document.getElementById(`summary_${calcId}`);
        summaryDiv.style.display = 'block';

        // Marquer étape complète si tout juste
        if (allCorrect) {
            showSuccessNotification('🎉 Parfait!', `${correctCount}/${questions.length} réponses correctes!`, '✅', 2000);
            
            // Marquer l'étape comme complétée
            if (window.currentStepId && window.currentChapitreId) {
                App.marquerEtapeComplete(window.currentChapitreId, window.currentStepId);
                const chapitre = CHAPITRES.find(ch => ch.id === window.currentChapitreId);
                const etape = chapitre?.etapes.find(e => e.id === window.currentStepId);
                const maxPoints = etape?.points || 10;
                StorageManager.addPointsToStep(window.currentStepId, maxPoints, maxPoints);
                App.updateHeader();
            }

            setTimeout(() => {
                App.allerExerciceSuivant();
            }, 2000);
        } else {
            showErrorNotification(`⚠️ ${correctCount}/${questions.length} réponses correctes - Réessayez!`, 3000);
        }
    },

    /**
     * Rendu QUIZ
     */
    renderExerciceQuiz(exercice) {
        // Extraire les questions du format unifié
        const questions = exercice.content?.questions || exercice.questions || [];
        
        if (!questions || questions.length === 0) {
            return '<p>❌ Aucune question trouvée</p>';
        }
        
        let html = `
            <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h3>${exercice.titre}</h3>
                <p style="color: var(--color-text-light); margin-bottom: var(--spacing-md);">${exercice.description}</p>
        `;
        
        questions.forEach((question, qIndex) => {
            html += `
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: white; border-radius: var(--radius-md);">
                    <h4>Q${qIndex + 1}: ${question.question}</h4>
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-md); margin-top: var(--spacing-md);">
            `;
            
            const options = question.options || question.choix || [];
            options.forEach((option, optIndex) => {
                const optionText = typeof option === 'string' ? option : (option.label || option.texte || option.text || '');
                const isCorrect = optIndex === question.correctAnswer || option.correct;
                
                html += `
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="radio" name="q${question.id}" value="${optIndex}" data-correct="${isCorrect}" style="cursor: pointer;">
                        <span style="margin-left: var(--spacing-md);">${optionText}</span>
                    </label>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
                <button class="btn btn--primary" style="width: 100%;" onclick="App.validerQuiz()">Soumettre le quiz</button>
                <div id="quiz-feedback" style="margin-top: var(--spacing-lg); padding: var(--spacing-md); border-radius: var(--radius-md); display: none;"></div>
            </div>
        `;
        
        return html;
    },

    /**
     * RENDU MATCHING - Associer situations à statuts
     */
    renderExerciceMatching(exercice) {
        if (!exercice.pairs || exercice.pairs.length === 0) {
            return `<p>❌ Aucune paire d'association</p>`;
        }

        const containerId = `matching-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const statusesShuffled = [...exercice.statuses].sort(() => Math.random() - 0.5);

        let html = `
            <div class="matching-container" id="${containerId}">
                <p class="matching-instructions">🎯 Associez chaque élément de gauche à son équivalent à droite en cliquant</p>
                
                <div class="matching-content">
                    <!-- COLONNE GAUCHE (SITUATIONS) -->
                    <div class="matching-column">
                        <h4 class="matching-column-title">📍 Éléments</h4>
                        <div class="matching-situations">
        `;

        // Créer les situations (gauche)
        exercice.pairs.forEach((pair, idx) => {
            html += `
                <div class="matching-situation" 
                     data-pair-id="${pair.id}"
                     data-correct-status="${pair.status}">
                    <div class="matching-situation-number">${idx + 1}</div>
                    <div class="matching-situation-text">${pair.situation}</div>
                    <div class="matching-situation-status" style="display: none;"></div>
                </div>
            `;
        });

        html += `
                        </div>
                    </div>

                    <!-- COLONNE DROITE (STATUTS) -->
                    <div class="matching-column">
                        <h4 class="matching-column-title">🏷️ Réponses</h4>
                        <div class="matching-statuses">
        `;

        // Créer les statuts (droite)
        statusesShuffled.forEach((status) => {
            html += `
                <div class="matching-status-button"
                     data-status-id="${status.id}"
                     data-status-name="${status.name}"
                     style="background-color: ${status.color}20; border: 2px solid ${status.color};">
                    <span class="matching-status-text">${status.name}</span>
                </div>
            `;
        });

        html += `
                        </div>
                    </div>
                </div>

                <!-- FEEDBACK -->
                <div id="matching-feedback-${containerId}" class="matching-feedback" style="margin-top: 20px; display: none;"></div>

                <!-- BOUTONS -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;">
                    <button class="btn btn--primary" onclick="App.validerMatching('${containerId}')">
                        ✅ Valider les associations
                    </button>
                    <button class="btn btn--secondary" onclick="App.reinitialiserMatching('${containerId}')">
                        🔄 Recommencer
                    </button>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * RENDU QCM SCÉNARIO - Afficher scénario + questions
     */
    renderExerciceQCMScenario(exercice) {
        if (!exercice.scenario || !exercice.questions || exercice.questions.length === 0) {
            return `<p>❌ Scénario ou questions manquants</p>`;
        }

        const containerId = `qcm-scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        let html = `
            <div class="qcm-scenario-container" id="${containerId}">
                
                <!-- SCÉNARIO -->
                <div class="scenario-panel" style="background-color: ${exercice.scenario.background_color || '#f5f5f5'};">
                    <div class="scenario-header">
                        <h3 class="scenario-title">
                            <span class="scenario-icon">${exercice.scenario.icon || '📋'}</span>
                            ${exercice.scenario.title}
                        </h3>
                    </div>
                    <div class="scenario-description">
                        ${exercice.scenario.description.replace(/\n/g, '<br>')}
                    </div>
                </div>

                <!-- QUESTIONS -->
                <div class="qcm-scenario-questions">
        `;

        // Créer chaque question
        exercice.questions.forEach((question, qIdx) => {
            html += `
                <div class="qcm-scenario-question-card" data-question-id="${question.id}">
                    <div class="question-header">
                        <h4 class="question-number">Question ${qIdx + 1}/${exercice.questions.length}</h4>
                        <span class="question-points" data-points="${question.points}">${question.points} pts</span>
                    </div>

                    <p class="question-text">${question.question}</p>

                    <div class="question-options">
            `;

            // Créer les options de réponse
            question.options.forEach((option, oIdx) => {
                const optionId = `opt_${question.id}_${option.id}`;
                html += `
                    <label class="option-label" data-option-id="${option.id}" data-correct="${option.correct}">
                        <input type="radio" 
                               name="question_${question.id}" 
                               id="${optionId}"
                               value="${option.id}"
                               class="option-input"
                               data-explanation="${option.explanation}">
                        <span class="option-text">${option.text}</span>
                    </label>
                `;
            });

            html += `
                    </div>

                    <!-- FEEDBACK QUESTION -->
                    <div class="question-feedback" style="display: none; margin-top: 15px;"></div>
                </div>
            `;
        });

        html += `
                </div>

                <!-- FEEDBACK GLOBAL -->
                <div id="qcm-scenario-feedback-${containerId}" class="qcm-scenario-feedback" style="margin-top: 25px; display: none;"></div>

                <!-- BOUTONS -->
                <div class="qcm-scenario-buttons">
                    <button class="btn btn--primary" style="flex: 1;"
                            onclick="App.validerQCMScenario('${containerId}')">
                        ✅ Valider mes réponses
                    </button>
                    <button class="btn btn--secondary" style="flex: 1; margin-left: 10px;"
                            onclick="App.reinitialiserQCMScenario('${containerId}')">
                        🔄 Recommencer
                    </button>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * CLIQUER SUR UNE SITUATION
     */
    selectSituation(situationElement, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.querySelectorAll('.matching-situation.selected').forEach(el => {
            el.classList.remove('selected');
            el.style.backgroundColor = '';
            el.style.borderLeft = 'none';
        });

        situationElement.classList.add('selected');
        situationElement.style.backgroundColor = 'rgba(102, 126, 234, 0.15)';
        situationElement.style.borderLeft = '4px solid var(--color-primary)';

        console.log(`📍 Situation sélectionnée: ${situationElement.dataset.pairId}`);
    },

    /**
     * CLIQUER SUR UN STATUT
     */
    selectStatus(statusButton, containerId) {
        const statusName = statusButton.dataset.statusName;
        const statusId = statusButton.dataset.statusId;

        const container = document.getElementById(containerId);
        if (!container) return;

        const selectedSituation = container.querySelector('.matching-situation.selected');

        if (!selectedSituation) {
            showErrorNotification('⚠️ Sélectionnez d\'abord un élément!');
            return;
        }

        const pairId = selectedSituation.dataset.pairId;

        selectedSituation.dataset.selectedStatus = statusId;
        selectedSituation.dataset.selectedStatusName = statusName;

        const statusDisplay = selectedSituation.querySelector('.matching-situation-status');
        statusDisplay.textContent = statusName;
        statusDisplay.style.display = 'block';
        statusDisplay.style.color = statusButton.style.borderColor || '#333';
        statusDisplay.style.fontWeight = 'bold';
        statusDisplay.style.marginTop = '8px';
        statusDisplay.style.padding = '6px 12px';
        statusDisplay.style.borderRadius = '4px';
        statusDisplay.style.backgroundColor = statusButton.style.backgroundColor;

        selectedSituation.classList.remove('selected');
        selectedSituation.style.backgroundColor = '';
        selectedSituation.style.borderLeft = 'none';

        console.log(`✅ Associé: ${pairId} → ${statusName}`);
    },

    /**
     * RÉINITIALISER LES ASSOCIATIONS
     */
    reinitialiserMatching(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.querySelectorAll('.matching-situation').forEach(el => {
            el.dataset.selectedStatus = '';
            el.dataset.selectedStatusName = '';
            el.classList.remove('selected');
            el.style.backgroundColor = '';
            el.style.borderLeft = 'none';
            const statusDisplay = el.querySelector('.matching-situation-status');
            if (statusDisplay) {
                statusDisplay.textContent = '';
                statusDisplay.style.display = 'none';
            }
        });

        const feedback = container.querySelector(`#matching-feedback-${containerId}`);
        if (feedback) {
            feedback.style.display = 'none';
            feedback.innerHTML = '';
        }

        showSuccessNotification('🔄 Réinitialisé', 'Les associations ont été effacées');
    },

    /**
     * VALIDER TOUTES LES ASSOCIATIONS
     */
    validerMatching(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const situations = container.querySelectorAll('.matching-situation');
        const feedback = container.querySelector(`#matching-feedback-${containerId}`);

        let allCorrect = true;
        let correctCount = 0;

        situations.forEach((situation) => {
            const selectedStatus = situation.dataset.selectedStatus;
            const correctStatus = situation.dataset.correctStatus;

            if (!selectedStatus || selectedStatus === '') {
                allCorrect = false;
                situation.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                situation.style.borderLeft = '4px solid #EF4444';
                return;
            }

            if (selectedStatus === correctStatus) {
                situation.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                situation.style.borderLeft = '4px solid #22C55E';
                correctCount++;
            } else {
                situation.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                situation.style.borderLeft = '4px solid #EF4444';
                allCorrect = false;
            }
        });

        if (allCorrect) {
            feedback.innerHTML = `
                <div style="background: rgba(34, 197, 94, 0.15);
                            border: 2px solid #22C55E;
                            color: #22C55E;
                            padding: 20px;
                            border-radius: 10px;
                            text-align: center;
                            font-weight: bold;">
                    ✅ <strong>PARFAIT!</strong> Toutes les associations sont correctes! (${correctCount}/${situations.length})
                </div>
            `;
            feedback.style.display = 'block';

            if (window.currentStepId && window.currentChapitreId) {
                const chapitre = CHAPITRES.find(ch => ch.id === window.currentChapitreId);
                const etape = chapitre?.etapes.find(e => e.id === window.currentStepId);
                const maxPoints = etape?.points || 75;
                
                this.marquerEtapeComplete(window.currentChapitreId, window.currentStepId);
                const result = StorageManager.addPointsToStep(window.currentStepId, maxPoints, maxPoints);
                this.updateHeader();

                setTimeout(() => {
                    showSuccessNotification('🎉 Excellent!', 'Vous avez réussi l\'exercice d\'association!');
                    this.fermerModal();
                    this.rafraichirAffichage();
                }, 1500);
            }
        } else {
            feedback.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.15);
                            border: 2px solid #EF4444;
                            color: #EF4444;
                            padding: 20px;
                            border-radius: 10px;
                            text-align: center;
                            font-weight: bold;">
                    ❌ <strong>Pas encore bon</strong> - ${correctCount}/${situations.length} associations correctes<br/>
                    <small>Vérifiez les cases rouges</small>
                </div>
            `;
            feedback.style.display = 'block';
        }
    },

    /**
     * Valide un exercice simple (vidéo, lecture, flashcards)
     */
    validerExercice(type) {
        console.log(`✅ Exercice ${type} validé!`);
        
        // Marquer l'étape comme complétée
        if (window.currentStepId && window.currentChapitreId) {
            // Vérifier si l'étape est déjà complétée
            const chapitre = CHAPITRES.find(ch => ch.id === window.currentChapitreId);
            const etape = chapitre?.etapes.find(e => e.id === window.currentStepId);
            const maxPoints = etape?.points || 10;
            
            this.marquerEtapeComplete(window.currentChapitreId, window.currentStepId);
            
            // Pour les exercices simples (video, lecture, flashcards), l'utilisateur gagne 100% des points
            const result = StorageManager.addPointsToStep(window.currentStepId, maxPoints, maxPoints);
            this.updateHeader();
            console.log(`✅ ${result.message} (${result.totalForStep}/${result.maxPoints} points)`);
        }
        
        showSuccessNotification('🎉 Bravo!', 'Vous avez complété cet exercice!', '🎉', 2000);
        
        // ✅ PASSER À L'EXERCICE SUIVANT OU REVENIR AU MENU
        setTimeout(() => {
            this.allerExerciceSuivant();
        }, 2000);
    },

    /**
     * Retourner une flashcard (flip animation)
     */
    flipCard(cardElement) {
        if (!cardElement) return;
        
        const inner = cardElement.querySelector('.flashcard-inner');
        if (!inner) return;
        
        const isFlipped = cardElement.dataset.flipped === 'true';
        const newState = !isFlipped;
        
        cardElement.dataset.flipped = newState;
        inner.style.transform = newState ? 'rotateY(180deg)' : 'rotateY(0deg)';
        
        console.log(`🎴 Flashcard ${newState ? 'retournée' : 'recto'}`);
    },

    /**
     * SÉLECTIONNER UNE RÉPONSE QCM SCÉNARIO
     */
    selectQCMScenarioOption(optionLabel, containerId) {
        const input = optionLabel.querySelector('.option-input');
        const questionCard = optionLabel.closest('.qcm-scenario-question-card');
        const allOptionsInQuestion = questionCard.querySelectorAll('.option-label');

        // Désélectionner les autres options
        allOptionsInQuestion.forEach(opt => {
            opt.classList.remove('selected');
            opt.style.backgroundColor = '';
            opt.style.borderLeft = 'none';
        });

        // Sélectionner la nouvelle option
        optionLabel.classList.add('selected');
        optionLabel.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
        optionLabel.style.borderLeft = '4px solid var(--color-primary)';

        console.log(`✅ Option sélectionnée: ${input.value}`);
    },

    /**
     * RÉINITIALISER LES RÉPONSES QCM SCÉNARIO
     */
    reinitialiserQCMScenario(containerId) {
        const container = document.getElementById(containerId);

        // Décocher tous les radio buttons
        container.querySelectorAll('.option-input').forEach(input => {
            input.checked = false;
            const label = input.closest('.option-label');
            label.classList.remove('selected');
            label.style.backgroundColor = '';
            label.style.borderLeft = 'none';
        });

        // Masquer les feedbacks
        container.querySelectorAll('.question-feedback').forEach(fb => {
            fb.style.display = 'none';
            fb.innerHTML = '';
        });

        const globalFeedback = container.querySelector(`#qcm-scenario-feedback-${containerId}`);
        globalFeedback.style.display = 'none';
        globalFeedback.innerHTML = '';

        showSuccessNotification('🔄 Réinitialisé', 'Toutes vos réponses ont été effacées');
    },

    /**
     * VALIDER TOUTES LES RÉPONSES QCM SCÉNARIO
     */
    validerQCMScenario(containerId) {
        const container = document.getElementById(containerId);
        const questionCards = container.querySelectorAll('.qcm-scenario-question-card');
        const globalFeedback = container.querySelector(`#qcm-scenario-feedback-${containerId}`);

        let totalQuestions = 0;
        let correctAnswers = 0;
        let totalPoints = 0;
        let earnedPoints = 0;
        const results = [];

        // Parcourir chaque question
        questionCards.forEach((card) => {
            const questionId = card.dataset.questionId;
            const questionPointsElement = card.querySelector('.question-points');
            const questionPoints = parseInt(questionPointsElement.dataset.points);
            const selectedInput = card.querySelector('.option-input:checked');
            const questionFeedback = card.querySelector('.question-feedback');

            totalQuestions++;
            totalPoints += questionPoints;

            if (!selectedInput) {
                // ❌ QUESTION NON RÉPONDUE
                questionFeedback.innerHTML = `
                    <div style="background: rgba(255, 152, 0, 0.15); 
                                border: 1px solid #FF9800;
                                color: #E65100;
                                padding: 12px;
                                border-radius: 6px;
                                font-weight: bold;">
                        ⚠️ Question non répondue (${questionPoints} pts perdus)
                    </div>
                `;
                questionFeedback.style.display = 'block';
                results.push({ questionId, status: 'missing', points: 0 });
                return;
            }

            const isCorrect = selectedInput.dataset.correct === 'true';
            const explanation = selectedInput.dataset.explanation;

            if (isCorrect) {
                // ✅ RÉPONSE CORRECTE
                correctAnswers++;
                earnedPoints += questionPoints;
                
                const selectedLabel = selectedInput.closest('.option-label');
                selectedLabel.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
                selectedLabel.style.borderLeft = '4px solid var(--color-success)';

                questionFeedback.innerHTML = `
                    <div style="background: rgba(34, 197, 94, 0.15);
                                border: 1px solid var(--color-success);
                                color: var(--color-success);
                                padding: 12px;
                                border-radius: 6px;
                                font-weight: bold;">
                        ✅ <strong>Correct!</strong> (+${questionPoints} pts)<br/>
                        <small style="font-weight: normal;">${explanation}</small>
                    </div>
                `;
                questionFeedback.style.display = 'block';
                results.push({ questionId, status: 'correct', points: questionPoints });
            } else {
                // ❌ RÉPONSE INCORRECTE
                const selectedLabel = selectedInput.closest('.option-label');
                selectedLabel.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                selectedLabel.style.borderLeft = '4px solid var(--color-error)';

                // Afficher la bonne réponse
                const goodOption = card.querySelector('.option-input[data-correct="true"]');
                const goodLabel = goodOption.closest('.option-label');
                goodLabel.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
                goodLabel.style.borderLeft = '4px solid var(--color-success)';
                goodLabel.style.color = 'var(--color-success)';

                questionFeedback.innerHTML = `
                    <div style="background: rgba(239, 68, 68, 0.15);
                                border: 1px solid var(--color-error);
                                color: var(--color-error);
                                padding: 12px;
                                border-radius: 6px;
                                font-weight: bold;">
                        ❌ <strong>Incorrect</strong> (0 pts)<br/>
                        <small style="font-weight: normal; color: var(--color-text-light);">
                            Bonne réponse: ${goodOption.closest('.option-label').querySelector('.option-text').textContent}<br/>
                            ${goodOption.dataset.explanation}
                        </small>
                    </div>
                `;
                questionFeedback.style.display = 'block';
                results.push({ questionId, status: 'incorrect', points: 0 });
            }
        });

        // CALCUL FINAL
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const isPassed = percentage >= 70;

        // AFFICHER FEEDBACK GLOBAL
        let feedbackHTML = `
            <div style="${isPassed ? 
                'background: rgba(34, 197, 94, 0.15); border: 2px solid var(--color-success); color: var(--color-success);' :
                'background: rgba(239, 68, 68, 0.15); border: 2px solid var(--color-error); color: var(--color-error);'
            } padding: 20px; border-radius: 10px; text-align: center; font-weight: bold;">
                ${isPassed ? '✅ <strong>SUCCÈS!</strong>' : '❌ <strong>À AMÉLIORER</strong>'}<br/>
                <div style="font-size: 24px; margin: 10px 0;">
                    ${correctAnswers}/${totalQuestions} bonnes réponses (${percentage}%)
                </div>
                <div style="font-size: 18px; margin-top: 10px;">
                    ${earnedPoints}/${totalPoints} points
                </div>
        `;

        if (isPassed) {
            feedbackHTML += `<div style="margin-top: 10px; font-size: 14px;">Vous avez atteint le minimum de 70%!</div>`;
        } else {
            feedbackHTML += `<div style="margin-top: 10px; font-size: 14px;">Vous devez obtenir au moins 70% pour réussir. Essayez à nouveau!</div>`;
        }

        feedbackHTML += `</div>`;

        globalFeedback.innerHTML = feedbackHTML;
        globalFeedback.style.display = 'block';

        // MARQUER COMME COMPLÉTÉE SI RÉUSSI
        if (isPassed && window.currentStepId && window.currentChapitreId) {
            this.marquerEtapeComplete(window.currentChapitreId, window.currentStepId);
            this.addPoints(earnedPoints, `QCM Scénario réussi (${percentage}%)`);

            setTimeout(() => {
                showSuccessNotification('🎉 Bravo!', `Vous avez réussi avec ${percentage}%!`);
                this.fermerModal();
            }, 2500);
        }

        console.log('Résultats:', results);
    },

    /**
     * Marque une étape comme complétée - Améliorée avec SVG re-render
     */
    marquerEtapeComplete(chapitreId, stepId) {
        console.log(`✅ Marquer complète: ${stepId} du chapitre ${chapitreId}`);
        
        const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
        const etape = chapitre?.etapes.find(e => e.id === stepId);
        
        if (etape) {
            etape.completed = true;
            
            // 1️⃣ Sauvegarder dans localStorage
            const stepProgress = {
                completed: true,
                timestamp: new Date().toISOString(),
                score: 100
            };
            localStorage.setItem(`step_${stepId}`, JSON.stringify(stepProgress));
            
            // Calculer la progression du chapitre
            const completedCount = chapitre.etapes.filter(e => e.completed).length;
            chapitre.progression = Math.round((completedCount / chapitre.etapes.length) * 100);
            
            // 2️⃣ Sauvegarder dans le localStorage
            const chaptersProgress = StorageManager.getChaptersProgress();
            if (!chaptersProgress[chapitreId]) {
                chaptersProgress[chapitreId] = {
                    title: chapitre.titre,
                    completion: 0,
                    stepsCompleted: []
                };
            }
            chaptersProgress[chapitreId].completion = chapitre.progression;
            if (!chaptersProgress[chapitreId].stepsCompleted.includes(stepId)) {
                chaptersProgress[chapitreId].stepsCompleted.push(stepId);
            }
            StorageManager.update('chaptersProgress', chaptersProgress);
            
            console.log(`✅ Étape ${stepId} marquée comme complétée`);
            console.log(`📊 Progression du chapitre: ${chapitre.progression}%`);

            // 3️⃣ ✅ NOUVEAU : RE-GÉNÉRER LE SVG avec les nouveaux états
            const pathContainer = document.querySelector(
                `[data-chapitre-id="${chapitreId}"] .path-svg`
            );
            
            if (pathContainer && chapitre) {
                console.log(`🎨 Re-générant SVG pour ${chapitreId}...`);
                
                // Charger les états depuis localStorage avant de régénérer
                chapitre.etapes.forEach(etp => {
                    const progress = localStorage.getItem(`step_${etp.id}`);
                    if (progress) {
                        const parsed = JSON.parse(progress);
                        etp.completed = parsed.completed === true;
                    }
                });
                
                // Régénérer le SVG avec les nouveaux états
                const newSVG = generatePathSVG(chapitre.etapes, chapitre);
                pathContainer.innerHTML = newSVG;
                
                // Re-attacher les événements click sur les nouvelles étapes
                pathContainer.querySelectorAll('.path-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const itemStepId = item.dataset.stepId;
                        if (itemStepId) {
                            // Extraire l'ID du chapitre de l'ID de l'étape (ex: "ch1_step1" → "ch1")
                            const chapId = itemStepId.split('_')[0];
                            App.afficherEtape(chapId);
                        }
                    });
                });

                console.log(`✅ SVG régénéré avec nouveaux états`);
            }

            // Si c'est la dernière étape, afficher le portfolio
            // ✅ CONDITION: Uniquement si on n'est PAS dans l'onglet "pratique"
            const estDerniere = chapitre.etapes.every(e => e.completed);
            const estEnPratique = window.currentPageName === 'pratique';
            
            if (estDerniere && !estEnPratique) {
                console.log('🎉 Tous les objectifs atteints! Affichage portfolio...');
                setTimeout(() => {
                    this.afficherPortfolioModal(chapitreId);
                }, 1500);
            } else if (estDerniere && estEnPratique) {
                console.log('📚 Tous les objectifs atteints mais on est en révision (pratique) - pas d\'ouverture du portfolio');
            }
        }
    },
    
    /**
     * Rafraîchit l'affichage du chapitre
     */
    rafraichirAffichage() {
        if (window.currentChapitreId) {
            setTimeout(() => {
                this.afficherChapitre(window.currentChapitreId);
            }, 500);
        }
    },

    /**
     * Valide un QCM - Version SÉCURISÉE sans exposition réponses
     */
    validerQCMSecurise(qcmId) {
        const qcmData = window.QCM_ANSWERS?.[qcmId];
        if (!qcmData) {
            console.error('❌ QCM ID invalide');
            showErrorNotification('❌ Erreur: QCM invalide');
            return;
        }

        const selectedInput = document.querySelector(
            `input[name="qcm_${qcmId}"]:checked`
        );

        if (!selectedInput) {
            showErrorNotification('⚠️ Veuillez sélectionner une réponse');
            return;
        }

        const selectedIndex = parseInt(selectedInput.value);
        const isCorrect = selectedIndex === qcmData.correctAnswer;

        const feedback = document.getElementById(`feedback_${qcmId}`);
        
        if (isCorrect) {
            feedback.innerHTML = `
                <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 6px;">
                    <strong>✅ Correct!</strong><br/>
                    ${qcmData.explication ? `<p style="margin-top: 8px; font-style: italic;"><strong>💡 Explication:</strong> ${qcmData.explication}</p>` : ''}
                    <button class="btn btn--primary" style="margin-top: 12px; width: 100%;" onclick="App.allerExerciceSuivant()">
                        ➡️ Exercice Suivant
                    </button>
                </div>
            `;
            feedback.style.display = 'block';

            // Marquer comme complétée
            if (window.currentStepId && window.currentChapitreId) {
                const stepProgress = {
                    completed: true,
                    timestamp: new Date().toISOString(),
                    score: 100
                };
                localStorage.setItem(`step_${window.currentStepId}`, JSON.stringify(stepProgress));
                
                this.marquerEtapeComplete(window.currentChapitreId, window.currentStepId);
                const chapitre = CHAPITRES.find(ch => ch.id === window.currentChapitreId);
                const etape = chapitre?.etapes.find(e => e.id === window.currentStepId);
                const maxPoints = etape?.points || 10;
                const result = StorageManager.addPointsToStep(window.currentStepId, maxPoints, maxPoints);
                this.updateHeader();
                console.log(`✅ ${result.message} (${result.totalForStep}/${result.maxPoints} points)`);
            }

            showSuccessNotification('✅ Excellent!', `Bonne réponse!`, '✅', 1500);
        } else {
            feedback.innerHTML = `
                <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 12px; border-radius: 6px;">
                    <strong>❌ Incorrect.</strong><br/>
                    Bonne réponse: <em>${qcmData.options[qcmData.correctAnswer]}</em><br/>
                    ${qcmData.explication ? `<p style="margin-top: 8px; font-style: italic;"><strong>💡 Explication:</strong> ${qcmData.explication}</p>` : ''}
                    <button class="btn btn--secondary" style="margin-top: 12px; width: 100%;" onclick="App.allerExerciceSuivant()">
                        ➡️ Exercice Suivant
                    </button>
                </div>
            `;
            feedback.style.display = 'block';
            selectedInput.checked = false;
        }

        // Nettoyer après validation (optionnel - garder pour rejouer)
        // delete window.QCM_ANSWERS[qcmId];
    },

    /**
     * Valide un QCM (ancienne version - mantenue pour compatibilité)
     */
    validerQCM(stepId) {
        const reponse = document.querySelector('input[name="qcm"]:checked');
        if (!reponse) {
            showSuccessNotification('⚠️ Attention', 'Veuillez sélectionner une réponse!', '⚠️', 2000);
            return;
        }
        
        const isCorrect = reponse.dataset.correct === 'true';
        const feedback = document.getElementById('feedback');
        
        if (isCorrect) {
            feedback.innerHTML = '<p style="color: var(--color-success); font-weight: bold;">✅ Excellente réponse!</p>';
            feedback.style.display = 'block';
            
            // Marquer l'étape comme complétée
            if (window.currentStepId && window.currentChapitreId) {
                const chapitre = CHAPITRES.find(ch => ch.id === window.currentChapitreId);
                const etape = chapitre?.etapes.find(e => e.id === window.currentStepId);
                const maxPoints = etape?.points || 10;
                
                this.marquerEtapeComplete(window.currentChapitreId, window.currentStepId);
                
                // QCM avec une seule réponse = 100% si correct
                const result = StorageManager.addPointsToStep(window.currentStepId, maxPoints, maxPoints);
                this.updateHeader();
                console.log(`✅ ${result.message} (${result.totalForStep}/${result.maxPoints} points)`);
            }
            
            setTimeout(() => {
                showSuccessNotification('✅ Excellent!', `Bonne réponse!`, '✅', 2000);
                App.fermerModal();
                App.rafraichirAffichage();
            }, 1000);
        } else {
            feedback.innerHTML = '<p style="color: var(--color-error); font-weight: bold;">❌ Mauvaise réponse, réessayez!</p>';
            feedback.style.display = 'block';
            reponse.checked = false;
        }
    },

    /**
     * Valide un exercice Vrai/Faux - Affiche la correction et permet de recommencer
     */
    validerVraisFaux(vrfId, totalItems) {
        let allAnswered = true;
        let correctCount = 0;
        let vrfItems = [];
        
        // Récupérer les données du Vrai/Faux (doit être stockées lors du rendu)
        const vrfData = window.VRF_DATA?.[vrfId];
        
        // Vérifier que toutes les questions sont répondues et compter les bonnes
        for (let i = 0; i < totalItems; i++) {
            const itemId = `${vrfId}_${i}`;
            const selected = document.querySelector(`input[name="${itemId}"]:checked`);
            if (!selected) {
                allAnswered = false;
                break;
            }
            
            const userAnswer = selected.value === 'true';
            const isCorrect = vrfData && vrfData.items[i].answer === userAnswer;
            if (isCorrect) {
                correctCount++;
            }
            
            vrfItems.push({
                statement: vrfData?.items[i].statement,
                userAnswer: userAnswer,
                correctAnswer: vrfData?.items[i].answer,
                isCorrect: isCorrect
            });
        }
        
        if (!allAnswered) {
            showErrorNotification('⚠️ Veuillez répondre à toutes les questions');
            return;
        }
        
        const isAllCorrect = correctCount === totalItems;
        const feedback = document.getElementById(`feedback_${vrfId}`);
        
        // Afficher la correction
        let html = `
            <div style="margin-top: var(--spacing-lg); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <div style="margin-bottom: var(--spacing-md); padding: var(--spacing-md); border-radius: var(--radius-md); ${isAllCorrect ? 'background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724;' : 'background-color: #fff3cd; border: 1px solid #ffc107; color: #856404;'}">
                    <strong>${isAllCorrect ? '✅ Parfait! Toutes les réponses sont correctes!' : `⚠️ ${correctCount}/${totalItems} réponses correctes`}</strong>
                </div>
        `;
        
        // Afficher chaque question avec la correction
        vrfItems.forEach((item, index) => {
            const bgColor = item.isCorrect ? '#e7f5e7' : '#ffe7e7';
            const borderColor = item.isCorrect ? '#28a745' : '#dc3545';
            const icon = item.isCorrect ? '✅' : '❌';
            
            html += `
                <div style="margin-bottom: var(--spacing-md); padding: var(--spacing-md); border: 1px solid ${borderColor}; border-radius: var(--radius-md); background-color: ${bgColor};">
                    <p style="margin: 0 0 var(--spacing-sm) 0; font-weight: 500;">${index + 1}. ${item.statement}</p>
                    <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-sm);">
                        <span style="padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-sm); ${item.userAnswer === true ? 'background: #f0f0f0; font-weight: 500;' : ''}">
                            Votre réponse: <strong>${item.userAnswer ? '✅ Vrai' : '❌ Faux'}</strong>
                        </span>
                        ${item.isCorrect ? '' : `
                            <span style="padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-sm); background: #d4edda;">
                                Bonne réponse: <strong>${item.correctAnswer ? '✅ Vrai' : '❌ Faux'}</strong>
                            </span>
                        `}
                    </div>
                </div>
            `;
        });
        
        // Boutons d'action
        if (isAllCorrect) {
            html += `
                <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.allerExerciceSuivant()">
                    ➡️ Exercice Suivant
                </button>
            `;
        } else {
            html += `
                <button class="btn btn--secondary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.recommencerVraisFaux('${vrfId}', ${totalItems})">
                    🔄 Recommencer cet exercice
                </button>
            `;
        }
        
        html += `</div>`;
        
        feedback.innerHTML = html;
        feedback.style.display = 'block';
        
        // Marquer comme complétée SEULEMENT si toutes les réponses sont correctes
        if (isAllCorrect && window.currentStepId && window.currentChapitreId) {
            const stepProgress = {
                completed: true,
                timestamp: new Date().toISOString(),
                score: 100
            };
            localStorage.setItem(`step_${window.currentStepId}`, JSON.stringify(stepProgress));
            this.marquerEtapeComplete(window.currentChapitreId, window.currentStepId);
            const chapitre = CHAPITRES.find(ch => ch.id === window.currentChapitreId);
            const etape = chapitre?.etapes.find(e => e.id === window.currentStepId);
            const maxPoints = etape?.points || 10;
            StorageManager.addPointsToStep(window.currentStepId, maxPoints, maxPoints);
            this.updateHeader();
            
            showSuccessNotification('✅ Excellent!', 'Exercice complété!', '✅', 1500);
        } else if (!isAllCorrect) {
            showSuccessNotification('⚠️ À relire', 'Certaines réponses ne sont pas correctes', '📚', 1500);
        }
    },

    /**
     * Recommence l'exercice Vrai/Faux en réinitialisant les réponses
     */
    recommencerVraisFaux(vrfId, totalItems) {
        // Décocher toutes les réponses
        for (let i = 0; i < totalItems; i++) {
            const itemId = `${vrfId}_${i}`;
            const inputs = document.querySelectorAll(`input[name="${itemId}"]`);
            inputs.forEach(input => input.checked = false);
        }
        
        // Masquer le feedback
        const feedback = document.getElementById(`feedback_${vrfId}`);
        feedback.innerHTML = '';
        feedback.style.display = 'none';
        
        // Scroll vers le haut de l'exercice
        document.querySelector('.etape-modal')?.scrollIntoView({ behavior: 'smooth' });
        
        showSuccessNotification('🔄 Exercice réinitialisé', 'Recommencez à votre rythme', '🎯', 1000);
    },

    /**
     * Valide un exercice Drag-Drop - Vérifie l'ordre final
     */
    validerDragDrop(dragId) {
        const feedback = document.getElementById(`feedback_${dragId}`);
        const container = document.getElementById(dragId);
        const dragData = window.DRAG_DATA?.[dragId];
        
        if (!dragData || !container) {
            feedback.innerHTML = '<p style="color: var(--color-error);">❌ Erreur: données manquantes</p>';
            feedback.style.display = 'block';
            return;
        }
        
        // ✅ Récupérer l'ordre ACTUEL du DOM
        const itemsContainer = container.querySelector('.drag-items');
        const items = itemsContainer.querySelectorAll('.drag-item');
        
        let isAllCorrect = true;
        const results = [];
        
        // Vérifier chaque item
        items.forEach((itemEl, currentPos) => {
            const correctPos = parseInt(itemEl.getAttribute('data-correct-position'));
            const itemIsCorrect = currentPos === correctPos;
            isAllCorrect = isAllCorrect && itemIsCorrect;
            
            const itemLabel = itemEl.querySelector('span')?.textContent || itemEl.textContent;
            
            results.push({
                label: itemLabel,
                expected: correctPos + 1,
                actual: currentPos + 1,
                isCorrect: itemIsCorrect
            });
            
            // ✅ Appliquer le style de feedback visuel
            if (itemIsCorrect) {
                itemEl.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                itemEl.style.borderLeft = '4px solid #22c55e';
            } else {
                itemEl.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                itemEl.style.borderLeft = '4px solid #ef4444';
            }
        });
        
        // Afficher la correction détaillée
        let html = `
            <div style="margin-top: var(--spacing-lg); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <div style="margin-bottom: var(--spacing-md); padding: var(--spacing-md); border-radius: var(--radius-md); ${isAllCorrect ? 'background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724;' : 'background-color: #fff3cd; border: 1px solid #ffc107; color: #856404;'}">
                    <strong>${isAllCorrect ? '✅ Parfait! L\'ordre est correct!' : '⚠️ L\'ordre n\'est pas correct'}</strong>
                </div>
        `;
        
        // Afficher le résultat pour chaque item
        results.forEach((result) => {
            const bgColor = result.isCorrect ? '#e7f5e7' : '#ffe7e7';
            const borderColor = result.isCorrect ? '#28a745' : '#dc3545';
            const icon = result.isCorrect ? '✅' : '❌';
            
            html += `
                <div style="margin-bottom: var(--spacing-md); padding: var(--spacing-md); border: 1px solid ${borderColor}; border-radius: var(--radius-md); background-color: ${bgColor};">
                    <p style="margin: 0 0 var(--spacing-sm) 0; font-weight: 500;">${icon} ${result.label}</p>
                    <div style="font-size: 0.9em; color: var(--color-text-light);">
                        Position: <strong>${result.actual}</strong> ${result.isCorrect ? '' : `(attendue: <strong>${result.expected}</strong>)`}
                    </div>
                </div>
            `;
        });
        
        // Boutons d'action
        if (isAllCorrect) {
            html += `
                <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.allerExerciceSuivant()">
                    ➡️ Exercice Suivant
                </button>
            `;
        } else {
            html += `
                <button class="btn btn--secondary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.recommencerDragDrop('${dragId}')">
                    🔄 Recommencer l'exercice
                </button>
            `;
        }
        
        html += `</div>`;
        
        feedback.innerHTML = html;
        feedback.style.display = 'block';
        
        // ✅ Marquer comme complétée SEULEMENT si l'ordre est correct
        if (isAllCorrect && window.currentStepId && window.currentChapitreId) {
            const stepProgress = {
                completed: true,
                timestamp: new Date().toISOString(),
                score: 100
            };
            localStorage.setItem(`step_${window.currentStepId}`, JSON.stringify(stepProgress));
            this.marquerEtapeComplete(window.currentChapitreId, window.currentStepId);
            const chapitre = CHAPITRES.find(ch => ch.id === window.currentChapitreId);
            const etape = chapitre?.etapes.find(e => e.id === window.currentStepId);
            const maxPoints = etape?.points || 10;
            StorageManager.addPointsToStep(window.currentStepId, maxPoints, maxPoints);
            this.updateHeader();
            
            showSuccessNotification('✅ Excellent!', 'Drag-Drop complété!', '✅', 1500);
        } else if (!isAllCorrect) {
            showSuccessNotification('⚠️ À relire', 'L\'ordre n\'est pas correct', '📚', 1500);
        }
    },

    /**
     * Recommence l'exercice Drag-Drop
     */
    recommencerDragDrop(dragId) {
        const dragData = window.DRAG_DATA?.[dragId];
        if (!dragData) return;
        
        const container = document.getElementById(dragId);
        if (!container) return;
        
        const itemsContainer = container.querySelector('.drag-items');
        if (!itemsContainer) return;
        
        const items = itemsContainer.querySelectorAll('.drag-item');
        
        // ✅ Restaurer l'ordre initial (basé sur correctPosition)
        const itemsByCorrectPos = new Map();
        items.forEach(item => {
            const correctPos = parseInt(item.getAttribute('data-correct-position'));
            itemsByCorrectPos.set(correctPos, item);
        });
        
        // Réorganiser dans le bon ordre initial
        for (let pos = 0; pos < itemsByCorrectPos.size; pos++) {
            const item = itemsByCorrectPos.get(pos);
            if (item) {
                itemsContainer.appendChild(item);
                item.setAttribute('data-current-position', pos);
            }
        }
        
        // Réinitialiser les styles
        items.forEach(item => {
            item.style.backgroundColor = '';
            item.style.borderLeft = '';
        });
        
        // Masquer le feedback
        const feedback = document.getElementById(`feedback_${dragId}`);
        feedback.innerHTML = '';
        feedback.style.display = 'none';
        
        showSuccessNotification('🔄 Exercice réinitialisé', 'Recommencez à votre rythme', '🎯', 1000);
    },

    /**
     * Valide un exercice Likert Scale
     */
    validerLikert(likertId) {
        const feedback = document.getElementById(`feedback_${likertId}`);
        const etapeId = window.currentStepId;
        const chapitreId = window.currentChapitreId;
        
        feedback.innerHTML = `
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 6px;">
                <strong>✅ Merci pour votre auto-évaluation!</strong><br/>
                <button class="btn btn--primary" style="margin-top: 12px; width: 100%;" onclick="App.allerExerciceSuivant()">
                    ➡️ Exercice Suivant
                </button>
            </div>
        `;
        feedback.style.display = 'block';
        
        if (window.currentStepId && window.currentChapitreId) {
            const stepProgress = {
                completed: true,
                timestamp: new Date().toISOString(),
                score: 100
            };
            localStorage.setItem(`step_${window.currentStepId}`, JSON.stringify(stepProgress));
            this.marquerEtapeComplete(window.currentChapitreId, window.currentStepId);
            const chapitre = CHAPITRES.find(ch => ch.id === window.currentChapitreId);
            const etape = chapitre?.etapes.find(e => e.id === window.currentStepId);
            const maxPoints = etape?.points || 10;
            StorageManager.addPointsToStep(window.currentStepId, maxPoints, maxPoints);
            this.updateHeader();
        }
        
        showSuccessNotification('✅ Merci!', 'Auto-évaluation enregistrée!', '✅', 1500);
    },

    /**
     * Valide un quiz
     */
    validerQuiz() {
        // Trouver toutes les questions avec leurs réponses
        const allInputs = document.querySelectorAll('input[data-correct]');
        let totalQuestions = 0;
        let correctAnswers = 0;
        
        // Compter les questions et les réponses correctes
        const processedQuestions = new Set();
        allInputs.forEach(input => {
            const questionName = input.name;
            if (!processedQuestions.has(questionName)) {
                processedQuestions.add(questionName);
                totalQuestions++;
                
                const selectedInput = document.querySelector(`input[name="${questionName}"]:checked`);
                if (selectedInput && selectedInput.dataset.correct === 'true') {
                    correctAnswers++;
                }
            }
        });
        
        // Afficher les réponses correctes
        const feedback = document.getElementById('quiz-feedback');
        let feedbackHtml = `
            <div style="background: ${correctAnswers === totalQuestions ? '#d4edda' : '#fff3cd'}; border: 1px solid ${correctAnswers === totalQuestions ? '#c3e6cb' : '#ffeaa7'}; padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h4 style="margin-top: 0; color: ${correctAnswers === totalQuestions ? '#155724' : '#856404'};">
                    ${correctAnswers === totalQuestions ? '✅ Excellent!' : '⚠️ Résultats'}
                </h4>
                <p style="margin: var(--spacing-sm) 0; color: ${correctAnswers === totalQuestions ? '#155724' : '#856404'};">
                    Vous avez réussi <strong>${correctAnswers}/${totalQuestions}</strong> questions
                </p>
        `;
        
        // Afficher les réponses correctes pour chaque question
        const questionGroups = new Map();
        allInputs.forEach(input => {
            const questionName = input.name;
            if (!questionGroups.has(questionName)) {
                const label = input.closest('label');
                const question = label ? label.closest('div').previousElementSibling.textContent : 'Question';
                questionGroups.set(questionName, { question, inputs: [] });
            }
            questionGroups.get(questionName).inputs.push(input);
        });
        
        // Afficher les résultats détaillés
        feedbackHtml += `<div style="margin-top: var(--spacing-md); border-top: 1px solid rgba(0,0,0,0.1); padding-top: var(--spacing-md);">`;
        questionGroups.forEach(({ question, inputs }) => {
            const correctInput = inputs.find(i => i.dataset.correct === 'true');
            const selectedInput = inputs.find(i => i.checked);
            
            feedbackHtml += `
                <div style="margin-bottom: var(--spacing-md); padding: var(--spacing-sm); background: white; border-radius: var(--radius-sm);">
                    <p style="margin: 0; font-weight: bold; color: #333;">${question}</p>
                    <p style="margin: var(--spacing-xs) 0; color: #666;">
                        <strong>Bonne réponse:</strong> ${correctInput.closest('label').textContent.trim()}
                    </p>
                    ${selectedInput ? `<p style="margin: var(--spacing-xs) 0; color: ${selectedInput.dataset.correct === 'true' ? '#28a745' : '#dc3545'};">
                        <strong>Votre réponse:</strong> ${selectedInput.closest('label').textContent.trim()}
                    </p>` : ''}
                </div>
            `;
        });
        
        feedbackHtml += `</div></div>`;
        
        feedback.innerHTML = feedbackHtml;
        feedback.style.display = 'block';
        
        // Désactiver le bouton et les inputs
        document.querySelector('button[onclick="App.validerQuiz()"]').disabled = true;
        allInputs.forEach(input => input.disabled = true);
        
        console.log(`Quiz soumis: ${correctAnswers}/${totalQuestions}`);
        
        // Marquer l'étape comme complétée si au moins 50% sont correctes
        if (correctAnswers >= Math.ceil(totalQuestions / 2)) {
            if (window.currentStepId && window.currentChapitreId) {
                const chapitre = CHAPITRES.find(ch => ch.id === window.currentChapitreId);
                const etape = chapitre?.etapes.find(e => e.id === window.currentStepId);
                const maxPoints = etape?.points || 20;
                
                App.marquerEtapeComplete(window.currentChapitreId, window.currentStepId);
                
                // Calculer les points en fonction du pourcentage obtenu
                const percentage = Math.round((correctAnswers / totalQuestions) * 100);
                const pointsEarned = Math.round((percentage / 100) * maxPoints);
                
                const result = StorageManager.addPointsToStep(window.currentStepId, pointsEarned, maxPoints);
                App.updateHeader();
                console.log(`✅ ${result.message} (${result.totalForStep}/${result.maxPoints} points)`);

            }
            
            setTimeout(() => {
                const percentage = Math.round((correctAnswers / totalQuestions) * 100);
                showSuccessNotification('🎊 Quiz complété!', `${percentage}% (${correctAnswers}/${totalQuestions} bonnes réponses)`, '🎊', 2500);
                App.fermerModal();
                App.rafraichirAffichage();
            }, 500);
        } else {
            showSuccessNotification('⚠️ Résultat insuffisant', `Vous avez besoin de plus de 50% pour passer.\nVous avez ${correctAnswers}/${totalQuestions} bonnes réponses.`, '📚', 2500);
        }
    },

    /**
     * Ferme le modal
     */
    fermerModal() {
        document.getElementById('etape-modal').classList.remove('active');
        document.getElementById('etape-detail').innerHTML = '';
    },

    /**
     * Affiche le modal portfolio swipe en fin de chapitre
     * @param {string} chapitreId - ID du chapitre complété
     */
    afficherPortfolioModal(chapitreId) {
        const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
        if (!chapitre) return;

        // ✅ INITIALISER LE PORTFOLIO SWIPE AVEC LE CHAPITRE
        if (typeof PortfolioSwipe !== 'undefined') {
            PortfolioSwipe.init(chapitreId);
        }

        this.chapitreEnCours = chapitreId;
        document.getElementById('portfolio-modal').classList.remove('hidden');
        
        console.log('🎯 Portfolio modal affiché pour', chapitreId);
    },

    /**
     * Ferme le modal portfolio
     */
    fermerPortfolioModal() {
        document.getElementById('portfolio-modal').classList.add('hidden');
    },

    /**
     * Valide le plan de révision et déverrouille le badge
     */
    validerPlanRevision() {
        const planData = PortfolioSwipe.getPlanData();
        
        if (!planData || planData.length === 0) {
            showErrorNotification('⚠️ Plan de révision vide', 'Veuillez ajouter au moins un point de révision');
            return;
        }

        // Sauvegarder le plan dans localStorage
        const plans = JSON.parse(localStorage.getItem('plans') || '{}');
        plans[this.chapitreEnCours] = {
            chapitreId: this.chapitreEnCours,
            data: planData,
            dateCreation: new Date().toISOString()
        };
        localStorage.setItem('plans', JSON.stringify(plans));

        // Déverrouiller le badge
        this.deverrouillerBadge(this.chapitreEnCours);
        
        // Feedback utilisateur
        showSuccessNotification('🎉 Bravo!', 'Votre plan de révision a été sauvegardé!', '📝');
        
        this.fermerPortfolioModal();
        
        // Rafraîchir le tableau de bord après un délai
        setTimeout(() => {
            if (this.currentPage === 'accueil') {
                this.loadPage('accueil');
            }
        }, 1500);
    },

    /**
     * Affiche le modal avec les objectifs du chapitre
     * @param {string} chapitreId - ID du chapitre
     */
    afficherModalObjectives(chapitreId) {
        const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
        if (!chapitre) return;

        const objectivesList = document.getElementById('objectives-list');
        const icons = ['🎯', '📚', '🔍', '💡'];
        
        objectivesList.innerHTML = chapitre.objectifs
            .map((obj, index) => `
                <div class="objective-item">
                    <span class="objective-icon">${icons[index % icons.length]}</span>
                    <p class="objective-text">${obj}</p>
                </div>
            `)
            .join('');

        // Stocker le chapitre actuel en session
        this.chapitreActuel = chapitreId;
        
        const modal = document.getElementById('objectives-modal');
        modal.classList.remove('hidden');

        // Support fermeture: clic outside du modal (sur overlay)
        const overlay = modal;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.fermerModalObjectives();
            }
        }, { once: true });

        // Support fermeture: Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.fermerModalObjectives();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        console.log('📋 Modal objectifs affichés pour:', chapitre.titre);
    },

    /**
     * Ferme le modal objectifs
     */
    fermerModalObjectives() {
        const modal = document.getElementById('objectives-modal');
        modal.classList.add('hidden');
        console.log('✕ Modal objectifs fermé');
    },

    /**
     * Affiche le modal de création de profil au premier démarrage
     */
    showProfileCreationModal() {
        const modal = document.getElementById('profile-creation-modal');
        if (modal) {
            modal.classList.remove('hidden');
            console.log('👤 Modal création profil affichée');
        }
    },

    /**
     * Ferme le modal de création de profil
     */
    closeProfileCreationModal() {
        const modal = document.getElementById('profile-creation-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    /**
     * Sauvegarde le profil utilisateur depuis le formulaire
     */
    saveProfile() {
        const nom = document.getElementById('profile-nom').value.trim();
        const prenom = document.getElementById('profile-prenom').value.trim();
        const matricule = document.getElementById('profile-matricule').value.trim();

        // Validation
        if (!nom || !prenom || !matricule) {
            alert('⚠️ Veuillez remplir tous les champs');
            return;
        }

        // Sauvegarder dans StorageManager
        StorageManager.updateUser({
            nom: nom,
            prenom: prenom,
            matricule: matricule,
            profileCreated: true
        });

        console.log(`👤 Profil créé: ${prenom} ${nom} (${matricule})`);

        // Fermer le modal
        this.closeProfileCreationModal();

        // Afficher notification de succès
        showSuccessNotification('✅ Profil créé!', `Bienvenue ${prenom} ${nom}!`, '🎉', 1500);

        // Initialiser l'app normalement après un court délai
        setTimeout(() => {
            this.init();
        }, 500);
    },

    /**
     * Lance le chapitre après visualisation des objectifs
     */
    commencerChapitre() {
        // ✅ SUPPRIMER L'APPEL AU MODAL - LES OBJECTIFS SONT MAINTENANT UN JALON DANS LE CHEMIN
        // this.fermerModalObjectives();
        this.afficherChapitreContenu(this.chapitreActuel);
    },

    /**
     * Affiche le contenu du chapitre (chemin SVG)
     * @param {string} chapitreId - ID du chapitre
     */
    afficherChapitreContenu(chapitreId) {
        const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
        if (!chapitre) return;
        
        // ✅ PASSER LE CHAPITRE À generatePathSVG POUR AJOUTER LES OBJECTIFS
        const svg = generatePathSVG(chapitre.etapes, chapitre);
        
        let html = `
            <div class="page active">
                <div class="container">
                    <button class="btn-back" onclick="App.loadPage('chapitres')">← Retour aux chapitres</button>
                    <div class="chapitre-card">
                    <div class="chapitre-header" style="background-color: ${chapitre.couleur}; color: white;">
                        <h2>${chapitre.emoji} ${chapitre.titre}</h2>
                        <p>${chapitre.description}</p>
                </div>
                
                <div class="chapitre-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${chapitre.progression}%; background-color: ${chapitre.couleur};"></div>
                    </div>
                    <span class="progress-text">${chapitre.progression}% complété</span>
                </div>
                
                <div class="chapitre-path">
                    ${svg}
                </div>
                
                <div class="chapitre-stats">
                    <div class="stat-item">
                        <span class="stat-number">${chapitre.etapes.length}</span>
                        <span class="stat-label">Étapes</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${chapitre.etapes.reduce((sum, e) => sum + e.points, 0)}</span>
                        <span class="stat-label">Points possibles</span>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        `;
        
        // Injecter dans #app-content, pas dans #chapitre-detail
        document.getElementById('app-content').innerHTML = html;
        
        // ✅ GÉRER LES CLICS SUR LES ÉTAPES, OBJECTIFS ET PORTFOLIO
        document.querySelectorAll('.step-group').forEach((el, index) => {
            const isObjectives = el.dataset.isObjectives === 'true';
            const isPortfolio = el.dataset.isPortfolio === 'true';
            const isMidpoint = el.dataset.isMidpoint === 'true';
            
            el.addEventListener('click', () => {
                const stepId = el.dataset.stepId;
                
                // Si c'est les objectifs
                if (isObjectives) {
                    App.afficherModalObjectives(chapitreId);
                    return;
                }
                
                // Si c'est le portfolio
                if (isPortfolio) {
                    App.afficherPortfolioModal(chapitreId);
                    return;
                }
                
                // Si c'est une étape normale, gérer le verrouillage
                // Compter les étapes non-portfolio/non-objectives avant cet index
                const allStepGroups = Array.from(document.querySelectorAll('.step-group'));
                let etapeIndex = 0;
                for (let i = 0; i < index; i++) {
                    const prevEl = allStepGroups[i];
                    const prevIsObj = prevEl.dataset.isObjectives === 'true';
                    const prevIsPort = prevEl.dataset.isPortfolio === 'true';
                    if (!prevIsObj && !prevIsPort) {
                        etapeIndex++;
                    }
                }
                
                const etapeActuelle = chapitre.etapes[etapeIndex];
                
                // ✅ Seulement refuse si étape > 0 ET étape précédente non complétée
                if (etapeIndex > 0 && chapitre.etapes[etapeIndex - 1] && !chapitre.etapes[etapeIndex - 1].completed) {
                    // Ajouter une animation visuelle au cadenas
                    const lockEmoji = el.querySelector('.step-emoji');
                    if (lockEmoji) {
                        lockEmoji.style.animation = 'shake 0.5s ease-in-out';
                        setTimeout(() => {
                            lockEmoji.style.animation = '';
                        }, 500);
                    }
                    showErrorNotification('⛔ Vous devez compléter l\'étape précédente d\'abord!');
                    return;
                }
                
                // ✅ Si c'est la première étape, afficher directement. Sinon, afficher avec l'index
                App.afficherEtape(chapitreId, etapeIndex);
            });
            
            // ✅ AJOUTER LE STYLE DE CURSEUR - GÉRER LES ÉTAPES VERROUILLÉES
            if (!isObjectives && !isPortfolio) {
                // Compter les étapes avant cet index
                const allStepGroups = Array.from(document.querySelectorAll('.step-group'));
                let etapeIndex = 0;
                for (let i = 0; i < index; i++) {
                    const prevEl = allStepGroups[i];
                    const prevIsObj = prevEl.dataset.isObjectives === 'true';
                    const prevIsPort = prevEl.dataset.isPortfolio === 'true';
                    if (!prevIsObj && !prevIsPort) {
                        etapeIndex++;
                    }
                }
                
                if (chapitre.etapes[etapeIndex] && etapeIndex > 0 && !chapitre.etapes[etapeIndex - 1].completed) {
                    el.style.cursor = 'not-allowed';
                    el.style.opacity = '0.7';
                } else {
                    el.style.cursor = 'pointer';
                }
            } else {
                el.style.cursor = 'pointer';
            }
        });
        
        // ✅ CHARGER LES VIDÉOS DU CHAPITRE
        setTimeout(() => {
            loadChapterVideos(chapitreId);
        }, 100);
    },

    /**
     * Affiche une étape spécifique d'un chapitre avec navigation
     * @param {string} chapitreId - ID du chapitre
     * @param {number} index - Index de l'étape (0-based)
     */
    /**
     * Affiche les exercices d'une étape
     */
    afficherExercicesEtape() {
        // Cette fonction est dépréciée - utiliser remplirExercicesEtape() à la place
    },

    // ═══════════════════════════════════════════════════════════
    // MÉTHODES DE RENDU DES PAGES
    // ═══════════════════════════════════════════════════════════
    
    renderAccueil() {
        // Calculer progression globale
        const totalEtapes = CHAPITRES.reduce((sum, ch) => sum + ch.etapes.length, 0);
        const completedEtapes = CHAPITRES.reduce((sum, ch) => sum + ch.etapes.filter(e => e.completed).length, 0);
        const progressionGlobale = Math.round((completedEtapes / totalEtapes) * 100);
        
        // Trouver le dernier chapitre actif pour bouton "Continuer"
        const chapitreActif = CHAPITRES.find(ch => {
            const hasCompleted = ch.etapes.some(e => e.completed);
            const hasIncomplete = ch.etapes.some(e => !e.completed);
            return hasCompleted && hasIncomplete;
        }) || CHAPITRES.find(ch => !ch.etapes.every(e => e.completed));
        
        let html = `
            <div class="page active">
                <!-- SECTION NIVEAUX (chargée dynamiquement) -->
                <div id="niveaux-container-accueil" class="niveaux-section-accueil">
                    <div style="text-align: center; padding: 40px 20px;">
                        <p>⏳ Chargement des niveaux...</p>
                    </div>
                </div>

            <div class="page active">
                <!-- HEADER ACCUEIL -->
                <div class="accueil-header">
                    <div class="accueil-welcome">
                        <h1>Bienvenue sur la plateforme!</h1>
                        <p class="accueil-subtitle">Formation continue Douane - Et si on jouait? 🎓</p>
                    </div>
                    
                    <!-- PROGRESSION GLOBALE -->
                    <div class="accueil-progress-section">
                        <h3>Votre progression globale</h3>
                        <div class="progress-bar progress-large">
                            <div class="progress-fill" style="width: ${progressionGlobale}%;"></div>
                        </div>
                        <div class="progress-stats">
                            <span>${completedEtapes}/${totalEtapes} étapes complétées</span>
                            <span class="progress-percent">${progressionGlobale}%</span>
                        </div>
                    </div>
                    
                    <!-- BOUTON CONTINUER -->
                    ${chapitreActif ? `
                    <div class="accueil-action">
                        <button class="btn btn--primary btn--large" onclick="App.afficherChapitre('${chapitreActif.id}')">
                            ▶ Continuer: ${chapitreActif.titre}
                        </button>
                        <p class="accueil-action-subtitle">Reprenez là où vous vous étiez arrêté</p>
                    </div>
                    ` : `
                    <div class="accueil-action">
                        <button class="btn btn--primary btn--large" onclick="App.afficherChapitre('${CHAPITRES[0].id}')">
                            ▶ Commencer la formation
                        </button>
                        <p class="accueil-action-subtitle">Démarrez votre première étape</p>
                    </div>
                    `}
                </div>
                
                <!-- CHAPITRES EN COURS -->
                <div class="accueil-content">
                    <h2>Mes Chapitres</h2>
                    <div class="chapitres-grid accueil-chapitres">
        `;
        
        // Boucle sur tous les chapitres
        CHAPITRES.forEach(chapitre => {
            const completed = chapitre.etapes.filter(e => e.completed).length;
            const total = chapitre.etapes.length;
            const percent = Math.round((completed / total) * 100);
            
            // Déterminer le statut
            let statut = 'verrouille';
            let statutIcon = '🔒';
            let statutColor = '#95A5A6';
            
            if (percent === 100) {
                statut = 'complete';
                statutIcon = '✅';
                statutColor = '#2ECC71';
            } else if (completed > 0) {
                statut = 'en_cours';
                statutIcon = '⚡';
                statutColor = '#F39C12';
            }
            
            html += `
                <div class="chapitre-card-accueil" 
                     style="border-left: 5px solid ${chapitre.couleur};"
                     onclick="App.afficherChapitre('${chapitre.id}')"
                     data-chapitre-id="${chapitre.id}">
                    <div class="chapitre-card-header">
                        <div class="chapitre-card-title">
                            <h3>${chapitre.emoji} ${chapitre.titre}</h3>
                            <span class="chapitre-status" style="background: ${statutColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px;">
                                ${statutIcon} ${statut === 'complete' ? 'Complété' : statut === 'en_cours' ? 'En cours' : 'Verrouillé'}
                            </span>
                        </div>
                    </div>
                    
                    <p class="chapitre-card-description">${chapitre.description}</p>
                    
                    <div class="progress-bar progress-small">
                        <div class="progress-fill" style="width: ${percent}%; background-color: ${chapitre.couleur};"></div>
                    </div>
                    <div class="progress-text-small">${percent}% (${completed}/${total})</div>
                </div>
            `;
        });
        
        html += `
                    </div>
                    
                    <!-- STATS RAPIDES -->
                    <div class="accueil-stats">
                        <div class="stat-card">
                            <div class="stat-icon">⭐</div>
                            <div class="stat-content">
                                <div class="stat-value">${StorageManager.getUser().totalPoints}</div>
                                <div class="stat-label">Points gagnés</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🏆</div>
                            <div class="stat-content">
                                <div class="stat-value">${CHAPITRES.filter(ch => ch.etapes.every(e => e.completed)).length}</div>
                                <div class="stat-label">Chapitres maîtrisés</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📚</div>
                            <div class="stat-content">
                                <div class="stat-value">${CHAPITRES.length}</div>
                                <div class="stat-label">Chapitres total</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- À PROPOS -->
                    <section id="about" style="margin-top: 40px; padding: 20px; background: #f0f0f0; border-radius: 8px;">
                        <h2>📋 À propos</h2>
                        <p><strong>Version:</strong> 2.1 (Décembre 2025)</p>
                        <p><strong>Plateforme:</strong> GitHub Pages</p>
                        <p><strong>Durée de formation:</strong> 15-20 heures</p>
                        <p><strong>Documentation:</strong></p>
                        <ul style="margin: 10px 0 0 20px;">
                            <li><a href="https://github.com/patrickcarreira88-svg/la-douane-en-s-amusant" target="_blank" style="color: #0066cc; text-decoration: none;">📍 Code source (GitHub)</a></li>
                            <li><a href="docs/GUIDE_UTILISATEUR.md" target="_blank" style="color: #0066cc; text-decoration: none;">📖 Guide utilisateur</a></li>
                            <li><a href="docs/GUIDE_AUTEUR.md" target="_blank" style="color: #0066cc; text-decoration: none;">✍️ Guide auteur</a></li>
                            <li><a href="docs/GUIDE_ADMIN.md" target="_blank" style="color: #0066cc; text-decoration: none;">🔧 Guide admin</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        `;
        
        return html;
    },
    
    renderChapitres() {
        if (!CHAPITRES || CHAPITRES.length === 0) {
            return `
                <div class="page active">
                    <div class="page-title">
                        <span>📚</span>
                        <h2>Mes Chapitres</h2>
                    </div>
                    <div class="loading">Chargement des chapitres...</div>
                </div>
            `;
        }
        
        let html = `
            <div class="page active">
                <div class="page-title">
                    <span>📚</span>
                    <h2>Mes Chapitres</h2>
                </div>
                
                <div class="container">
                    <div class="chapitres-list">
        `;
        
        // Afficher tous les chapitres
        CHAPITRES.forEach(chapitre => {
            const completed = chapitre.etapes.filter(e => e.completed).length;
            const total = chapitre.etapes.length;
            const percent = Math.round((completed / total) * 100);
            
            html += `
                <div class="chapitre-card" onclick="App.afficherChapitre('${chapitre.id}')" data-chapitre-id="${chapitre.id}">
                    <div class="chapitre-card-header" style="background-color: ${chapitre.couleur}; color: white;">
                        <h3>${chapitre.emoji} ${chapitre.titre}</h3>
                    </div>
                    <div class="chapitre-card-body">
                        <p>${chapitre.description}</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percent}%; background-color: ${chapitre.couleur};"></div>
                        </div>
                        <span class="progress-text">${percent}% (${completed}/${total} étapes)</span>
                    </div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        return html;
    },
    
    renderPratique() {
        // Récupérer les exercices validés (de chapitres complétés)
        const exercicesValides = [];
        let chapitreIdExercice = null;
        
        CHAPITRES.forEach(ch => {
            if (ch.etapes.some(e => e.completed)) {
                ch.etapes.filter(e => e.completed).forEach(e => {
                    exercicesValides.push({
                        id: e.id,
                        titre: e.titre,
                        chapitre: ch.titre,
                        chapitreId: ch.id,
                        type: e.type,
                        points: e.points
                    });
                });
            }
        });
        
        if (exercicesValides.length === 0) {
            return `
                <div class="page active">
                    <div class="page-title">
                        <span>🎯</span>
                        <h2>Exercices de Révision</h2>
                    </div>
                    <div class="container">
                        <div class="empty-state">
                            <div class="empty-icon">📚</div>
                            <h3>Aucun exercice disponible</h3>
                            <p>Complétez au moins une étape pour accéder aux exercices de révision</p>
                            <button class="btn btn--primary" onclick="App.loadPage('chapitres')">Retour aux chapitres</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Récupérer un exercice aléatoire
        const exerciceActuel = exercicesValides[Math.floor(Math.random() * exercicesValides.length)];
        
        return `
            <div class="page active">
                <div class="page-title">
                    <span>🎯</span>
                    <h2>Exercices de Révision</h2>
                </div>
                
                <div class="container">
                    <div class="pratique-header">
                        <p class="pratique-subtitle">Consolidez vos apprentissages</p>
                    </div>
                    
                    <div class="exercice-container">
                        <div class="exercice-card">
                            <div class="exercice-meta">
                                <span class="meta-badge meta-chapitre">${exerciceActuel.chapitre}</span>
                                <span class="meta-badge meta-type">${exerciceActuel.type}</span>
                                <span class="meta-badge meta-points">⭐ ${exerciceActuel.points} pts</span>
                            </div>
                            
                            <h3 class="exercice-titre">${exerciceActuel.titre}</h3>
                            
                            <div class="exercice-content">
                                <p style="color: var(--color-text-light); text-align: center; padding: var(--spacing-lg);">
                                    Exercice ${exerciceActuel.type} - Cliquez pour ouvrir
                                </p>
                            </div>
                            
                            <div class="exercice-actions">
                                <button class="btn btn--primary" onclick="App.afficherEtape('${exerciceActuel.id}', '${exerciceActuel.chapitreId}')">
                                    ▶ Commencer l'exercice
                                </button>
                                <button class="btn btn--secondary" onclick="App.loadPage('pratique')">
                                    ↻ Exercice suivant
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="pratique-stats">
                        <div class="stat-row">
                            <span>Exercices disponibles: <strong>${exercicesValides.length}</strong></span>
                            <span>Points possibles: <strong>${exercicesValides.reduce((s, e) => s + e.points, 0)}</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderJournal() {
        // Récupérer les entrées du journal depuis localStorage
        const journalEntries = JSON.parse(localStorage.getItem('journal_apprentissage') || '[]');
        
        // Verbes Bloom pour aider à la réflexion
        const bloomVerbs = {
            appris: ['Mémoriser', 'Comprendre', 'Analyser'],
            application: ['Appliquer', 'Analyser', 'Évaluer'],
            impact: ['Évaluer', 'Créer']
        };
        
        let html = `
            <div class="page active">
                <div class="page-title">
                    <span>📔</span>
                    <h2>Mon Journal d'Apprentissage</h2>
                </div>
                
                <div class="container journal-container">
                    <!-- FORMULAIRE NOUVELLE ENTRÉE -->
                    <div class="journal-form-section">
                        <h3>📝 Nouvelle Entrée</h3>
                        
                        <div class="journal-form">
                            <div class="form-group">
                                <label>Qu'ai-je appris aujourd'hui?</label>
                                <textarea id="journal-appris" placeholder="Décrivez vos apprentissages..." maxlength="500"></textarea>
                                <div class="bloom-buttons">
                                    ${bloomVerbs.appris.map(v => `<button class="bloom-btn" onclick="document.getElementById('journal-appris').value += '\\n[${v}] '">${v}</button>`).join('')}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Comment l'appliquer?</label>
                                <textarea id="journal-application" placeholder="Cas d'usage pratique..." maxlength="500"></textarea>
                                <div class="bloom-buttons">
                                    ${bloomVerbs.application.map(v => `<button class="bloom-btn" onclick="document.getElementById('journal-application').value += '\\n[${v}] '">${v}</button>`).join('')}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Quel impact personnel?</label>
                                <textarea id="journal-impact" placeholder="Votre réflexion personnelle..." maxlength="500"></textarea>
                                <div class="bloom-buttons">
                                    ${bloomVerbs.impact.map(v => `<button class="bloom-btn" onclick="document.getElementById('journal-impact').value += '\\n[${v}] '">${v}</button>`).join('')}
                                </div>
                            </div>
                            
                            <button class="btn btn--primary" onclick="App.sauvegarderJournalEntree()">
                                💾 Enregistrer l'entrée
                            </button>
                        </div>
                    </div>
                    
                    <!-- HISTORIQUE ENTRÉES -->
                    <div class="journal-history-section">
                        <h3>📚 Historique (${journalEntries.length} entrées)</h3>
                        
                        ${journalEntries.length === 0 ? `
                            <div class="empty-state">
                                <p>Aucune entrée de journal pour le moment</p>
                                <p style="color: var(--color-text-light); font-size: 14px;">Commencez à réfléchir à votre apprentissage</p>
                            </div>
                        ` : `
                            <div class="entries-list">
                                ${journalEntries.reverse().map((entry, idx) => `
                                    <div class="journal-entry">
                                        <div class="entry-header">
                                            <div class="entry-date">${new Date(entry.date).toLocaleDateString('fr-FR')}</div>
                                            <button class="btn-delete" onclick="App.supprimerJournalEntree(${journalEntries.length - 1 - idx})">🗑️</button>
                                        </div>
                                        <div class="entry-content">
                                            <div class="entry-section">
                                                <h4>📖 Appris</h4>
                                                <p>${entry.reflexion.appris || '(vide)'}</p>
                                            </div>
                                            <div class="entry-section">
                                                <h4>⚙️ Application</h4>
                                                <p>${entry.reflexion.application || '(vide)'}</p>
                                            </div>
                                            <div class="entry-section">
                                                <h4>💡 Impact</h4>
                                                <p>${entry.reflexion.impact || '(vide)'}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        // Auto-focus sur première textarea après rendu
        setTimeout(() => {
            const ta = document.getElementById('journal-appris');
            if (ta) ta.focus();
        }, 100);
        
        return html;
    },
    
    renderProfil() {
        // Récupérer données utilisateur
        const user = StorageManager.getUser();
        
        // Calculer statistiques
        const totalEtapes = CHAPITRES.reduce((s, ch) => s + ch.etapes.length, 0);
        const completedEtapes = CHAPITRES.reduce((s, ch) => s + ch.etapes.filter(e => e.completed).length, 0);
        const chapitresComplets = CHAPITRES.filter(ch => ch.etapes.every(e => e.completed)).length;
        const points = user.totalPoints;
        
        // Badges
        const badges = [
            { id: 'expert_global', nom: 'Expert Douanier', icon: '🏆', unlocked: chapitresComplets === CHAPITRES.length },
            ...CHAPITRES.map((ch, idx) => ({
                id: `ch${idx + 1}_maitre`,
                nom: `Maître de ${ch.titre}`,
                icon: '👑',
                unlocked: ch.etapes.every(e => e.completed)
            }))
        ];
        
        const badgesUnlocked = badges.filter(b => b.unlocked).length;
        
        // Affichage du profil: lecture seule si créé, sinon afficher message
        let profilHtml = '';
        if (user.profileCreated && user.nom && user.prenom && user.matricule) {
            profilHtml = `
                <div class="profil-section profil-user">
                    <h3>👤 Mon Profil</h3>
                    <div class="user-info-display">
                        <div class="info-item">
                            <label>Prénom</label>
                            <p class="info-value">${user.prenom}</p>
                        </div>
                        <div class="info-item">
                            <label>Nom</label>
                            <p class="info-value">${user.nom}</p>
                        </div>
                        <div class="info-item">
                            <label>Numéro de Matricule</label>
                            <p class="info-value">${user.matricule}</p>
                        </div>
                    </div>
                    <p class="profil-info-note">ℹ️ <em>Votre profil a été créé et ne peut pas être modifié.</em></p>
                </div>
            `;
        } else {
            profilHtml = `
                <div class="profil-section profil-user">
                    <h3>👤 Mon Profil</h3>
                    <p class="profil-message">Votre profil n'a pas encore été créé. Rechargez la page pour initialiser votre profil.</p>
                </div>
            `;
        }
        
        return `
            <div class="page active">
                <div class="page-title">
                    <span>👤</span>
                    <h2>Mon Profil</h2>
                </div>
                
                <div class="container profil-container">
                    <!-- SECTION INFOS UTILISATEUR -->
                    ${profilHtml}
                    
                    <!-- SECTION STATISTIQUES -->
                    <div class="profil-section profil-stats">
                        <h3>Statistiques</h3>
                        <div class="stats-grid">
                            <div class="stat-box">
                                <div class="stat-box-icon">⭐</div>
                                <div class="stat-box-value">${points}</div>
                                <div class="stat-box-label">Points gagnés</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-box-icon">✅</div>
                                <div class="stat-box-value">${completedEtapes}/${totalEtapes}</div>
                                <div class="stat-box-label">Étapes complétées</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-box-icon">🏆</div>
                                <div class="stat-box-value">${chapitresComplets}/${CHAPITRES.length}</div>
                                <div class="stat-box-label">Chapitres maîtrisés</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-box-icon">🎖️</div>
                                <div class="stat-box-value">${badgesUnlocked}</div>
                                <div class="stat-box-label">Badges déverrouillés</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SECTION BADGES -->
                    <div class="profil-section profil-badges">
                        <h3>Mes Badges</h3>
                        <div class="badges-grid">
                            ${badges.map(badge => `
                                <div class="badge ${badge.unlocked ? 'badge-unlocked' : 'badge-locked'}">
                                    <div class="badge-icon">${badge.icon}</div>
                                    <div class="badge-name">${badge.nom}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- SECTION SAUVEGARDE/IMPORT -->
                    <div class="profil-section profil-storage">
                        <h3>Gestion Données</h3>
                        <div class="storage-actions">
                            <button class="btn btn--primary" onclick="App.exporterSauvegarde()">
                                📥 Exporter sauvegarde
                            </button>
                            <button class="btn btn--secondary" onclick="App.importerSauvegarde()">
                                📤 Importer sauvegarde
                            </button>
                            <button class="btn btn--danger" onclick="App.reinitialiserDonnees()">
                                🗑️ Réinitialiser données
                            </button>
                        </div>
                        <p class="storage-hint">Exportez vos données pour les sauvegarder ou les transférer sur un autre appareil</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Déverrouille un badge de compétence
     * @param {string} chapitreId - ID du chapitre
     */
    deverrouillerBadge(chapitreId) {
        const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
        if (!chapitre) return;

        const badge = {
            id: `badge_${chapitreId}`,
            titre: `Maître de ${chapitre.titre}`,
            emoji: chapitre.emoji || '🎖️',
            chapitre: chapitreId,
            condition: 'plan_revision_created',
            debloque: true,
            dateDeblocage: new Date().toISOString()
        };

        // Sauvegarder dans localStorage
        let badges = JSON.parse(localStorage.getItem('badges') || '{}');
        badges[badge.id] = badge;
        localStorage.setItem('badges', JSON.stringify(badges));

        // Animation notification
        this.afficherNotificationBadge(badge);
        
        // Mettre à jour l'en-tête
        this.updateHeader();
    },

    /**
     * Affiche une notification animée de badge
     */
    afficherNotificationBadge(badge) {
        const notif = document.createElement('div');
        notif.className = 'badge-notification';
        notif.innerHTML = `
            <div class="badge-content">
                <span class="badge-emoji">${badge.emoji}</span>
                <div>
                    <p class="badge-titre">Badge déverrouillé!</p>
                    <p class="badge-soustitre">${badge.titre}</p>
                </div>
            </div>
        `;
        document.body.appendChild(notif);

        // Animation et suppression
        setTimeout(() => notif.classList.add('show'), 10);
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    },
    
    updateHeader() {
        const user = StorageManager.getUser();
        const badges = StorageManager.getBadges();
        
        const pointsEl = document.getElementById('pointsDisplay');
        const daysEl = document.getElementById('daysDisplay');
        const badgesEl = document.getElementById('badgesDisplay');
        
        if (pointsEl) pointsEl.textContent = user.totalPoints;
        if (daysEl) daysEl.textContent = user.consecutiveDays;
        if (badgesEl) badgesEl.textContent = badges.length;
    },
    
    // ═══════════════════════════════════════════════════════════════
    // MÉTHODES JOURNAL D'APPRENTISSAGE (Onglet 4)
    // ═══════════════════════════════════════════════════════════════
    
    sauvegarderJournalEntree() {
        const appris = document.getElementById('journal-appris')?.value.trim();
        const application = document.getElementById('journal-application')?.value.trim();
        const impact = document.getElementById('journal-impact')?.value.trim();
        
        if (!appris && !application && !impact) {
            showErrorNotification('⚠️ Entrée vide', 'Veuillez remplir au moins un champ');
            return;
        }
        
        // Créer l'entrée
        const entry = {
            date: new Date().toISOString(),
            reflexion: { appris, application, impact }
        };
        
        // Sauvegarder dans localStorage
        const journal = JSON.parse(localStorage.getItem('journal_apprentissage') || '[]');
        journal.push(entry);
        localStorage.setItem('journal_apprentissage', JSON.stringify(journal));
        
        // Feedback
        showSuccessNotification('✅ Entrée sauvegardée', 'Votre réflexion a été enregistrée', '📔');
        
        // Réinitialiser formulaire et rafraîchir
        setTimeout(() => {
            this.loadPage('journal');
        }, 1000);
    },
    
    supprimerJournalEntree(index) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée?')) return;
        
        const journal = JSON.parse(localStorage.getItem('journal_apprentissage') || '[]');
        journal.splice(index, 1);
        localStorage.setItem('journal_apprentissage', JSON.stringify(journal));
        
        showSuccessNotification('✅ Supprimée', 'Entrée supprimée avec succès');
        this.loadPage('journal');
    },
    
    // ═══════════════════════════════════════════════════════════════
    // MÉTHODES PROFIL UTILISATEUR (Onglet 5)
    // ═══════════════════════════════════════════════════════════════
    
    sauvegarderProfilUtilisateur() {
        const prenom = document.getElementById('user-prenom')?.value.trim();
        const nom = document.getElementById('user-nom')?.value.trim();
        const matricule = document.getElementById('user-matricule')?.value.trim();
        
        if (!prenom || !nom) {
            showErrorNotification('⚠️ Champs obligatoires', 'Veuillez remplir Prénom et Nom');
            return;
        }
        
        // Sauvegarder dans localStorage
        const userData = JSON.parse(localStorage.getItem('user_douanes_formation') || '{}');
        userData.user = { prenom, nom, matricule: matricule || 'N/A' };
        userData.lastUpdated = new Date().toISOString();
        localStorage.setItem('user_douanes_formation', JSON.stringify(userData));
        
        showSuccessNotification('✅ Profil mis à jour', `Bienvenue ${prenom} ${nom}!`);
    },
    
    exporterSauvegarde() {
        const userData = JSON.parse(localStorage.getItem('user_douanes_formation') || '{}');
        const journal = JSON.parse(localStorage.getItem('journal_apprentissage') || '[]');
        const plans = JSON.parse(localStorage.getItem('plans') || '{}');
        
        // Créer objet sauvegarde complet
        const sauvegarde = {
            version: '1.0',
            dateExport: new Date().toISOString(),
            user: userData.user || {},
            progression: userData.progression || {},
            badges: userData.badges || {},
            points: userData.points || 0,
            journal: journal,
            plans: plans,
            metadata: {
                dateCreation: userData.dateCreation || new Date().toISOString(),
                dateLastUpdate: userData.lastUpdated || new Date().toISOString(),
                navigateur: navigator.userAgent
            }
        };
        
        // Télécharger fichier JSON
        const json = JSON.stringify(sauvegarde, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `douanes-formation-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showSuccessNotification('✅ Exportée', 'Votre sauvegarde a été téléchargée', '📥');
    },
    
    importerSauvegarde() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const sauvegarde = JSON.parse(event.target.result);
                    
                    // Validation structure
                    if (!sauvegarde.user || !sauvegarde.progression) {
                        throw new Error('Format de sauvegarde invalide');
                    }
                    
                    // Confirmation
                    if (!confirm('Êtes-vous sûr? Cela remplacera TOUTES vos données actuelles.')) {
                        return;
                    }
                    
                    // Restaurer données
                    localStorage.setItem('user_douanes_formation', JSON.stringify(sauvegarde));
                    localStorage.setItem('journal_apprentissage', JSON.stringify(sauvegarde.journal || []));
                    localStorage.setItem('plans', JSON.stringify(sauvegarde.plans || {}));
                    
                    showSuccessNotification('✅ Importée', 'Vos données ont été restaurées');
                    
                    // Recharger page
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } catch (err) {
                    showErrorNotification('❌ Erreur', `Impossible d'importer: ${err.message}`);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },
    
    reinitialiserDonnees() {
        if (!confirm('⚠️ ATTENTION: Cette action est IRRÉVERSIBLE. Tous vos données seront supprimées!')) {
            return;
        }
        if (!confirm('Êtes-vous vraiment sûr?')) {
            return;
        }
        
        // Supprimer toutes les clés localStorage
        localStorage.clear();
        
        showSuccessNotification('✅ Réinitalisée', 'Toutes vos données ont été supprimées');
        
        // Recharger page
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
};


// ═══════════════════════════════════════════════════════════════
// INITIALISATION UNIQUE
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    // Initialiser le StorageManager
    StorageManager.init();
    
    // Vérifier et mettre à jour les jours consécutifs
    const user = StorageManager.getUser();
    const today = new Date().toDateString();
    const lastActivityDate = user.lastActivityDate ? new Date(user.lastActivityDate).toDateString() : null;
    
    if (lastActivityDate !== today) {
        // C'est une nouvelle journée
        if (lastActivityDate === new Date(Date.now() - 86400000).toDateString()) {
            // Hier était le dernier accès - augmenter les jours consécutifs
            user.consecutiveDays = (user.consecutiveDays || 0) + 1;
        } else {
            // Briser la chaîne - recommencer à 1
            user.consecutiveDays = 1;
        }
        
        user.lastActivityDate = new Date().toISOString();
        StorageManager.updateUser(user);
    }
    
    // Charger les chapitres
    CHAPITRES = await loadChapitres();
    // Mettre à jour alias
    window.CHAPTERS = CHAPITRES;
    console.log('✅ CHAPITRES et CHAPTERS alias initialisés');
    
    // Charger la progression sauvegardée
    const chaptersProgress = StorageManager.getChaptersProgress();
    CHAPITRES.forEach(chapitre => {
        if (chaptersProgress[chapitre.id]) {
            const progress = chaptersProgress[chapitre.id];
            // Marquer les étapes comme complétées
            if (progress.stepsCompleted && Array.isArray(progress.stepsCompleted)) {
                progress.stepsCompleted.forEach(stepId => {
                    const etape = chapitre.etapes.find(e => e.id === stepId);
                    if (etape) {
                        etape.completed = true;
                    }
                });
            }
            // Restaurer la progression
            chapitre.progression = progress.completion || 0;
            console.log(`✅ Progression du chapitre ${chapitre.id} restaurée: ${chapitre.progression}%`);
        }
    });
    
    // ═══════════════════════════════════════════════════════════
    // VALIDATION SYSTÈME (À appeler en console: VALIDATE_SYSTEM())
    // ═══════════════════════════════════════════════════════════
    window.VALIDATE_SYSTEM = function() {
        console.clear();
        console.log('%c🔍 VALIDATION SYSTÈME - ONGLET 2 APPRENTISSAGE', 'font-size: 18px; font-weight: bold; color: #4A3F87;');
        console.log('═'.repeat(60));
        
        const results = {
            passed: [],
            failed: [],
            warnings: []
        };
        
        // ✅ TEST 1: Existence des fonctions critiques
        const criticalFunctions = [
            'afficherChapitre',
            'afficherChapitreContenu',
            'afficherModalObjectives',
            'afficherPortfolioModal',
            'marquerEtapeComplete',
            'afficherEtape'
        ];
        
        console.log('\n%c✓ Test 1: Fonctions critiques', 'color: #2ECC71; font-weight: bold;');
        criticalFunctions.forEach(fn => {
            if (typeof App[fn] === 'function') {
                console.log(`  ✅ ${fn}`);
                results.passed.push(`Function ${fn} exists`);
            } else {
                console.log(`  ❌ ${fn} - MANQUANTE!`);
                results.failed.push(`Function ${fn} missing`);
            }
        });
        
        // ✅ TEST 2: Données CHAPITRES chargées
        console.log('\n%c✓ Test 2: Données CHAPITRES', 'color: #2ECC71; font-weight: bold;');
        if (window.CHAPITRES && Array.isArray(window.CHAPITRES)) {
            console.log(`  ✅ CHAPITRES array exists (${CHAPITRES.length} chapitres)`);
            results.passed.push(`CHAPITRES loaded: ${CHAPITRES.length}`);
            
            // Vérifier chaque chapitre
            CHAPITRES.forEach((ch, idx) => {
                const hasId = !!ch.id;
                const hasTitle = !!ch.titre;
                const hasEtapes = Array.isArray(ch.etapes) && ch.etapes.length > 0;
                const hasObjectifs = Array.isArray(ch.objectifs) && ch.objectifs.length > 0;
                
                if (hasId && hasTitle && hasEtapes && hasObjectifs) {
                    console.log(`    ✅ Chapitre ${idx + 1}: "${ch.titre}" (${ch.etapes.length} étapes, ${ch.objectifs.length} objectifs)`);
                    results.passed.push(`Chapitre ${ch.id} structure OK`);
                } else {
                    console.log(`    ⚠️ Chapitre ${idx + 1}: Structure incomplète`);
                    results.warnings.push(`Chapitre ${ch.id} missing: ${!hasId ? 'id' : ''} ${!hasTitle ? 'titre' : ''} ${!hasEtapes ? 'etapes' : ''} ${!hasObjectifs ? 'objectifs' : ''}`);
                }
            });
        } else {
            console.log(`  ❌ CHAPITRES non chargée`);
            results.failed.push('CHAPITRES array missing');
        }
        
        // ✅ TEST 3: PortfolioSwipe disponible
        console.log('\n%c✓ Test 3: PortfolioSwipe', 'color: #2ECC71; font-weight: bold;');
        if (typeof window.PortfolioSwipe === 'object' && typeof PortfolioSwipe.init === 'function') {
            console.log(`  ✅ PortfolioSwipe.init() disponible`);
            results.passed.push('PortfolioSwipe loaded');
        } else {
            console.log(`  ❌ PortfolioSwipe.init() manquante`);
            results.failed.push('PortfolioSwipe missing');
        }
        
        // ✅ TEST 4: Modals HTML présents
        console.log('\n%c✓ Test 4: Modals HTML', 'color: #2ECC71; font-weight: bold;');
        const modalsToCheck = [
            { id: 'objectives-modal', name: 'Objectives Modal' },
            { id: 'portfolio-modal', name: 'Portfolio Modal' },
            { id: 'etape-modal', name: 'Étape Modal' }
        ];
        
        modalsToCheck.forEach(modal => {
            const el = document.getElementById(modal.id);
            if (el) {
                console.log(`  ✅ ${modal.name}`);
                results.passed.push(`${modal.name} found`);
            } else {
                console.log(`  ❌ ${modal.name} - MANQUANT!`);
                results.failed.push(`${modal.name} missing`);
            }
        });
        
        // ✅ TEST 5: SVG Generation function
        console.log('\n%c✓ Test 5: Génération SVG', 'color: #2ECC71; font-weight: bold;');
        if (typeof window.generatePathSVG === 'function') {
            console.log(`  ✅ generatePathSVG() fonction présente`);
            const testSVG = generatePathSVG(CHAPITRES[0].etapes, CHAPITRES[0]);
            if (testSVG && testSVG.includes('<svg')) {
                console.log(`  ✅ SVG généré correctement (contient ${testSVG.match(/step-group/g)?.length || 0} jalons)`);
                results.passed.push('SVG generation working');
            } else {
                console.log(`  ⚠️ SVG retourné mais format suspects`);
                results.warnings.push('SVG format unexpected');
            }
        } else {
            console.log(`  ❌ generatePathSVG() manquante`);
            results.failed.push('generatePathSVG missing');
        }
        
        // ✅ TEST 6: localStorage disponible
        console.log('\n%c✓ Test 6: localStorage', 'color: #2ECC71; font-weight: bold;');
        try {
            const testKey = '__test_' + Date.now();
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            console.log(`  ✅ localStorage accessible`);
            results.passed.push('localStorage working');
        } catch (e) {
            console.log(`  ❌ localStorage error: ${e.message}`);
            results.failed.push('localStorage broken');
        }
        
        // ═══════════════════════════════════════════════════════════
        // RÉSULTATS FINAUX
        // ═══════════════════════════════════════════════════════════
        console.log('\n%c' + '═'.repeat(60), 'color: #4A3F87; font-weight: bold;');
        console.log('%c📊 RÉSULTATS VALIDATION', 'font-size: 16px; font-weight: bold; color: #4A3F87;');
        console.log('═'.repeat(60));
        console.log(`%c✅ Validations réussies: ${results.passed.length}`, 'color: #2ECC71; font-weight: bold;');
        console.log(`%c⚠️  Avertissements: ${results.warnings.length}`, 'color: #F39C12; font-weight: bold;');
        console.log(`%c❌ Erreurs critiques: ${results.failed.length}`, 'color: #E74C3C; font-weight: bold;');
        
        if (results.failed.length === 0 && results.warnings.length === 0) {
            console.log('\n%c🎉 SYSTÈME VALIDÉ - ONGLET 2 PRÊT POUR LUNDI 10h', 'font-size: 16px; font-weight: bold; color: #27AE60; background: #D5F4E6; padding: 10px;');
        } else {
            if (results.failed.length > 0) {
                console.log('\n%c❌ ERREURS À CORRIGER:', 'color: #E74C3C; font-weight: bold;');
                results.failed.forEach(e => console.log(`   • ${e}`));
            }
            if (results.warnings.length > 0) {
                console.log('\n%c⚠️  AVERTISSEMENTS:', 'color: #F39C12; font-weight: bold;');
                results.warnings.forEach(w => console.log(`   • ${w}`));
            }
        }
        
        console.log('\n%c' + '═'.repeat(60), 'color: #4A3F87;');
        console.log('%cCommandes de test disponibles:', 'font-weight: bold;');
        console.log('  VALIDATE_SYSTEM()          - Exécuter cette validation');
        console.log('  App.afficherChapitre("ch1") - Afficher chapitre 1');
        console.log('  App.afficherModalObjectives("ch1") - Voir modal objectifs');
        console.log('═'.repeat(60));
        
        return {
            total: results.passed.length + results.failed.length + results.warnings.length,
            passed: results.passed.length,
            failed: results.failed.length,
            warnings: results.warnings.length
        };
    };
    
    // Auto-run validation on page load
    window.addEventListener('load', () => {
        console.log('%c✨ Page chargée - Appelez VALIDATE_SYSTEM() en console pour valider', 'color: #4A3F87; font-style: italic;');
    });
    
    App.init();
});
