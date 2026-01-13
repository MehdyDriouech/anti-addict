/**
 * Intentions View - Génération HTML
 */

import { LABELS } from '../data/intentions-data.js';

export class IntentionsView {
    /**
     * Génère le HTML pour afficher l'intention du jour
     * @param {Object} intention - Intention à afficher
     * @param {string} lang - Langue
     * @param {boolean} isEngaged - Si l'utilisateur s'est engagé
     * @returns {string} HTML
     */
    renderIntentionBlock(intention, lang, isEngaged) {
        const l = LABELS[lang] || LABELS.fr;
        
        return `
            <div class="focus-widget intention-focus">
                <div class="focus-header">
                    <span class="focus-icon">💡</span>
                    <span class="focus-title">${l.title}</span>
                </div>
                <div class="focus-content">
                    <p class="focus-text">"${intention.text}"</p>
                    ${intention.ref ? `<p class="focus-ref">— ${intention.ref}</p>` : ''}
                </div>
                <!-- UX #5: Actions pour l'intention -->
                <div class="focus-actions">
                    <button class="intention-engage-btn ${isEngaged ? 'engaged' : ''}" 
                            onclick="Intentions.toggleEngagement(state)" 
                            ${isEngaged ? 'disabled' : ''}>
                        <span class="checkmark">${isEngaged ? '✓' : '☐'}</span>
                        ${isEngaged ? l.engaged : l.engage}
                    </button>
                    <button class="intention-secondary-btn" onclick="Intentions.onNewIntention(state)" title="${l.change}">
                        🔄
                    </button>
                </div>
            </div>
        `;
    }
}
