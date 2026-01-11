// TEST_AUTHORING_TOOL_V2_ADAPTATIONS.js
// Démonstration des modifications QCM apportées

/**
 * ✅ TEST 1: Transformation Options QCM
 * 
 * AVANT: options = ["A", "B", "C"]
 * APRÈS: options = [{label: "A", correct: false}, {label: "B", correct: true}, ...]
 */

// Simuler le formulaire ancien
const oldQCMData = {
    question: "Quel est 2+2?",
    options: ["3", "4", "5"],
    correctAnswer: 1,  // Index simple
    explanation: "2+2=4"
};

console.log("❌ ANCIEN FORMAT (Strings):");
console.log(JSON.stringify(oldQCMData, null, 2));

// Convertir au nouveau format
function convertToNewFormat(oldData) {
    const newOptions = oldData.options.map((label, index) => ({
        label,
        correct: index === oldData.correctAnswer
    }));
    
    return {
        question: oldData.question,
        options: newOptions,
        correctAnswer: oldData.correctAnswer,
        explanation: oldData.explanation
    };
}

const newQCMData = convertToNewFormat(oldQCMData);
console.log("\n✅ NOUVEAU FORMAT (Objets avec 'correct'):");
console.log(JSON.stringify(newQCMData, null, 2));

/**
 * ✅ TEST 2: Validation stricte QCM
 */

function validateQCM(exercice) {
    const { type, content } = exercice;
    
    if (type !== 'qcm') return true;
    
    // 1. Question requise
    if (!content.question || content.question.trim() === '') {
        console.error("❌ Erreur: Question vide");
        return false;
    }
    
    // 2. Au moins 2 options
    if (!content.options || content.options.length < 2) {
        console.error("❌ Erreur: Moins de 2 options");
        return false;
    }
    
    // 3. Toutes les options ont du texte
    if (content.options.some(o => !o.label || o.label.trim() === '')) {
        console.error("❌ Erreur: Option vide");
        return false;
    }
    
    // 4. Exactement 1 option correcte
    const correctCount = content.options.filter(o => o.correct).length;
    if (correctCount !== 1) {
        console.error(`❌ Erreur: ${correctCount} option(s) correcte(s), attendu 1`);
        return false;
    }
    
    // 5. correctAnswer match l'index de l'option correcte
    const correctIndex = content.options.findIndex(o => o.correct);
    if (content.correctAnswer !== correctIndex) {
        console.error(`❌ Erreur: correctAnswer=${content.correctAnswer}, devrait être ${correctIndex}`);
        return false;
    }
    
    console.log("✅ Validation réussie!");
    return true;
}

// Test valide
const validQCM = {
    type: "qcm",
    titre: "Test QCM",
    content: {
        question: "Quel est 2+2?",
        options: [
            { label: "3", correct: false },
            { label: "4", correct: true },
            { label: "5", correct: false }
        ],
        correctAnswer: 1,
        explanation: "2+2=4"
    }
};

console.log("\n🔍 TEST 2A: QCM valide");
validateQCM(validQCM);

// Test invalide: aucune option correcte
const invalidQCM1 = {
    type: "qcm",
    content: {
        question: "Quel est 2+2?",
        options: [
            { label: "3", correct: false },
            { label: "4", correct: false }
        ],
        correctAnswer: -1
    }
};

console.log("\n🔍 TEST 2B: QCM sans bonne réponse");
validateQCM(invalidQCM1);

// Test invalide: 2 options correctes
const invalidQCM2 = {
    type: "qcm",
    content: {
        question: "Quel est 2+2?",
        options: [
            { label: "4", correct: true },
            { label: "4", correct: true }
        ],
        correctAnswer: 0
    }
};

console.log("\n🔍 TEST 2C: QCM avec 2 bonnes réponses");
validateQCM(invalidQCM2);

/**
 * ✅ TEST 3: Simulation du formulaire avec radios
 */

class QCMFormSimulator {
    constructor() {
        this.options = [];
        this.correctIndex = 0;
        this.question = '';
        this.explanation = '';
    }
    
    addOption(label) {
        this.options.push({
            label,
            correct: false
        });
        console.log(`✅ Option ajoutée: "${label}" (index ${this.options.length - 1})`);
    }
    
    setCorrectOption(index) {
        if (index < 0 || index >= this.options.length) {
            console.error(`❌ Index ${index} invalide`);
            return;
        }
        
        // Réinitialiser correct sur toutes
        this.options.forEach(o => o.correct = false);
        
        // Marquer la bonne
        this.options[index].correct = true;
        this.correctIndex = index;
        console.log(`✅ Bonne réponse: Option ${index} "${this.options[index].label}"`);
    }
    
    removeOption(index) {
        if (index < 0 || index >= this.options.length) {
            console.error(`❌ Index ${index} invalide`);
            return;
        }
        
        const removed = this.options[index];
        this.options.splice(index, 1);
        
        // Réindexer si nécessaire
        if (this.correctIndex > index) {
            this.correctIndex--;
        } else if (this.correctIndex === index) {
            this.correctIndex = 0;
        }
        
        console.log(`✅ Option supprimée: "${removed.label}"`);
        console.log(`   Options restantes: ${this.options.length}`);
    }
    
    toJSON() {
        return {
            question: this.question,
            options: this.options,
            correctAnswer: this.correctIndex,
            explanation: this.explanation
        };
    }
}

console.log("\n🎯 TEST 3: Simulation du formulaire QCM");
const form = new QCMFormSimulator();
form.question = "Quelle est la capitale de la France?";
form.addOption("Londres");
form.addOption("Paris");
form.addOption("Berlin");
form.setCorrectOption(1);
form.explanation = "Paris est la capitale de la France";

console.log("\n📋 État du formulaire:");
console.log(JSON.stringify(form.toJSON(), null, 2));

console.log("\n❌ Suppression de l'option 0 (Londres)");
form.removeOption(0);
console.log(JSON.stringify(form.toJSON(), null, 2));

/**
 * ✅ TEST 4: Comparaison avant/après
 */

console.log("\n" + "=".repeat(60));
console.log("📊 RÉSUMÉ: AVANT vs APRÈS");
console.log("=".repeat(60));

const comparison = {
    aspect: [
        "Format options",
        "Validation",
        "Sélection correcte",
        "Ajout/suppression",
        "Structure BD"
    ],
    avant: [
        "Strings []",
        "❌ Aucune",
        "Dropdown",
        "❌ Manuel (textarea)",
        "Array simple"
    ],
    apres: [
        "{label, correct}[]",
        "✅ Stricte (5 points)",
        "Radio buttons",
        "✅ Dynamique (JS)",
        "Array d'objets"
    ]
};

console.table(comparison);

console.log("\n✅ TOUS LES TESTS TERMINÉS!");
