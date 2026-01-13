/**
 * Wins View - Génération HTML
 */

import { LABELS } from '../data/wins-data.js';

export class WinsView {
    /**
     * Génère le HTML pour afficher les victoires invisibles
     * @param {Object} stats - Stats des victoires
     * @param {string} lang - Langue
     * @param {Function} formatMinutes - Fonction de formatage
     * @returns {string} HTML
     */
    renderWinsStats(stats, lang, formatMinutes) {
        const l = LABELS[lang] || LABELS.fr;
        
        return `
            <div class="wins-stats">
                <h4 class="wins-title">${l.title}</h4>
                <div class="wins-grid">
                    <div class="win-stat">
                        <span class="win-icon">🛡️</span>
                        <span class="win-value">${stats.resistedCravings}</span>
                        <span class="win-label">${l.resisted}</span>
                    </div>
                    <div class="win-stat">
                        <span class="win-icon">⏱️</span>
                        <span class="win-value">${formatMinutes(stats.minutesSavedEstimate)}</span>
                        <span class="win-label">${l.saved}</span>
                    </div>
                    <div class="win-stat">
                        <span class="win-icon">✨</span>
                        <span class="win-value">${stats.positiveActionsCount}</span>
                        <span class="win-label">${l.actions}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Génère le HTML compact pour le dashboard
     * @param {Object} stats - Stats des victoires
     * @param {string} lang - Langue
     * @param {Function} formatMinutes - Fonction de formatage
     * @returns {string} HTML (3 items pour une grille)
     */
    renderWinsCompact(stats, lang, formatMinutes) {
        const l = LABELS[lang] || LABELS.fr;
        
        return `
            <div class="progress-item">
                <span class="progress-value">${stats.resistedCravings}</span>
                <span class="progress-label">🛡️ ${l.resistedShort}</span>
            </div>
            <div class="progress-item">
                <span class="progress-value">${formatMinutes(stats.minutesSavedEstimate)}</span>
                <span class="progress-label">⏱️ ${l.savedShort}</span>
            </div>
            <div class="progress-item">
                <span class="progress-value">${stats.positiveActionsCount}</span>
                <span class="progress-label">✨ ${l.actionsShort}</span>
            </div>
        `;
    }
}
