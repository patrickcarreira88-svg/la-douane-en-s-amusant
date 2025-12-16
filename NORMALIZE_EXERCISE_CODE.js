/**
 * ════════════════════════════════════════════════════════════════════
 * EXERCICE FORMAT NORMALIZATION - CODE COMPLET
 * ════════════════════════════════════════════════════════════════════
 * 
 * Cette fonction convertit automatiquement les exercices du format
 * ancien (chapitres.json) au format unifié (101-BT.json)
 * 
 * INTÉGRATION: Copiez TOUTE cette fonction dans app.js après les
 * fonctions de drag-drop et AVANT "let CHAPITRES = [];"
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

// ════════════════════════════════════════════════════════════════════
// UTILISATION DANS renderExercice()
// ════════════════════════════════════════════════════════════════════
//
// renderExercice(exercice, etapeType = null, etape = null) {
//     if (!exercice) return '<p>Aucun exercice</p>';
//     
//     // ✅ NORMALISER L'EXERCICE (convertir ancien format → format unifié)
//     exercice = normalizeExercise(exercice);
//     
//     switch(exercice.type) {
//         case 'qcm':
//             return this.renderExerciceQCM(exercice);
//         // ... autres types ...
//     }
// }
