# 📚 RÉFÉRENCE COMPLÈTE DES EXERCICES - App.js

## 🎯 ARCHITECTURE GLOBALE

Le système d'exercices suit cette architecture:

```
CHAPITRE (ch1, ch2, etc.)
  └─ ÉTAPE (step1, step2, etc.)
      └─ EXERCICE (ex_001, ex_002, etc.)
          └─ TYPE: video | qcm | flashcards | lecture | quiz
          └─ STRUCTURE: { id, type, titre, description, content, points }
```

---

## A) CODE D'AFFICHAGE (RENDERING)

### 1. RENDER CONSULTATION EXERCISES (Type A - Pas de validation)
**Fichier**: `js/app.js` ligne **3188**

```javascript
/**
 * Rend les exercices de consultation (vidéos, lectures) dans la modal
 * Gère: VIDEO, LECTURE, FLASHCARDS
 */
renderConsultExercises(chapitreId, stepIndex, step) {
    if (!step.exercices || step.exercices.length === 0) {
        return;
    }
    
    const container = document.getElementById('consult-exercises');
    if (!container) {
        console.error('❌ Container consult-exercises NOT FOUND!');
        return;
    }
    
    let exercicesHTML = '';
    
    step.exercices.forEach((exo, idx) => {
        const type = exo.type;
        const titre = exo.titre || 'Exercice';
        const description = exo.description || '';
        
        // ============ VIDEO ============
        if (type === 'video') {
            let videoType = exo.content?.videoType;
            let videoUrl = exo.content?.url || exo.url;
            const videoDescription = exo.content?.description || '';
            const videoId = exo.videoId || step.videoId;
            
            // Fallback: chercher dans le manifest si données manquent
            if (!videoType && !videoUrl && videoId && window.videoManifest) {
                const video = window.videoManifest.videos?.find(v => v.id === videoId);
                if (video) {
                    videoType = video.sources?.['720p'] ? 'local' : 'youtube';
                    videoUrl = video.sources?.['720p'] || video.sources?.['480p'];
                    if (videoUrl && videoUrl.startsWith('../')) {
                        videoUrl = `/assets/videos/${videoUrl.slice(3)}`;
                    }
                }
            }
            
            // AUTO-DETECT videoType si pas défini
            if (!videoType && videoUrl) {
                if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                    videoType = 'youtube';
                } else if (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm')) {
                    videoType = 'local';
                }
            }
            
            // RENDER YouTube
            if (videoType === 'youtube') {
                const iframeUrl = videoUrl.replace('watch?v=', 'embed/');
                exercicesHTML += `
                    <div style="margin-bottom: 30px; padding: 20px; background: #f0f0f0; border-radius: 8px;">
                        <h3 style="margin: 0 0 10px 0; color: #4A3F87;">🎬 ${titre}</h3>
                        ${description ? `<p style="margin: 0 0 15px 0; font-size: 0.9em; color: #666;">${description}</p>` : ''}
                        <iframe width="100%" height="300" src="${iframeUrl}" frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen style="border-radius: 8px;">
                        </iframe>
                    </div>
                `;
            }
            // RENDER Vidéo locale
            else if (videoType === 'local') {
                exercicesHTML += `
                    <div style="margin-bottom: 30px; padding: 20px; background: #f0f0f0; border-radius: 8px;">
                        <h3 style="margin: 0 0 10px 0; color: #4A3F87;">🎬 ${titre}</h3>
                        ${description ? `<p style="margin: 0 0 15px 0; font-size: 0.9em; color: #666;">${description}</p>` : ''}
                        <video width="100%" height="300" controls style="border-radius: 8px; background: #000;">
                            <source src="${videoUrl}" type="video/mp4">
                        </video>
                    </div>
                `;
            }
        }
        // ============ LECTURE ============
        else if (type === 'lecture') {
            const lectureText = exo.content?.text || '';
            exercicesHTML += `
                <div style="margin-bottom: 30px; padding: 20px; background: #fffacd; 
                    border-left: 4px solid #ff9800; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #ff9800;">📚 ${titre}</h3>
                    ${description ? `<p style="margin: 0 0 15px 0; font-size: 0.9em; color: #666;">${description}</p>` : ''}
                    <p style="margin: 0; line-height: 1.8; white-space: pre-wrap;">${lectureText}</p>
                </div>
            `;
        }
        // ============ FLASHCARDS ============
        else if (type === 'flashcards') {
            const cards = exo.content?.cards || [];
            exercicesHTML += `
                <div style="margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #4A3F87;">🗂️ ${titre}</h3>
                    <div style="display: grid; gap: 15px;">
                        ${cards.map((card) => `
                            <div style="padding: 15px; background: white; border: 2px solid #4A3F87; 
                                border-radius: 8px; cursor: pointer;">
                                <div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">
                                    ❓ ${card.recto}
                                </div>
                                <div style="background: #f0f0f0; padding: 10px; border-radius: 4px; 
                                    color: #333; font-weight: 500;">
                                    ✅ ${card.verso}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = exercicesHTML;
}
```

---

### 2. RENDER EXERCISE MODAL (Type B - Avec validation)
**Fichier**: `js/app.js` ligne **3324**

```javascript
/**
 * Rend la modal d'exercice (QCM, Quiz, Flashcards avec validation)
 * Structure: Modal header + contenu exercice + footer avec boutons
 */
renderExerciseModal(chapitreId, stepIndex, step) {
    if (!step.exercices || step.exercices.length === 0) {
        console.error('❌ Pas d\'exercice');
        return;
    }
    
    const exercice = step.exercices[0];
    const typeExo = exercice.type;
    const titreTape = step.titre || 'Exercice';
    
    // Déterminer le contenu selon type
    let contenuExerciceHTML = '';
    
    // ============ QCM ============
    if (typeExo === 'qcm') {
        const question = exercice.content?.question || '';
        const options = exercice.content?.options || [];
        
        contenuExerciceHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0;">${question}</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${options.map((opt, idx) => `
                        <label style="display: flex; align-items: center; padding: 12px; 
                            border: 2px solid #ddd; border-radius: 6px; cursor: pointer;">
                            <input type="radio" name="qcm_answer" value="${idx}" 
                                style="margin-right: 12px; cursor: pointer;">
                            <span>${opt.label}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }
    // ============ QUIZ ============
    else if (typeExo === 'quiz') {
        contenuExerciceHTML = this.renderExerciceQuiz(exercice);
    }
    // ============ FLASHCARDS ============
    else if (typeExo === 'flashcards') {
        contenuExerciceHTML = this.renderExerciceFlashcards(exercice);
    }
    
    // Créer la modal complète
    const modalHTML = `
        <div class="modal-overlay exercise-modal" id="exercise-modal">
            <div class="modal-content" style="max-width: 800px; background: white; border-radius: 12px;">
                <!-- HEADER -->
                <div class="modal-header" style="background: linear-gradient(135deg, #4A3F87 0%, #6B5B95 100%); 
                    padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; color: white;">${titreTape}</h2>
                        <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.9);">
                            ⏱️ ${step.duree || '-'} | 🎯 ${step.points || 0} pts
                        </p>
                    </div>
                    <button class="btn-close" onclick="document.getElementById('exercise-modal').remove()" 
                        style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">
                        ✕
                    </button>
                </div>
                
                <!-- CONTENU EXERCICE -->
                <div class="modal-body" style="padding: 30px;">
                    <div id="exercise-content">
                        ${contenuExerciceHTML}
                    </div>
                </div>
                
                <!-- FOOTER -->
                <div class="modal-footer" style="background: #f5f5f5; padding: 20px; 
                    display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid #ddd;">
                    <button class="btn btn--secondary" onclick="document.getElementById('exercise-modal').remove()">
                        ← Fermer
                    </button>
                    <button class="btn btn--primary" id="btn-validate" 
                        onclick="App.validerExerciceRenderModal('${typeExo}', '${chapitreId}', ${stepIndex})">
                        🎯 Soumettre réponses
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}
```

---

### 3. RENDER QUIZ
**Fichier**: `js/app.js` ligne **5074**

```javascript
/**
 * Rend un quiz avec plusieurs questions
 * Chaque question = radio buttons, une seule réponse correcte
 */
renderExerciceQuiz(exercice) {
    const questions = exercice.content?.questions || exercice.questions || [];
    
    if (!questions || questions.length === 0) {
        return '<p>❌ Aucune question trouvée</p>';
    }
    
    let html = `
        <div style="background: var(--color-surface); padding: var(--spacing-md);">
            <h3>${exercice.titre}</h3>
            <p style="color: var(--color-text-light);">${exercice.description}</p>
    `;
    
    questions.forEach((question, qIndex) => {
        html += `
            <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); 
                background: white; border-radius: var(--radius-md);">
                <h4>Q${qIndex + 1}: ${question.question}</h4>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md); 
                    margin-top: var(--spacing-md);">
        `;
        
        const options = question.options || question.choix || [];
        options.forEach((option, optIndex) => {
            const optionText = typeof option === 'string' ? 
                option : 
                (option.label || option.texte || option.text || '');
            const isCorrect = optIndex === question.correctAnswer || option.correct;
            
            html += `
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="radio" name="q${question.id}" value="${optIndex}" 
                        data-correct="${isCorrect}" style="cursor: pointer;">
                    <span style="margin-left: var(--spacing-md);">${optionText}</span>
                </label>
            `;
        });
        
        html += `</div></div>`;
    });
    
    html += `
                <div id="quiz-feedback" style="margin-top: var(--spacing-lg); 
                    padding: var(--spacing-md); display: none;"></div>
            </div>
    `;
    
    return html;
}
```

---

## B) CODE DE VALIDATION (VÉRIFICATION DES RÉPONSES)

### 1. VALIDER QUIZ
**Fichier**: `js/app.js` ligne **6918**

```javascript
/**
 * Valide un quiz et affiche les résultats
 * NE COMPLÈTE PAS l'étape automatiquement
 * Affiche bouton "Marquer comme terminé"
 */
validerQuiz(exerciceId = null) {
    const feedbackId = exerciceId ? `quiz-feedback-${exerciceId}` : 'quiz-feedback';
    
    // Trouver toutes les questions avec leurs réponses
    const allInputs = document.querySelectorAll('input[data-correct]');
    let totalQuestions = 0;
    let correctAnswers = 0;
    
    // Compter les questions et réponses correctes
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
    
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Afficher les réponses correctes détaillées
    const feedback = document.getElementById(feedbackId);
    let feedbackHtml = `
        <div style="background: ${correctAnswers === totalQuestions ? '#d4edda' : '#fff3cd'}; 
            border: 1px solid ${correctAnswers === totalQuestions ? '#c3e6cb' : '#ffeaa7'}; 
            padding: var(--spacing-md); border-radius: var(--radius-md);">
            <h4 style="margin-top: 0; color: ${correctAnswers === totalQuestions ? '#155724' : '#856404'};">
                ${correctAnswers === totalQuestions ? '✅ Excellent!' : '⚠️ Résultats'}
            </h4>
            <p style="margin: var(--spacing-sm) 0;">
                Vous avez réussi <strong>${correctAnswers}/${totalQuestions}</strong> questions (${percentage}%)
            </p>
    `;
    
    // Détails des réponses pour chaque question
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
    
    feedbackHtml += `<div style="margin-top: var(--spacing-md); border-top: 1px solid rgba(0,0,0,0.1); 
        padding-top: var(--spacing-md);">`;
    
    questionGroups.forEach(({ question, inputs }) => {
        const correctInput = inputs.find(i => i.dataset.correct === 'true');
        const selectedInput = inputs.find(i => i.checked);
        
        feedbackHtml += `
            <div style="margin-bottom: var(--spacing-md); padding: var(--spacing-sm); 
                background: white; border-radius: var(--radius-sm);">
                <p style="margin: 0; font-weight: bold; color: #333;">${question}</p>
                <p style="margin: var(--spacing-xs) 0; color: #666;">
                    <strong>Bonne réponse:</strong> ${correctInput.closest('label').textContent.trim()}
                </p>
                ${selectedInput ? `<p style="margin: var(--spacing-xs) 0; 
                    color: ${selectedInput.dataset.correct === 'true' ? '#28a745' : '#dc3545'};">
                    <strong>Votre réponse:</strong> ${selectedInput.closest('label').textContent.trim()}
                </p>` : ''}
            </div>
        `;
    });
    
    feedbackHtml += `</div>`;
    
    // Ajouter bouton "Marquer comme terminé" si réussi
    if (correctAnswers >= Math.ceil(totalQuestions / 2)) {
        feedbackHtml += `
            <div style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); 
                border-top: 1px solid rgba(0,0,0,0.1); text-align: center;">
                <button class="btn btn--primary" style="width: 100%; background-color: #28a745;" 
                    onclick="App.completerQuizEtape(${correctAnswers}, ${totalQuestions})">
                    ✅ Marquer comme terminé
                </button>
            </div>
        `;
    } else {
        feedbackHtml += `
            <div style="margin-top: var(--spacing-md); padding: var(--spacing-md); 
                background: #f8d7da; border: 1px solid #f5c6cb; border-radius: var(--radius-md); 
                color: #721c24;">
                <strong>⚠️ Résultat insuffisant</strong><br/>
                Vous avez besoin d'au moins 50% pour passer.
            </div>
        `;
    }
    
    feedbackHtml += `</div>`;
    
    feedback.innerHTML = feedbackHtml;
    feedback.style.display = 'block';
    
    // Masquer le bouton "Soumettre réponses"
    const submitBtn = document.getElementById('btn-validate');
    if (submitBtn) {
        submitBtn.style.display = 'none';
    }
    
    // Désactiver tous les inputs
    allInputs.forEach(input => input.disabled = true);
    
    console.log(`📋 Quiz soumis: ${correctAnswers}/${totalQuestions} (${percentage}%)`);
}
```

---

### 2. COMPLÉTER QUIZ ÉTAPE
**Fichier**: `js/app.js` ligne **7030**

```javascript
/**
 * Complète le quiz et déverrouille l'étape suivante
 * Appelé par le bouton "Marquer comme terminé"
 */
completerQuizEtape(correctAnswers, totalQuestions) {
    if (!window.currentStepId || !window.currentChapitreId) {
        console.error('❌ Contexte étape non disponible');
        return;
    }
    
    const chapitre = CHAPITRES.find(ch => ch.id === window.currentChapitreId);
    const etapeIndex = chapitre?.etapes.findIndex(e => e.id === window.currentStepId);
    const etape = chapitre?.etapes[etapeIndex];
    
    if (!etape) {
        console.error(`❌ Étape non trouvée`);
        return;
    }
    
    // Calculer le score et points
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const maxPoints = etape.points || 20;
    const pointsEarned = Math.round((percentage / 100) * maxPoints);
    
    // Utiliser markStepAttempted pour enregistrer et déverrouiller automatiquement
    this.markStepAttempted(window.currentChapitreId, etapeIndex, percentage);
    
    // Ajouter les points
    const result = StorageManager.addPointsToStep(window.currentStepId, pointsEarned, maxPoints);
    this.updateHeader();
    
    console.log(`✅ Quiz complété: ${percentage}% → ${pointsEarned}/${maxPoints} points`);
    
    // Notification + retour au chapitre
    showSuccessNotification('🎊 Quiz terminé!', `${percentage}% (${correctAnswers}/${totalQuestions})`, '🎊', 2000);
    
    setTimeout(() => {
        const exerciseModal = document.getElementById('exercise-modal');
        if (exerciseModal) exerciseModal.remove();
        this.afficherChapitre(window.currentChapitreId);
    }, 2100);
}
```

---

### 3. VALIDER QCM
**Fichier**: `js/app.js` ligne **6415**

```javascript
/**
 * Valide un QCM simple (1 question, 1 réponse correcte)
 */
if (typeExo === 'qcm' || typeExo === 'qcm_scenario') {
    // Trouver la réponse sélectionnée
    const selectedRadio = document.querySelector('input[name="qcm_answer"]:checked');
    if (!selectedRadio) {
        showErrorNotification('⚠️ Veuillez sélectionner une réponse');
        return;
    }
    
    // Comparer avec la réponse correcte
    const correctAnswer = parseInt(exercice.content.correctAnswer);
    const selectedIndex = parseInt(selectedRadio.value);
    const isCorrect = selectedIndex === correctAnswer;
    
    // Calculer le score (100% ou 0%)
    score = isCorrect ? 100 : 0;
    
    console.log(`[🔍] QCM: Correct=${correctAnswer}, Selected=${selectedIndex}, Result=${isCorrect}`);
}
```

---

## C) STRUCTURE DE DONNÉES (EXEMPLES RÉELS)

### 1. EXERCICE VIDEO (Type A - Consultation)

```json
{
  "id": "ch1_ex_001",
  "type": "video",
  "titre": "[EX 1] Vidéo: Histoire de la Douane suisse",
  "description": "Regardez la vidéo pour comprendre l'histoire de la douane",
  "content": {
    "videoType": "youtube",
    "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    "description": "Première vidéo YouTube"
  },
  "points": 10
}
```

**Structure pour étape parent:**
```json
{
  "id": "ch1_step1",
  "numero": 1,
  "titre": "Histoire de la Douane suisse",
  "type": "exercise_group",
  "duree": "3 min",
  "completed": false,
  "points": 10,
  "exercices": [
    { /* exercice ci-dessus */ }
  ],
  "consultation": true,
  "validation": false
}
```

---

### 2. EXERCICE LECTURE (Type A - Consultation)

```json
{
  "id": "ch1_ex_005",
  "type": "lecture",
  "titre": "[EX 5] Lecture: Les missions de la douane suisse",
  "description": "Lire le texte explicatif sur les missions",
  "content": {
    "text": "La douane suisse remplit plusieurs missions essentielles:\n\n1. FISCALE: Perception des droits et taxes...\n\n2. PROTECTION: Lutte contre la contrebande..."
  },
  "points": 10
}
```

---

### 3. EXERCICE FLASHCARDS (Type A - Consultation)

```json
{
  "id": "ch1_ex_006",
  "type": "flashcards",
  "titre": "[EX 6] Flashcards: Les 3 domaines douaniers",
  "description": "Mémoriser avec les cartes flashcard",
  "content": {
    "cards": [
      {
        "id": "card1",
        "recto": "Quel est le domaine FISCAL de la douane?",
        "verso": "La perception des droits de douane et des taxes sur les marchandises importées"
      },
      {
        "id": "card2",
        "recto": "Quel est le domaine de PROTECTION?",
        "verso": "La lutte contre la contrebande, le trafic et la fraude douanière"
      },
      {
        "id": "card3",
        "recto": "Quel est le domaine de SECURITE?",
        "verso": "Le contrôle des marchandises dangereuses et prohibées pour protéger la population"
      }
    ]
  },
  "points": 10
}
```

---

### 4. EXERCICE QCM (Type B - Validation)

```json
{
  "id": "ch1_ex_002",
  "type": "qcm",
  "titre": "[EX 2] QCM: Nombre de cantons",
  "description": "Question sur le nombre de cantons en Suisse",
  "content": {
    "question": "Combien de cantons compte la Suisse?",
    "options": [
      {
        "label": "24 cantons",
        "correct": false
      },
      {
        "label": "26 cantons",
        "correct": true
      },
      {
        "label": "28 cantons",
        "correct": false
      },
      {
        "label": "30 cantons",
        "correct": false
      }
    ],
    "correctAnswer": 1,
    "explanation": "La Suisse compte 26 cantons depuis 1975. Le 26ème canton, le Jura, a été créé en 1978."
  },
  "points": 10
}
```

**Structure pour étape parent:**
```json
{
  "id": "ch1_step2",
  "numero": 2,
  "titre": "Organisation actuelle",
  "type": "exercise_group",
  "duree": "5 min",
  "completed": false,
  "points": 10,
  "exercices": [
    { /* QCM ci-dessus */ }
  ],
  "consultation": false,
  "validation": true
}
```

---

### 5. EXERCICE QUIZ (Type B - Validation)

```json
{
  "id": "ch1_ex_007",
  "type": "quiz",
  "titre": "[EX 7] Quiz: Introduction à la Douane",
  "description": "Répondez aux 3 questions pour valider ce chapitre",
  "content": {
    "questions": [
      {
        "id": "q1",
        "question": "La douane suisse dépend de quel département?",
        "options": [
          "Département de la Justice",
          "Département des Finances",
          "Département de l'Intérieur",
          "Département de la Défense"
        ],
        "correctAnswer": 1,
        "explanation": "La douane suisse est sous l'autorité du Département fédéral des finances (DFF)."
      },
      {
        "id": "q2",
        "question": "Quel est le rôle PRINCIPAL de la douane?",
        "options": [
          "Collecter les taxes et protéger les frontières",
          "Gérer les prisons",
          "Émettre les passeports",
          "Gérer les aéroports"
        ],
        "correctAnswer": 0,
        "explanation": "La douane a pour mission principale de collecter les droits et taxes, et de protéger les frontières suisses."
      },
      {
        "id": "q3",
        "question": "En quelle année la Suisse a-t-elle créé le 26ème canton?",
        "options": [
          "1975",
          "1978",
          "1980",
          "1985"
        ],
        "correctAnswer": 1,
        "explanation": "Le Jura, 26ème canton de la Suisse, a été créé en 1978 par la scission d'une partie du canton de Berne."
      }
    ],
    "scoreMin": 2
  },
  "points": 20
}
```

---

## D) FLUX D'ÉTAPE COMPLET

### Type A (Consultation - Pas de validation)

```
Utilisateur clique "Accéder"
    ↓
afficherEtape() → renderConsultModal()
    ↓
renderConsultExercises() → Affiche VIDEO/LECTURE/FLASHCARDS
    ↓
Utilisateur consulte le contenu
    ↓
Clic "Marquer comme complété"
    ↓
completerEtapeConsultation()
    ├─ markStepVisited() → StorageManager + localStorage
    ├─ unlockNextStep() → Prochaine étape déverrouillée
    └─ afficherChapitre() → Retour au chapitre
```

---

### Type B (Validation - QCM/Quiz)

```
Utilisateur clique "Accéder"
    ↓
afficherEtape() → renderExerciseModal()
    ↓
renderExerciceModal() → Affiche QCM ou QUIZ
    ↓
Utilisateur sélectionne réponses
    ↓
Clic "Soumettre réponses"
    ↓
validerExerciceRenderModal()
    ├─ Si QCM: Valide 1 réponse → calcule score
    └─ Si QUIZ: Appelle validerQuiz()
    ↓
validerQuiz() → Affiche résultats + bouton "Marquer comme terminé"
    ├─ Masque "Soumettre réponses"
    └─ Si score ≥ 50%: Affiche bouton "Marquer comme terminé"
    ↓
Clic "Marquer comme terminé"
    ↓
completerQuizEtape()
    ├─ markStepAttempted() → StorageManager + localStorage
    ├─ unlockNextStep() → Prochaine étape déverrouillée
    └─ afficherChapitre() → Retour au chapitre
```

---

## E) POINTS CRITIQUES

### ✅ CE QUI FONCTIONNE

1. **Video Auto-Detection**:
   - Format `watch?v=` → Converti en `embed/` automatiquement
   - Détecte `youtube.com` ou `youtu.be` → Type "youtube"
   - Détecte `.mp4`, `.webm`, `.ogg` → Type "local"

2. **Storage Sync**:
   - `markStepVisited()` → StorageManager + localStorage
   - `markStepAttempted()` → StorageManager + localStorage
   - `unlockNextStep()` → StorageManager + localStorage
   - `canAccessStep()` → Lit de StorageManager

3. **Quiz Workflow**:
   - Soumettre → Voir résultats
   - Bouton "Soumettre réponses" disparaît
   - Bouton "Marquer comme terminé" apparaît
   - Retour au chapitre après completion

---

### ⚠️ À RESPECTER

1. **Structure JSON requise**:
   - Chaque exercice DOIT avoir: `id`, `type`, `titre`, `content`, `points`
   - Chaque étape DOIT avoir: `consultation` ou `validation` flag
   - Chaque question DOIT avoir: `question`, `options`, `correctAnswer`

2. **Fenêtrage global**:
   - `window.currentChapitreId` + `window.currentStepId` DOIVENT être définis
   - `window.videoManifest` optionnel (fallback)
   - `CHAPITRES` doit être disponible globalement

3. **Points de sélection**:
   - Questions QCM: `input[name="qcm_answer"]`
   - Questions Quiz: `input[data-correct]`
   - Différenciation: QCM = 1 seule input, Quiz = multiple inputs

---

## F) TEMPLATES UNIVERSELS

### Template QCM

```json
{
  "id": "ex_XXX",
  "type": "qcm",
  "titre": "[EX N] QCM: Titre de la question",
  "description": "Description courte",
  "content": {
    "question": "La question exacte?",
    "options": [
      { "label": "Option 1", "correct": false },
      { "label": "Option 2 (BONNE)", "correct": true },
      { "label": "Option 3", "correct": false },
      { "label": "Option 4", "correct": false }
    ],
    "correctAnswer": 1,
    "explanation": "Explique pourquoi réponse 1 est correcte..."
  },
  "points": 10
}
```

### Template Quiz

```json
{
  "id": "ex_XXX",
  "type": "quiz",
  "titre": "[EX N] Quiz: Titre",
  "description": "Description",
  "content": {
    "questions": [
      {
        "id": "q1",
        "question": "Question 1?",
        "options": ["Réponse 1", "Réponse 2 (BONNE)", "Réponse 3"],
        "correctAnswer": 1,
        "explanation": "Explication..."
      },
      {
        "id": "q2",
        "question": "Question 2?",
        "options": ["Réponse 1 (BONNE)", "Réponse 2", "Réponse 3"],
        "correctAnswer": 0,
        "explanation": "Explication..."
      }
    ],
    "scoreMin": 1
  },
  "points": 20
}
```

### Template Vidéo

```json
{
  "id": "ex_XXX",
  "type": "video",
  "titre": "[EX N] Vidéo: Titre",
  "description": "Description",
  "content": {
    "videoType": "youtube",
    "url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "description": "Description vidéo"
  },
  "points": 10
}
```

---

**Fin de référence**. Utilise ces templates pour tous les nouveaux exercices!
