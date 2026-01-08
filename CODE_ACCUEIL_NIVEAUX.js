/**
 * 🎯 FONCTION renderAccueil() - CODE COMPLET
 * Affiche la page d'accueil avec les 4 niveaux (N1, N2, N3, N4)
 * 
 * Emplacement: js/app.js ligne ~5121
 */

renderAccueil() {
    // Affichage des 4 niveaux (N1, N2, N3, N4)
    const niveaux = [
        { 
            id: 'N1', 
            titre: 'Niveau 1: Les Fondamentaux', 
            description: 'Découvrez les bases de la douane et du dédouanement. Concepts essentiels pour votre formation.' 
        },
        { 
            id: 'N2', 
            titre: 'Niveau 2: Procédures Avancées', 
            description: 'Maîtrisez les procédures douanières avancées. Prérequis: Niveau 1 complété.' 
        },
        { 
            id: 'N3', 
            titre: 'Niveau 3: Cas Complexes', 
            description: 'Résolvez des cas complexes et des situations réelles. Prérequis: Niveau 2 complété.' 
        },
        { 
            id: 'N4', 
            titre: 'Niveau 4: Certification', 
            description: 'Test final et certification. Prérequis: Niveau 3 complété.' 
        }
    ];

    let html = `
        <div class="page active">
            <!-- HEADER ACCUEIL -->
            <div class="accueil-header" style="margin-bottom: 40px;">
                <div class="accueil-welcome">
                    <h1>Bienvenue sur la plateforme!</h1>
                    <p class="accueil-subtitle">Formation continue Douane - Et si on jouait? 🎓</p>
                </div>
            </div>

            <!-- GRILLE DES NIVEAUX -->
            <div class="accueil-content">
                <h2 style="margin-bottom: 30px;">Parcours de Formation</h2>
                <div class="niveaux-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 40px;">
    `;

    niveaux.forEach((niveau, index) => {
        // Obtenir l'état du niveau
        const isUnlocked = App.isNiveauUnlocked(niveau.id);
        const completion = App.calculateNiveauCompletion(niveau.id);
        
        // Calculer les paramètres du cercle SVG
        const circumference = 2 * Math.PI * 45; // radius = 45
        const strokeDashoffset = circumference - (completion / 100) * circumference;

        // Styles conditionnels
        const opacityClass = isUnlocked ? 'opacity-100' : 'opacity-60';
        const cursorStyle = isUnlocked ? 'cursor: pointer;' : 'cursor: not-allowed;';
        const buttonDisabled = isUnlocked ? '' : 'disabled';
        const buttonClass = isUnlocked ? 'btn--primary' : 'btn--secondary';

        // Générer la carte
        html += `
            <div class="niveau-card" style="
                background: white;
                border-radius: 12px;
                padding: 25px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                ${cursorStyle}
                opacity: ${isUnlocked ? '1' : '0.6'};
                ${isUnlocked ? 'border-top: 4px solid #667eea;' : 'border-top: 4px solid #ccc;'}
            ">
                <!-- Titre et description -->
                <div style="margin-bottom: 20px;">
                    <h3 style="margin: 0 0 8px 0; color: #333; font-size: 18px;">${niveau.titre}</h3>
                    <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">${niveau.description}</p>
                </div>

                <!-- Progress Ring SVG -->
                <div style="display: flex; justify-content: center; margin: 25px 0;">
                    <svg width="120" height="120" style="transform: rotate(-90deg);">
                        <!-- Cercle de fond -->
                        <circle cx="60" cy="60" r="45" fill="none" stroke="#e0e0e0" stroke-width="8"/>
                        <!-- Cercle de progression -->
                        <circle 
                            cx="60" cy="60" r="45" 
                            fill="none" 
                            stroke="${isUnlocked ? '#667eea' : '#999'}" 
                            stroke-width="8"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${strokeDashoffset}"
                            stroke-linecap="round"
                            style="transition: stroke-dashoffset 0.5s ease;"
                        />
                    </svg>
                    <div style="position: absolute; display: flex; align-items: center; justify-content: center; width: 120px; height: 120px;">
                        <span style="font-size: 24px; font-weight: bold; color: ${isUnlocked ? '#667eea' : '#999'};">${completion}%</span>
                    </div>
                </div>

                <!-- Stats -->
                <div style="text-align: center; margin-bottom: 20px; padding: 10px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
                    <p style="margin: 0; font-size: 13px; color: #999;">${isUnlocked ? '✅ Déverrouillé' : '🔒 Verrouillé'}</p>
                </div>

                <!-- Bouton -->
                <button 
                    class="btn ${buttonClass}" 
                    onclick="${isUnlocked ? `App.afficherNiveau('${niveau.id}')` : 'return false;'}"
                    ${buttonDisabled}
                    style="width: 100%; padding: 12px; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; transition: all 0.3s ease; ${buttonDisabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                >
                    ${isUnlocked ? '▶ Continuer' : '🔒 Verrouillé'}
                </button>
            </div>
        `;
    });

    html += `
                </div>

                <!-- STATS RAPIDES -->
                <div class="accueil-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 40px;">
                    <div class="stat-card" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center;">
                        <div class="stat-icon" style="font-size: 32px; margin-bottom: 10px;">⭐</div>
                        <div class="stat-value" style="font-size: 24px; font-weight: bold; color: #667eea;">${StorageManager.getUser().totalPoints}</div>
                        <div class="stat-label" style="font-size: 13px; color: #999; margin-top: 5px;">Points gagnés</div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center;">
                        <div class="stat-icon" style="font-size: 32px; margin-bottom: 10px;">🏆</div>
                        <div class="stat-value" style="font-size: 24px; font-weight: bold; color: #667eea;">${niveaux.filter(n => App.isNiveauUnlocked(n.id)).length}</div>
                        <div class="stat-label" style="font-size: 13px; color: #999; margin-top: 5px;">Niveaux déverrouillés</div>
                    </div>
                    <div class="stat-card" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center;">
                        <div class="stat-icon" style="font-size: 32px; margin-bottom: 10px;">📚</div>
                        <div class="stat-value" style="font-size: 24px; font-weight: bold; color: #667eea;">${niveaux.length}</div>
                        <div class="stat-label" style="font-size: 13px; color: #999; margin-top: 5px;">Niveaux total</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return html;
},


/**
 * 🎯 NOUVELLES MÉTHODES - CODE COMPLET
 * Emplacement: js/app.js ligne ~1555 (avant afficherNiveau)
 */

/**
 * Vérifier si un niveau est déverrouillé
 * @param {string} niveauId - ID du niveau (N1, N2, N3, N4)
 * @returns {boolean} true si déverrouillé
 */
isNiveauUnlocked(niveauId) {
    return isNiveauUnlocked(niveauId);
},

/**
 * Calculer la progression d'un niveau
 * @param {string} niveauId - ID du niveau (N1, N2, N3, N4)
 * @returns {number} Pourcentage de complétion (0-100)
 */
calculateNiveauCompletion(niveauId) {
    try {
        const userData = StorageManager.getUser();
        if (!userData || !userData.niveaux || !userData.niveaux[niveauId]) {
            return 0;
        }
        
        const niveauData = userData.niveaux[niveauId];
        const totalChapitres = niveauData.chapitres ? niveauData.chapitres.length : 0;
        
        if (totalChapitres === 0) {
            return 0;
        }
        
        const completedChapitres = niveauData.chapitres.filter(ch => ch.completed).length;
        const completion = Math.round((completedChapitres / totalChapitres) * 100);
        
        console.log(`📊 Completion ${niveauId}: ${completion}% (${completedChapitres}/${totalChapitres})`);
        return completion;
    } catch (error) {
        console.error(`❌ Erreur calculateNiveauCompletion(${niveauId}):`, error);
        return 0;
    }
},
