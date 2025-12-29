// ============================================
// GENERATOR V2 - Outil auteur intelligent
// ============================================

// 🌐 URL du serveur (à adapter selon l'environnement)
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://la-douane-en-s-amusant--patrickcarreira.replit.app';

console.log('🔌 API connectée à:', API_URL);

let existingExercises = [];
let selectedChapter = 'ch1';

// ========================================
// 1. INITIALISATION AU DÉMARRAGE
// ========================================

async function initGenerator() {
  console.log('📚 Initialisation du générateur...');
  
  try {
    // Charger les QCM existants
    const response = await fetch(`${API_URL}/api/exercises/qcm`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    existingExercises = data.exercises || [];
    
    console.log(`✅ ${data.count || 0} QCM chargés`);
    
    // Afficher les chapitres
    displayChapters();
    
    // Générer le prochain ID
    updateAutoID();
    
    // Afficher les exercices existants
    displayExistingExercises();
    
  } catch (error) {
    console.warn('⚠️ Serveur non accessible');
    console.warn('Mode offline: Les données seront copiées manuellement');
    showAlert('info', '⚠️ Mode offline - Serveur indisponible');
  }
}

// ========================================
// 2. AFFICHER LES CHAPITRES
// ========================================

function displayChapters() {
  const chapters = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'];
  const select = document.getElementById('chapterId');
  
  // Vider les options existantes
  select.innerHTML = '<option value="">-- Sélectionne un chapitre --</option>';
  
  chapters.forEach(ch => {
    const count = existingExercises.filter(ex => ex.id.startsWith(ch)).length;
    const option = document.createElement('option');
    option.value = ch;
    option.textContent = `${ch.toUpperCase()} (${count} exercices)`;
    select.appendChild(option);
  });
  
  // Event listener au changement
  select.addEventListener('change', (e) => {
    selectedChapter = e.target.value;
    updateAutoID();
  });
  
  // Sélectionner ch1 par défaut
  select.value = 'ch1';
}

// ========================================
// 3. AUTO-GÉNÉRER L'ID (CÔTÉ JAVASCRIPT)
// ========================================

async function updateAutoID() {
  if (!selectedChapter) {
    document.getElementById('autoID').textContent = 'Sélectionne un chapitre';
    return;
  }
  
  try {
    // Extraire le numéro du chapitre (ex: 'ch1' → '1')
    const chapterNum = selectedChapter.match(/\d+/)[0];
    
    // Chercher le plus grand numéro d'exercice pour ce chapitre
    let maxExNum = 0;
    if (existingExercises && Array.isArray(existingExercises)) {
      existingExercises.forEach(ex => {
        // Regex pour matcher ch{chap}ex{num}
        const regex = new RegExp(`^ch${chapterNum}ex(\\d+)$`);
        const match = ex.id?.match(regex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxExNum) maxExNum = num;
        }
      });
    }
    
    // Générer le prochain ID
    const nextNum = maxExNum + 1;
    const nextId = `ch${chapterNum}ex${String(nextNum).padStart(3, '0')}`;
    
    // Afficher l'ID
    const idDisplay = document.getElementById('autoID');
    idDisplay.textContent = nextId;
    idDisplay.title = `Exercice numéro ${nextNum}`;
    
    // Pré-remplir le champ caché
    document.getElementById('exerciseId').value = nextId;
    
    console.log(`✅ ID auto-généré: ${nextId}`);
    
  } catch (error) {
    console.error('⚠️ Erreur lors de la génération d\'ID:', error);
    // Fallback: utiliser le format basique
    document.getElementById('autoID').textContent = `${selectedChapter}ex001`;
  }
}

// ========================================
// 4. AFFICHER LES EXERCICES EXISTANTS
// ========================================

function displayExistingExercises() {
  const container = document.getElementById('existingExercises');
  if (!container) return;
  
  const chapterExercises = existingExercises.filter(ex => 
    ex.id.startsWith(selectedChapter)
  );
  
  if (chapterExercises.length === 0) {
    container.innerHTML = '<p>Aucun exercice encore</p>';
    return;
  }
  
  let html = '<h3>Exercices existants:</h3><ul>';
  chapterExercises.forEach(ex => {
    html += `<li><strong>${ex.id}</strong> - ${ex.title}</li>`;
  });
  html += '</ul>';
  
  container.innerHTML = html;
}

// ========================================
// 5. SAUVEGARDER L'EXERCICE
// ========================================

async function saveExerciseToServer() {
  // Récupérer les données
  const exerciseId = document.getElementById('exerciseId').value;
  const chapterId = document.getElementById('chapterId').value;
  const stepId = document.getElementById('stepId').value;
  const title = document.getElementById('title').value;
  const question = document.getElementById('question').value;
  const points = parseInt(document.getElementById('points').value);
  
  const optionsText = document.getElementById('options').value;
  const options = optionsText
    .split('\n')
    .map(o => o.trim())
    .filter(o => o);
  
  const correctAnswer = parseInt(document.getElementById('correctAnswer').value);
  const explanation = document.getElementById('explanation').value;
  
  // ✅ VALIDATION
  if (!exerciseId) {
    showAlert('error', '❌ ID manquant');
    return;
  }
  if (!title) {
    showAlert('error', '❌ Titre manquant');
    return;
  }
  if (!question) {
    showAlert('error', '❌ Question manquante');
    return;
  }
  if (options.length < 2) {
    showAlert('error', '❌ Min 2 options requises');
    return;
  }
  if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
    showAlert('error', '❌ Bonne réponse invalide');
    return;
  }
  
  // Créer l'objet
  const exercise = {
    id: exerciseId,
    chapterId: chapterId,
    stepId: stepId || `${chapterId}step1`,
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
  
  // Envoyer
  try {
    showAlert('info', '⏳ Sauvegarde en cours...');
    
    const response = await fetch(`${API_URL}/api/save-exercise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exercise) 
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('success', `✅ ${result.message}`);
      console.log(`✅ Sauvegardé: ${exercise.id}`);
      
      // Réinitialiser
      resetForm();
      
      // Recharger
      await initGenerator();
      
    } else {
      showAlert('error', `❌ ${result.error}`);
    }
  } catch (error) {
    showAlert('error', `❌ Erreur: ${error.message}`);
    console.error(error);
  }
}

// ========================================
// 6. AFFICHER MESSAGES
// ========================================

function showAlert(type, message) {
  const alertDiv = document.getElementById('alert') || createAlert();
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.display = 'block';
  
  if (type === 'success' || type === 'info') {
    setTimeout(() => alertDiv.style.display = 'none', 5000);
  }
}

function createAlert() {
  const div = document.createElement('div');
  div.id = 'alert';
  div.style.cssText = `
    padding: 15px;
    margin: 20px 0;
    border-radius: 8px;
    font-weight: bold;
    border: 2px solid;
  `;
  document.body.insertBefore(div, document.body.firstChild);
  return div;
}

// ========================================
// 7. RÉINITIALISER FORMULAIRE
// ========================================

function resetForm() {
  document.getElementById('title').value = '';
  document.getElementById('question').value = '';
  document.getElementById('options').value = '';
  document.getElementById('correctAnswer').value = '0';
  document.getElementById('explanation').value = '';
  document.getElementById('points').value = '10';
}

// ========================================
// 8. DÉMARRER AU CHARGEMENT
// ========================================

document.addEventListener('DOMContentLoaded', initGenerator);
