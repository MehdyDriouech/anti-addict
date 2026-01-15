/**
 * History View - Rendu HTML pour l'historique
 */

export class HistoryView {
    /**
     * Rend l'écran d'historique
     * @param {Array} checkins - Liste des check-ins
     * @param {Function} formatDate - Fonction de formatage de date
     * @param {string} lang - Langue
     */
    render(checkins, formatDate, lang) {
        const screen = document.getElementById('screen-history');
        if (!screen) return;
        
        let historyHTML = '';
        if (checkins.length === 0) {
            historyHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3 class="empty-state-title">${I18n.t('no_checkins')}</h3>
                </div>
            `;
        } else {
            historyHTML = `
                <div class="history-list">
                    ${checkins.map(checkin => `
                        <div class="card history-item">
                            <div class="history-date">${formatDate(checkin.date, lang)}</div>
                            <div class="history-stats">
                                <div class="history-stat">
                                    <span class="icon">😊</span>
                                    <span>${checkin.mood}/10</span>
                                </div>
                                <div class="history-stat">
                                    <span class="icon">😰</span>
                                    <span>${checkin.stress}/10</span>
                                </div>
                                <div class="history-stat">
                                    <span class="icon">🔥</span>
                                    <span>${checkin.craving}/10</span>
                                </div>
                                ${checkin.exposure ? '<div class="history-stat"><span class="icon">⚠️</span></div>' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        screen.innerHTML = `
            <button class="btn btn-ghost mb-lg" onclick="Router.navigateTo('home')">
                <span>←</span>
                <span>${I18n.t('back')}</span>
            </button>
            
            <div class="mb-lg">
                <h2>${I18n.t('history_title')}</h2>
            </div>
            
            ${historyHTML}
        `;
    }
}
