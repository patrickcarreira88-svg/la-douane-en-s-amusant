/**
 * Portfolio Swipe - Gestion du portfolio interactif
 * Permet aux utilisateurs de créer leur plan de révision avec swipe
 * Basé sur le prototype de révision adaptatif
 */

const PortfolioSwipe = {
    deck: [],
    currentIndex: 0,
    isInitialized: false,

    /**
     * Initialise le portfolio swipe avec les objectifs du chapitre
     */
    init(chapitreId) {
        console.log('📱 Initialisation Portfolio Swipe...');
        const chapitre = CHAPITRES.find(ch => ch.id === chapitreId);
        if (!chapitre || !chapitre.objectifs) {
            console.error('❌ Chapitre ou objectifs non trouvés');
            return;
        }

        // Créer les cartes à partir des objectifs
        this.deck = chapitre.objectifs.map((objectif, index) => ({
            id: `card-${index}`,
            h3: `Point clé ${index + 1}`,
            p: objectif,
            mastery: null, // null, 'pas-maitrise', 'a-approfondir', 'maitrise'
            completed: false
        }));

        this.currentIndex = 0;
        this.isInitialized = true;

        this.render();
        this.attachEvents();
        console.log('✅ Portfolio initialisé avec', this.deck.length, 'cartes');
    },

    /**
     * Rend le deck de cartes
     */
    render() {
        const deckElement = document.getElementById('portfolio-swipe-container');
        if (!deckElement) return;

        // Créer le HTML du deck
        let deckHTML = `
            <div class="deck" id="deck" aria-live="polite">
        `;

        this.deck.forEach((card, index) => {
            const isActive = index === this.currentIndex;
            const transform = this.getCardTransform(index);
            
            deckHTML += `
                <div class="card" id="${card.id}" style="transform: ${transform}; opacity: ${isActive ? 1 : 0}; pointer-events: ${isActive ? 'auto' : 'none'}; z-index: ${this.deck.length - index};">
                    <h3>${card.h3}</h3>
                    <p>${card.p}</p>
                </div>
            `;
        });

        deckHTML += `
            </div>
            <div class="deck-counter">
                <span id="card-counter">${this.currentIndex + 1} / ${this.deck.length}</span>
            </div>
        `;

        deckElement.innerHTML = deckHTML;
    },

    /**
     * Calcule la transformation CSS pour une carte
     */
    getCardTransform(index) {
        const diff = index - this.currentIndex;
        
        if (diff < -1) {
            return 'translateX(-200%) scale(0.95)';
        } else if (diff === -1) {
            return 'translateX(-110%) scale(0.97)';
        } else if (diff === 0) {
            return 'translateX(0) scale(1)';
        } else if (diff === 1) {
            return 'translateX(110%) scale(0.97)';
        } else {
            return 'translateX(200%) scale(0.95)';
        }
    },

    /**
     * Attache les événements aux boutons et gestes tactiles
     */
    attachEvents() {
        const btnLeft = document.getElementById('btn-portfolio-left');
        const btnUp = document.getElementById('btn-portfolio-up');
        const btnRight = document.getElementById('btn-portfolio-right');

        if (btnLeft) {
            btnLeft.addEventListener('click', () => this.swipeCard('left'));
        }
        if (btnUp) {
            btnUp.addEventListener('click', () => this.swipeCard('up'));
        }
        if (btnRight) {
            btnRight.addEventListener('click', () => this.swipeCard('right'));
        }

        // Support clavier
        document.addEventListener('keydown', (e) => {
            if (!this.isInitialized || !document.getElementById('portfolio-modal').classList.contains('hidden') === false) return;
            
            if (e.key === 'ArrowLeft') this.swipeCard('left');
            if (e.key === 'ArrowUp') this.swipeCard('up');
            if (e.key === 'ArrowRight') this.swipeCard('right');
        });

        // Support tactile (swipe mobile)
        this.addTouchSupport();
    },

    /**
     * Ajoute le support des gestes tactiles (swipe)
     */
    addTouchSupport() {
        const deck = document.getElementById('deck');
        if (!deck) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const SWIPE_THRESHOLD = 30; // Minimum de pixels pour déclencher le swipe

        deck.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
            
            // Feedback visuel: réduire la carte légèrement
            const activeCard = deck.querySelector('.card[style*="opacity: 1"]');
            if (activeCard) {
                activeCard.style.transition = 'none';
            }
        }, false);

        deck.addEventListener('touchmove', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;

            // Feedback visuel pendant le drag
            const activeCard = deck.querySelector('.card[style*="opacity: 1"]');
            if (activeCard) {
                const dragDistance = touchEndX - touchStartX;
                activeCard.style.transform = `translateX(${dragDistance * 0.5}px) scale(${1 - Math.abs(dragDistance) / 1000})`;
            }
        }, false);

        deck.addEventListener('touchend', (e) => {
            const dragDistance = touchEndX - touchStartX;
            const dragVertical = touchEndY - touchStartY;

            // Reset transition
            const activeCard = deck.querySelector('.card[style*="opacity: 1"]');
            if (activeCard) {
                activeCard.style.transition = 'all 0.3s ease-out';
            }

            // Déterminer la direction du swipe
            if (Math.abs(dragVertical) > Math.abs(dragDistance) && Math.abs(dragVertical) > SWIPE_THRESHOLD) {
                // Swipe vertical (up)
                if (dragVertical < 0) {
                    this.swipeCard('up');
                }
            } else if (Math.abs(dragDistance) > SWIPE_THRESHOLD) {
                // Swipe horizontal
                if (dragDistance < 0) {
                    // Swipe gauche (left) = pas maîtrisé
                    this.swipeCard('left');
                } else {
                    // Swipe droit (right) = maîtrisé
                    this.swipeCard('right');
                }
            }
        }, false);

        console.log('✅ Gestes tactiles activés pour le portfolio');
    },

    /**
     * Swipe une carte avec notation
     */
    swipeCard(direction) {
        if (this.currentIndex >= this.deck.length) return;

        const mastery = {
            'left': 'pas-maitrise',
            'up': 'a-approfondir',
            'right': 'maitrise'
        }[direction];

        // Enregistrer la notation
        this.deck[this.currentIndex].mastery = mastery;
        this.deck[this.currentIndex].completed = true;

        // Animation du swipe
        const card = document.getElementById(this.deck[this.currentIndex].id);
        if (card) {
            const direction_map = { 'left': '-', 'up': '↑', 'right': '→' };
            card.style.transform = `translateX(${direction === 'left' ? '-150%' : direction === 'right' ? '150%' : '0'}) rotate(${direction === 'left' ? '-20deg' : direction === 'right' ? '20deg' : '0deg'})`;
            card.style.opacity = '0';
        }

        // Aller à la carte suivante
        setTimeout(() => {
            this.currentIndex++;
            if (this.currentIndex < this.deck.length) {
                this.render();
                this.attachEvents();
            } else {
                this.showCompletion();
            }
        }, 200);
    },

    /**
     * Affiche le message de fin
     */
    showCompletion() {
        const deckElement = document.getElementById('portfolio-swipe-container');
        if (!deckElement) return;

        const stats = this.getStats();
        
        deckElement.innerHTML = `
            <div class="completion-screen">
                <h2>🎉 Plan de révision terminé!</h2>
                <div class="stats">
                    <div class="stat-box">
                        <span class="stat-value">${stats.mastery}</span>
                        <span class="stat-label">Maîtrisés ✅</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">${stats.approfondir}</span>
                        <span class="stat-label">À approfondir ⚠️</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">${stats.pasMaitrise}</span>
                        <span class="stat-label">À revoir ❌</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Obtient les statistiques du plan
     */
    getStats() {
        return {
            mastery: this.deck.filter(c => c.mastery === 'maitrise').length,
            approfondir: this.deck.filter(c => c.mastery === 'a-approfondir').length,
            pasMaitrise: this.deck.filter(c => c.mastery === 'pas-maitrise').length
        };
    },

    /**
     * Récupère les données du plan
     */
    getPlanData() {
        return this.deck;
    },

    /**
     * Efface le portfolio
     */
    clear() {
        this.deck = [];
        this.currentIndex = 0;
        this.isInitialized = false;
    }
};

