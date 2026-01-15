/**
 * SOS View - Génération HTML et manipulation DOM
 */

import { EMERGENCY_MESSAGES, LABELS } from '../data/sos-data.js';

export class SOSView {
    constructor() {
        this.sosScreenEl = null;
    }

    /**
     * Crée l'élément DOM du SOS screen
     */
    createScreenElement() {
        if (!this.sosScreenEl) {
            this.sosScreenEl = document.createElement('div');
            this.sosScreenEl.className = 'sos-screen-overlay';
            this.sosScreenEl.id = 'sosScreen';
            document.body.appendChild(this.sosScreenEl);
        }
        return this.sosScreenEl;
    }

    /**
     * Rendu de l'écran SOS
     * @param {Object} state - State de l'application
     * @param {Array} actionsToShow - Actions à afficher
     * @param {Object} spiritualCard - Carte spirituelle (optionnel)
     * @param {boolean} lowTextMode - Mode low-text
     */
    renderSOSScreen(state, actionsToShow, spiritualCard, lowTextMode) {
        const lang = state.profile.lang;
        const isSpiritual = state.profile.spiritualEnabled && state.profile.religion !== 'none';
        const l = LABELS[lang] || LABELS.fr;
        
        // Message aléatoire
        const messages = EMERGENCY_MESSAGES[lang] || EMERGENCY_MESSAGES.fr;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        this.sosScreenEl.innerHTML = `
            <div class="sos-screen ${lowTextMode ? 'low-text' : ''}">
                <!-- Header -->
                <div class="sos-header">
                    <h1 class="sos-title">🆘 ${l.title}</h1>
                    <button class="sos-close-btn" onclick="SOS.deactivate()">×</button>
                </div>
                
                <!-- Message principal -->
                <div class="sos-message">
                    <p class="sos-main-message">${randomMessage}</p>
                </div>
                
                <!-- Action rapide (carte unique) -->
                ${actionsToShow.length > 0 ? `
                    <div class="sos-action-card-container">
                        <button class="sos-action-card ${lowTextMode ? 'large' : ''}" 
                                onclick="SOS.executeAction('${actionsToShow[0].id}')">
                            <span class="action-emoji">${actionsToShow[0].emoji}</span>
                            ${!lowTextMode ? `<span class="action-name">${actionsToShow[0].name}</span>` : ''}
                        </button>
                    </div>
                ` : ''}
                
                <!-- Action aléatoire -->
                <button class="btn btn-primary btn-large sos-random-btn" onclick="SOS.randomAction(window.state)">
                    🎲 ${l.randomAction}
                </button>
                
                <!-- Respiration -->
                <button class="btn btn-secondary btn-large sos-breathe-btn" onclick="SOS.startBreathing()">
                    🌬️ ${l.breathe}
                </button>
                
                <!-- Carte spirituelle -->
                ${isSpiritual && spiritualCard ? `
                    <div class="sos-spiritual-card">
                        <h4>📿 ${l.spiritual}</h4>
                        <p class="card-text">"${spiritualCard.text}"</p>
                        <cite>— ${spiritualCard.ref}</cite>
                    </div>
                ` : ''}
                
                <!-- Toggle low-text -->
                <div class="sos-footer">
                    <label class="toggle-label small">
                        <input type="checkbox" ${lowTextMode ? 'checked' : ''} 
                               onchange="SOS.toggleLowText()">
                        <span>${l.lowText}</span>
                    </label>
                </div>
                
                <!-- Bouton fermer -->
                <button class="btn btn-ghost sos-exit-btn" onclick="SOS.confirmExit()">
                    ✓ ${l.close}
                </button>
            </div>
        `;
    }

    /**
     * Affiche l'écran SOS
     */
    show() {
        if (this.sosScreenEl) {
            this.sosScreenEl.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Cache l'écran SOS
     */
    hide() {
        if (this.sosScreenEl) {
            this.sosScreenEl.classList.remove('active');
        }
        document.body.style.overflow = '';
    }

    /**
     * Génère le bouton SOS pour la home
     * @param {Object} state - State de l'application
     * @returns {string} HTML
     */
    renderSOSButton(state) {
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        
        return `
            <button class="btn btn-danger btn-sos" onclick="SOS.activate(state)">
                🆘 ${l.button}
            </button>
        `;
    }

    /**
     * Crée l'overlay de respiration
     * @param {Object} labels - Labels de traduction
     * @returns {HTMLElement} Élément de respiration
     */
    createBreathingOverlay(labels) {
        const breathingEl = document.createElement('div');
        breathingEl.className = 'breathing-overlay';
        breathingEl.innerHTML = `
            <button class="btn btn-ghost breathing-close-btn" onclick="this.parentElement.remove()">×</button>
            <div class="breathing-container">
                <div class="breathing-circle"></div>
                <p class="breathing-instruction">${labels.inhale}</p>
                <p class="breathing-count">4</p>
            </div>
        `;
        
        if (this.sosScreenEl) {
            this.sosScreenEl.appendChild(breathingEl);
        }
        
        return breathingEl;
    }

    /**
     * Met à jour l'affichage de la respiration
     * @param {HTMLElement} breathingEl - Élément de respiration
     * @param {string} instruction - Instruction actuelle
     * @param {number} count - Compte actuel
     * @param {number} scale - Échelle de transformation
     */
    updateBreathingDisplay(breathingEl, instruction, count, scale) {
        const circle = breathingEl.querySelector('.breathing-circle');
        const instructionEl = breathingEl.querySelector('.breathing-instruction');
        const countEl = breathingEl.querySelector('.breathing-count');
        
        if (instructionEl) instructionEl.textContent = instruction;
        if (countEl) countEl.textContent = count;
        if (circle) {
            circle.style.transform = `scale(${scale})`;
            circle.style.transition = `transform ${count}s ease-in-out`;
        }
    }

    /**
     * Termine l'exercice de respiration
     * @param {HTMLElement} breathingEl - Élément de respiration
     * @param {string} doneLabel - Label "Terminé"
     */
    finishBreathing(breathingEl, doneLabel) {
        const instruction = breathingEl.querySelector('.breathing-instruction');
        const countEl = breathingEl.querySelector('.breathing-count');
        const circle = breathingEl.querySelector('.breathing-circle');
        
        if (instruction) instruction.textContent = doneLabel;
        if (countEl) countEl.textContent = '✓';
        if (circle) circle.style.transform = 'scale(1)';
    }

    /**
     * Met à jour la carte d'action unique
     * @param {Object} newAction - Nouvelle action à afficher
     * @param {boolean} lowTextMode - Mode low-text
     */
    updateActionCard(newAction, lowTextMode) {
        if (!this.sosScreenEl || !newAction) return;
        
        const cardContainer = this.sosScreenEl.querySelector('.sos-action-card-container');
        if (!cardContainer) return;
        
        const card = cardContainer.querySelector('.sos-action-card');
        if (!card) return;
        
        // Mettre à jour le bouton de la carte
        card.setAttribute('onclick', `SOS.executeAction('${newAction.id}')`);
        card.className = `sos-action-card ${lowTextMode ? 'large' : ''}`;
        
        const emojiSpan = card.querySelector('.action-emoji');
        const nameSpan = card.querySelector('.action-name');
        
        if (emojiSpan) {
            emojiSpan.textContent = newAction.emoji;
        } else {
            const newEmojiSpan = document.createElement('span');
            newEmojiSpan.className = 'action-emoji';
            newEmojiSpan.textContent = newAction.emoji;
            card.insertBefore(newEmojiSpan, card.firstChild);
        }
        
        if (!lowTextMode) {
            if (nameSpan) {
                nameSpan.textContent = newAction.name;
            } else {
                const newNameSpan = document.createElement('span');
                newNameSpan.className = 'action-name';
                newNameSpan.textContent = newAction.name;
                card.appendChild(newNameSpan);
            }
        } else if (nameSpan) {
            nameSpan.remove();
        }
    }

    /**
     * Highlight visuel d'une action exécutée
     * @param {string} actionId - ID de l'action
     */
    highlightAction(actionId) {
        if (!this.sosScreenEl) return;
        
        const btn = this.sosScreenEl.querySelector(`[onclick*="'${actionId}'"]`);
        if (btn) {
            btn.classList.add('executed');
            setTimeout(() => btn.classList.remove('executed'), 1000);
        }
    }
}
