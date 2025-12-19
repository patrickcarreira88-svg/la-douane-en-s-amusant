/**
 * generator.js
 * Génère du JSON valide depuis les formulaires auteur
 */

// ============================================
// FONCTION PRINCIPALE: Générer JSON QCM
// ============================================

function generateJSON() {
  console.log('📋 Génération JSON QCM...');
  
  // 1. Récupérer les valeurs
  const exerciseId = document.getElementById('exerciseId')?.value.trim();
  const chapterId = document.getElementById('chapterId')?.value.trim();
  const stepId = document.getElementById('stepId')?.value.trim();
  const title = document.getElementById('title')?.value.trim();
  const question = document.getElementById('question')?.value.trim();
  const optionsText = document.getElementById('options')?.value.trim();
  const correctAnswer = parseInt(document.getElementById('correctAnswer')?.value);
  const explanation = document.getElementById('explanation')?.value.trim();
  const points = parseInt(document.getElementById('points')?.value) || 10;

  // 2. Validation
  const errors = validateQCM({
    exerciseId,
    chapterId,
    stepId,
    title,
    question,
    optionsText,
    correctAnswer,
    explanation,
    points
  });

  if (errors.length > 0) {
    showAlert('error', '❌ Erreurs de validation:<br>' + errors.join('<br>'));
    return;
  }

  // 3. Convertir options
  const options = optionsText
    .split('\n')
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0);

  // 4. Construire l'objet exercice
  const exercice = {
    id: exerciseId,
    chapterId: chapterId,
    stepId: stepId,
    title: title,
    type: 'qcm',
    points: points,
    content: {
      question: question,
      options: options,
      correctAnswer: correctAnswer,
      explanation: explanation
    }
  };

  // 5. Afficher le JSON
  displayJSON(exercice);
  showAlert('success', '✅ JSON généré avec succès!');
}

// ============================================
// VALIDATION QCM
// ============================================

function validateQCM(data) {
  const errors = [];

  if (!data.exerciseId) errors.push('❌ ID exercice manquant');
  if (!/^ch\d+ex\d+$/.test(data.exerciseId)) 
    errors.push('❌ Format ID invalide (format attendu: ch1ex002)');

  if (!data.chapterId) errors.push('❌ Chapitre manquant');
  if (!/^ch\d+$/.test(data.chapterId)) 
    errors.push('❌ Format chapitre invalide (format attendu: ch1)');

  if (!data.stepId) errors.push('❌ Étape manquante');
  if (!/^ch\d+step\d+$/.test(data.stepId)) 
    errors.push('❌ Format étape invalide (format attendu: ch1step2)');

  if (!data.title) errors.push('❌ Titre manquant');
  if (data.title.length < 5) errors.push('❌ Titre trop court (min 5 caractères)');

  if (!data.question) errors.push('❌ Question manquante');
  if (data.question.length < 10) errors.push('❌ Question trop courte (min 10 caractères)');

  const options = data.optionsText
    .split('\n')
    .map(o => o.trim())
    .filter(o => o.length > 0);

  if (options.length < 2) errors.push('❌ Minimum 2 options requises');
  if (options.length > 6) errors.push('❌ Maximum 6 options');

  if (isNaN(data.correctAnswer)) errors.push('❌ Bonne réponse invalide');
  if (data.correctAnswer < 0 || data.correctAnswer >= options.length) 
    errors.push(`❌ Bonne réponse hors limites (0-${options.length - 1})`);

  if (!data.explanation) errors.push('❌ Explication manquante');
  if (data.explanation.length < 10) errors.push('❌ Explication trop courte (min 10 caractères)');

  if (data.points < 1 || data.points > 100) errors.push('❌ Points doivent être entre 1 et 100');

  return errors;
}

// ============================================
// AFFICHAGE JSON
// ============================================

function displayJSON(exercice) {
  const json = JSON.stringify(exercice, null, 2);
  
  const outputDiv = document.getElementById('jsonOutput');
  const jsonText = document.getElementById('jsonText');
  
  if (jsonText) {
    jsonText.value = json;
  }
  
  if (outputDiv) {
    outputDiv.style.display = 'block';
  }
  
  console.log('📋 JSON généré:', exercice);
}

// ============================================
// COPIER AU PRESSE-PAPIERS
// ============================================

function copyToClipboard() {
  const jsonText = document.getElementById('jsonText');
  
  if (!jsonText) {
    alert('❌ Aucun JSON à copier');
    return;
  }

  jsonText.select();
  jsonText.setSelectionRange(0, 99999);

  try {
    document.execCommand('copy');
    showAlert('success', '✅ JSON copié au presse-papiers!');
  } catch (err) {
    showAlert('error', '❌ Erreur lors de la copie');
    console.error('Erreur copie:', err);
  }
}

// ============================================
// RÉINITIALISER FORMULAIRE
// ============================================

function resetForm() {
  const form = document.getElementById('qcmForm');
  if (form) {
    form.reset();
    document.getElementById('jsonOutput').style.display = 'none';
    document.getElementById('alertBox').innerHTML = '';
  }
}

// ============================================
// AFFICHAGE ALERTES
// ============================================

function showAlert(type, message) {
  const alertBox = document.getElementById('alertBox');
  
  if (!alertBox) return;

  alertBox.className = `alert show alert-${type}`;
  alertBox.innerHTML = message;

  // Auto-hide après 5s
  setTimeout(() => {
    alertBox.classList.remove('show');
  }, 5000);
}

// ============================================
// FONCTION PRINCIPALE: Générer JSON Drag & Drop
// ============================================

function generateDragDropJSON() {
  console.log('🎯 Génération JSON Drag & Drop...');
  
  // 1. Récupérer les valeurs
  const exerciseId = document.getElementById('exerciseId')?.value.trim();
  const chapterId = document.getElementById('chapterId')?.value.trim();
  const stepId = document.getElementById('stepId')?.value.trim();
  const title = document.getElementById('title')?.value.trim();
  const instruction = document.getElementById('instruction')?.value.trim();
  const itemsText = document.getElementById('items')?.value.trim();
  const points = parseInt(document.getElementById('points')?.value) || 15;

  // 2. Validation
  const errors = validateDragDrop({
    exerciseId,
    chapterId,
    stepId,
    title,
    instruction,
    itemsText,
    points
  });

  if (errors.length > 0) {
    showAlert('error', '❌ Erreurs de validation:<br>' + errors.join('<br>'));
    return;
  }

  // 3. Parser les items
  const items = itemsText
    .split('\n')
    .map(line => {
      const parts = line.trim().split('|');
      return {
        id: `item${parts[1] || 0}`,
        label: parts[0].trim(),
        correctPosition: parseInt(parts[1] || 0)
      };
    })
    .filter(item => item.label.length > 0);

  // 4. Construire l'objet exercice
  const exercice = {
    id: exerciseId,
    chapterId: chapterId,
    stepId: stepId,
    title: title,
    type: 'dragdrop',
    points: points,
    content: {
      instruction: instruction,
      items: items
    }
  };

  // 5. Afficher le JSON
  displayJSON(exercice);
  showAlert('success', '✅ JSON Drag & Drop généré avec succès!');
}

// ============================================
// VALIDATION DRAG & DROP
// ============================================

function validateDragDrop(data) {
  const errors = [];

  if (!data.exerciseId) errors.push('❌ ID exercice manquant');
  if (!/^ch\d+ex\d+$/.test(data.exerciseId)) 
    errors.push('❌ Format ID invalide (ch1ex002)');

  if (!data.chapterId) errors.push('❌ Chapitre manquant');
  if (!/^ch\d+$/.test(data.chapterId)) 
    errors.push('❌ Format chapitre invalide (ch1)');

  if (!data.stepId) errors.push('❌ Étape manquante');
  if (!/^ch\d+step\d+$/.test(data.stepId)) 
    errors.push('❌ Format étape invalide (ch1step2)');

  if (!data.title) errors.push('❌ Titre manquant');
  if (data.title.length < 5) errors.push('❌ Titre trop court');

  if (!data.instruction) errors.push('❌ Instruction manquante');

  const items = data.itemsText
    .split('\n')
    .map(line => line.trim().split('|')[0])
    .filter(item => item.length > 0);

  if (items.length < 2) errors.push('❌ Minimum 2 éléments requis');
  if (items.length > 10) errors.push('❌ Maximum 10 éléments');

  if (data.points < 1 || data.points > 100) errors.push('❌ Points 1-100');

  return errors;
}

// ============================================
// RÉINITIALISER FORMULAIRE DRAG
// ============================================

function resetDragForm() {
  const form = document.getElementById('dragForm');
  if (form) {
    form.reset();
    document.getElementById('jsonOutput').style.display = 'none';
    document.getElementById('alertBox').innerHTML = '';
  }
}

// ============================================
// FONCTION PRINCIPALE: Générer JSON Scénario
// ============================================

function generateScenarioJSON() {
  console.log('🎬 Génération JSON Scénario...');
  
  const exerciseId = document.getElementById('exerciseId')?.value.trim();
  const chapterId = document.getElementById('chapterId')?.value.trim();
  const stepId = document.getElementById('stepId')?.value.trim();
  const title = document.getElementById('title')?.value.trim();
  const scenarioTitle = document.getElementById('scenarioTitle')?.value.trim();
  const scenarioDescription = document.getElementById('scenarioDescription')?.value.trim();
  const scenarioIcon = document.getElementById('scenarioIcon')?.value.trim() || '🎯';
  const points = parseInt(document.getElementById('points')?.value) || 75;

  // Collecter les questions
  const questionsElements = document.querySelectorAll('.question-block');
  const questions = Array.from(questionsElements).map((block, index) => {
    const questionText = block.querySelector('.question-text')?.value.trim();
    const optionsText = block.querySelector('.question-options')?.value.trim();
    const correctAnswer = parseInt(block.querySelector('.question-answer')?.value);
    const qPoints = parseInt(block.querySelector('.question-points')?.value) || 25;
    const explanation = block.querySelector('.question-explanation')?.value.trim();

    return {
      id: `q${index + 1}`,
      number: index + 1,
      question: questionText,
      options: optionsText.split('\n').map(o => o.trim()).filter(o => o),
      correctAnswer: correctAnswer,
      explanation: explanation,
      points: qPoints
    };
  });

  // Validation
  const errors = validateScenario({
    exerciseId,
    chapterId,
    stepId,
    title,
    scenarioTitle,
    scenarioDescription,
    questions
  });

  if (errors.length > 0) {
    showAlert('error', '❌ Erreurs de validation:<br>' + errors.join('<br>'));
    return;
  }

  // Construire l'exercice
  const exercice = {
    id: exerciseId,
    chapterId: chapterId,
    stepId: stepId,
    title: title,
    type: 'scenario',
    points: points,
    content: {
      scenario: {
        title: scenarioTitle,
        description: scenarioDescription,
        icon: scenarioIcon
      },
      questions: questions
    }
  };

  displayJSON(exercice);
  showAlert('success', '✅ JSON Scénario généré!');
}

// ============================================
// VALIDATION SCÉNARIO
// ============================================

function validateScenario(data) {
  const errors = [];

  if (!data.exerciseId) errors.push('❌ ID manquant');
  if (!data.chapterId) errors.push('❌ Chapitre manquant');
  if (!data.stepId) errors.push('❌ Étape manquante');
  if (!data.title) errors.push('❌ Titre manquant');
  if (!data.scenarioTitle) errors.push('❌ Titre scénario manquant');
  if (!data.scenarioDescription) errors.push('❌ Description manquante');

  if (!data.questions || data.questions.length === 0) 
    errors.push('❌ Minimum 1 question requise');

  data.questions.forEach((q, idx) => {
    if (!q.question) errors.push(`❌ Question ${idx + 1}: texte manquant`);
    if (!q.options || q.options.length < 2) 
      errors.push(`❌ Question ${idx + 1}: minimum 2 options`);
    if (isNaN(q.correctAnswer) || q.correctAnswer >= q.options.length)
      errors.push(`❌ Question ${idx + 1}: bonne réponse invalide`);
    if (!q.explanation) errors.push(`❌ Question ${idx + 1}: explication manquante`);
  });

  return errors;
}

// ============================================
// GÉRER LES QUESTIONS
// ============================================

function addQuestion() {
  const container = document.getElementById('questionsContainer');
  const count = container.querySelectorAll('.question-block').length + 1;
  
  const newQuestion = document.createElement('div');
  newQuestion.className = 'question-block';
  newQuestion.style.cssText = 'border-left: 3px solid #3182ce; padding: 15px; margin-bottom: 15px; background: #f0f9ff;';
  
  newQuestion.innerHTML = `
    <h4 style="margin-top: 0;">Question ${count}</h4>
    
    <div class="form-group">
      <label>Texte de la question *</label>
      <input type="text" class="question-text" placeholder="Posez votre question..." required>
    </div>

    <div class="form-group">
      <label>Options (une par ligne) *</label>
      <textarea class="question-options" placeholder="Option 1&#10;Option 2&#10;Option 3" required></textarea>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div class="form-group">
        <label>Bonne réponse (numéro) *</label>
        <input type="number" class="question-answer" min="0" max="5" required>
      </div>
      <div class="form-group">
        <label>Points *</label>
        <input type="number" class="question-points" value="25" min="1" max="100" required>
      </div>
    </div>

    <div class="form-group">
      <label>Explication *</label>
      <textarea class="question-explanation" placeholder="Expliquez la réponse..." required></textarea>
    </div>

    <button type="button" class="btn-secondary" onclick="this.parentElement.remove();">🗑️ Supprimer</button>
  `;
  
  container.appendChild(newQuestion);
}

// ============================================
// RÉINITIALISER FORMULAIRE SCÉNARIO
// ============================================

function resetScenarioForm() {
  const form = document.getElementById('scenarioForm');
  if (form) {
    form.reset();
    document.getElementById('jsonOutput').style.display = 'none';
    document.getElementById('alertBox').innerHTML = '';
    // Reset questions
    const container = document.getElementById('questionsContainer');
    const questions = container.querySelectorAll('.question-block');
    for (let i = 1; i < questions.length; i++) {
      questions[i].remove();
    }
  }
}

// ============================================
// LOG AU DÉMARRAGE
// ============================================

console.log('✅ generator.js chargé et prêt');
