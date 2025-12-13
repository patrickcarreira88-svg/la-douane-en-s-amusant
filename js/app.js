/**
 * App.js - Contrôleur Principal
 * Gère: Routing, pages, gamification
 */

// ═══════════════════════════════════════════════════════════════
// CHARGE DES DONNÉES ET FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════

/**
 * Charge les données des chapitres depuis chapitres.json
 */
async function loadChapitres() {
    try {
        const response = await fetch('data/chapitres.json');
        if (!response.ok) throw new Error('Erreur chargement chapitres.json');
        
        const data = await response.json();
        console.log('✅ Chapitres chargés:', data.chapitres.length);
        
        return data.chapitres;
    } catch (error) {
        console.error('❌ Erreur chargement chapitres:', error);
        return [];
    }
}

// Stocker les chapitres globalement
let CHAPITRES = [];

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
        const isCompleted = step.completed;
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
            </g>
        `;
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
        // ✅ MAINTENANT: Afficher directement le contenu (chemin + jalon objectifs)
        // Les objectifs apparaissent comme un jalon clickable dans le chemin
        this.afficherChapitreContenu(chapitreId);
    },
    
    afficherEtape(stepId, chapitreId) {
        console.log(`📖 Affichage étape: ${stepId}`);
        
        // Stocker l'ID de l'étape actuelle et du chapitre pour la validation
        window.currentStepId = stepId;
        window.currentChapitreId = chapitreId;
        
        // Trouver l'étape et le chapitre
        let etape = null;
        let chapitre = null;
        CHAPITRES.forEach(ch => {
            const found = ch.etapes.find(e => e.id === stepId);
            if (found) {
                etape = found;
                chapitre = ch;
            }
        });
        
        if (!etape) {
            console.error(`❌ Étape ${stepId} non trouvée`);
            return;
        }
        
        // Vérifier si l'étape est verrouillée (étape précédente non complétée)
        const etapeIndex = chapitre.etapes.findIndex(e => e.id === stepId);
        if (etapeIndex > 0 && !chapitre.etapes[etapeIndex - 1].completed) {
            showErrorNotification('⛔ Vous devez compléter l\'étape précédente d\'abord!');
            return;
        }
        
        // Générer le HTML de l'étape
        let html = `
            <h2>${etape.titre}</h2>
            <p style="color: var(--color-text-light);">${etape.contenu}</p>
            
            <div style="display: flex; gap: var(--spacing-md); margin: var(--spacing-md) 0;">
                <span>⏱️ ${etape.duree}</span>
                <span>🎯 ${etape.points} points</span>
            </div>
            
            <hr style="margin: var(--spacing-lg) 0;">
            
            <div id="exercice-container">
                ${this.renderExercice(etape.exercice, etape.type)}
            </div>
        `;
        
        // Injecter dans le modal
        document.getElementById('etape-detail').innerHTML = html;
        
        // Afficher le modal
        document.getElementById('etape-modal').classList.add('active');
        
        console.log(`✅ Étape affichée: ${etape.titre}`);
    },

    /**
     * Rend l'exercice selon son type
     */
    renderExercice(exercice, type) {
        if (!exercice) return '<p>Aucun exercice</p>';
        
        switch(exercice.type) {
            case 'video':
                return this.renderExerciceVideo(exercice);
            case 'qcm':
                return this.renderExerciceQCM(exercice);
            case 'lecture':
                return this.renderExerciceLecture(exercice);
            case 'flashcards':
                return this.renderExerciceFlashcards(exercice);
            case 'quiz':
                return this.renderExerciceQuiz(exercice);
            default:
                return `<p>Type d'exercice inconnu: ${exercice.type}</p>`;
        }
    },

    /**
     * Rendu VIDEO
     */
    renderExerciceVideo(exercice) {
        let embedUrl = exercice.url;
        
        // Gérer les différents formats d'URL YouTube
        if (embedUrl.includes('watch?v=')) {
            const videoId = embedUrl.split('v=')[1]?.split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (embedUrl.includes('youtu.be/')) {
            const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        
        return `
            <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h3>${exercice.titre}</h3>
                <p style="color: var(--color-text-light); margin-bottom: var(--spacing-md);">${exercice.description}</p>
                <div style="position: relative; width: 100%; padding-bottom: 56.25%; margin-bottom: var(--spacing-md); background: #000;">
                    <iframe title="${exercice.titre}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.validerExercice('video')">✅ J'ai regardé la vidéo</button>
            </div>
        `;
    },

    /**
     * Rendu QCM
     */
    renderExerciceQCM(exercice) {
        let html = `
            <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h3>❓ ${exercice.question}</h3>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md); margin-top: var(--spacing-md);">
        `;
        
        exercice.choix.forEach((choix, index) => {
            html += `
                <label style="display: flex; align-items: center; padding: var(--spacing-md); border: 2px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;">
                    <input type="radio" name="qcm" value="${choix.id}" data-correct="${choix.correct}" style="margin-right: var(--spacing-md);">
                    <span>${choix.texte}</span>
                </label>
            `;
        });
        
        html += `
                </div>
                <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.validerQCM('${exercice.choix[0].id}')">Soumettre la réponse</button>
                <div id="feedback" style="margin-top: var(--spacing-md); display: none;"></div>
                ${exercice.explication ? `<p style="color: var(--color-text-light); margin-top: var(--spacing-md); font-style: italic;"><strong>💡 Explication:</strong> ${exercice.explication}</p>` : ''}
            </div>
        `;
        
        return html;
    },

    /**
     * Rendu LECTURE
     */
    renderExerciceLecture(exercice) {
        return `
            <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h3>${exercice.titre}</h3>
                <div style="white-space: pre-wrap; line-height: 1.6; margin: var(--spacing-md) 0;">
                    ${exercice.texte}
                </div>
                <button class="btn btn--primary" style="margin-top: var(--spacing-md); width: 100%;" onclick="App.validerExercice('lecture')">✅ J'ai lu la leçon</button>
            </div>
        `;
    },

    /**
     * Rendu FLASHCARDS
     */
    renderExerciceFlashcards(exercice) {
        let html = `
            <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h3>🎴 Flashcards - Mémorisation</h3>
                <p style="color: var(--color-text-light); margin-bottom: var(--spacing-md);">Cliquez sur une carte pour voir la réponse (${exercice.cartes.length} cartes)</p>
                <div id="flashcard-container" style="perspective: 1000px;">
        `;
        
        exercice.cartes.forEach((carte, index) => {
            const safeId = `card-${index}`;
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
                            <span>${carte.recto}</span>
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
                            <span>${carte.verso}</span>
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
     * Rendu QUIZ
     */
    renderExerciceQuiz(exercice) {
        let html = `
            <div style="background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md);">
                <h3>${exercice.titre}</h3>
                <p style="color: var(--color-text-light); margin-bottom: var(--spacing-md);">${exercice.description}</p>
        `;
        
        exercice.questions.forEach((question, qIndex) => {
            html += `
                <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: white; border-radius: var(--radius-md);">
                    <h4>Q${qIndex + 1}: ${question.question}</h4>
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-md); margin-top: var(--spacing-md);">
            `;
            
            question.choix.forEach(choix => {
                html += `
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="radio" name="q${question.id}" value="${choix.id}" data-correct="${choix.correct}" style="cursor: pointer;">
                        <span style="margin-left: var(--spacing-md);">${choix.texte}</span>
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
        this.fermerModal();
        this.rafraichirAffichage();
    },

    /**
     * Marque une étape comme complétée
     */
    marquerEtapeComplete(chapitreId, stepId) {
        const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
        const etape = chapitre?.etapes.find(e => e.id === stepId);
        
        if (etape) {
            etape.completed = true;
            
            // Calculer la progression du chapitre
            const completedCount = chapitre.etapes.filter(e => e.completed).length;
            chapitre.progression = Math.round((completedCount / chapitre.etapes.length) * 100);
            
            // Sauvegarder dans le localStorage
            const chaptersProgress = StorageManager.getChaptersProgress();
            if (!chaptersProgress[chapitreId]) {
                chaptersProgress[chapitreId] = {
                    title: chapitre.titre,
                    completion: 0,
                    stepsCompleted: []
                };
            }
            chaptersProgress[chapitreId].completion = chapitre.progression;
            chaptersProgress[chapitreId].stepsCompleted.push(stepId);
            StorageManager.update('chaptersProgress', chaptersProgress);
            
            console.log(`✅ Étape ${stepId} marquée comme complétée`);
            console.log(`📊 Progression du chapitre: ${chapitre.progression}%`);

            // Si c'est la dernière étape, afficher le portfolio
            const estDerniere = chapitre.etapes.every(e => e.completed);
            if (estDerniere) {
                console.log('🎉 Tous les objectifs atteints! Affichage portfolio...');
                setTimeout(() => {
                    this.afficherPortfolioModal(chapitreId);
                }, 1500);
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
     * Valide un QCM
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
                
                if (etapeIndex > 0 && !chapitre.etapes[etapeIndex - 1].completed) {
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
                
                App.afficherEtape(stepId, chapitreId);
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
        CHAPITRES.forEach(ch => {
            if (ch.etapes.some(e => e.completed)) {
                ch.etapes.filter(e => e.completed).forEach(e => {
                    exercicesValides.push({
                        id: e.id,
                        titre: e.titre,
                        chapitre: ch.titre,
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
                                <button class="btn btn--primary" onclick="App.afficherEtape('${exerciceActuel.id}', 'ch1')">
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
        const userData = JSON.parse(localStorage.getItem('user_douanes_formation') || '{}');
        const user = userData.user || {};
        
        // Calculer statistiques
        const totalEtapes = CHAPITRES.reduce((s, ch) => s + ch.etapes.length, 0);
        const completedEtapes = CHAPITRES.reduce((s, ch) => s + ch.etapes.filter(e => e.completed).length, 0);
        const chapitresComplets = CHAPITRES.filter(ch => ch.etapes.every(e => e.completed)).length;
        const points = StorageManager.getUser().totalPoints;
        
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
        
        return `
            <div class="page active">
                <div class="page-title">
                    <span>👤</span>
                    <h2>Mon Profil</h2>
                </div>
                
                <div class="container profil-container">
                    <!-- SECTION INFOS UTILISATEUR -->
                    <div class="profil-section profil-user">
                        <h3>Infos Personnelles</h3>
                        <div class="user-info-form">
                            <div class="form-group">
                                <label>Prénom</label>
                                <input type="text" id="user-prenom" value="${user.prenom || ''}" placeholder="Votre prénom">
                            </div>
                            <div class="form-group">
                                <label>Nom</label>
                                <input type="text" id="user-nom" value="${user.nom || ''}" placeholder="Votre nom">
                            </div>
                            <div class="form-group">
                                <label>Numéro Matricule</label>
                                <input type="text" id="user-matricule" value="${user.matricule || ''}" placeholder="D123456" readonly>
                            </div>
                            <button class="btn btn--primary" onclick="App.sauvegarderProfilUtilisateur()">
                                💾 Sauvegarder
                            </button>
                        </div>
                        <div class="rgpd-notice">
                            <p>🔒 <strong>Confidentialité:</strong> Vos données sont stockées localement dans votre navigateur, jamais transmises à un serveur.</p>
                        </div>
                    </div>
                    
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
