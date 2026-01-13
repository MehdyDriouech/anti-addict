/**
 * Checkin View - Rendu HTML pour le check-in
 */

export class CheckinView {
    /**
     * Rend l'écran de check-in
     * @param {Object} checkinData - Données du check-in existant
     * @param {string} lang - Langue
     */
    render(checkinData, lang) {
        const screen = document.getElementById('screen-checkin');
        if (!screen) return;
        
        screen.innerHTML = `
            <button class="btn btn-ghost mb-lg" onclick="Router.navigateTo('home')">
                <span>←</span>
                <span>${I18n.t('back')}</span>
            </button>
            
            <div class="mb-lg">
                <h2>${I18n.t('checkin_title')}</h2>
                <p class="text-secondary">${I18n.t('checkin_subtitle')}</p>
            </div>
            
            <form id="checkin-form" onsubmit="Checkin.submit(event)">
                <div class="form-group">
                    <label class="form-label">${I18n.t('mood')} 😊</label>
                    <div class="range-container">
                        <span>0</span>
                        <input type="range" class="form-range" id="checkin-mood" 
                               min="0" max="10" value="${checkinData.mood}" 
                               oninput="Checkin.updateRangeValue(this)">
                        <span>10</span>
                        <span class="range-value">${checkinData.mood}</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">${I18n.t('stress')} 😰</label>
                    <div class="range-container">
                        <span>0</span>
                        <input type="range" class="form-range" id="checkin-stress" 
                               min="0" max="10" value="${checkinData.stress}"
                               oninput="Checkin.updateRangeValue(this)">
                        <span>10</span>
                        <span class="range-value">${checkinData.stress}</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">${I18n.t('craving')} 🔥</label>
                    <div class="range-container">
                        <span>0</span>
                        <input type="range" class="form-range" id="checkin-craving" 
                               min="0" max="10" value="${checkinData.craving}"
                               oninput="Checkin.updateRangeValue(this)">
                        <span>10</span>
                        <span class="range-value">${checkinData.craving}</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">${I18n.t('solitude')} 😔</label>
                    <div class="range-container">
                        <span>0</span>
                        <input type="range" class="form-range" id="checkin-solitude" 
                               min="0" max="10" value="${checkinData.solitude || 5}"
                               oninput="Checkin.updateRangeValue(this)">
                        <span>10</span>
                        <span class="range-value">${checkinData.solitude || 5}</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <div class="toggle-container">
                        <div class="toggle-label">
                            <span class="toggle-title">${I18n.t('exposure')}</span>
                            <span class="toggle-desc">${I18n.t('exposure_desc')}</span>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" id="checkin-exposure" ${checkinData.exposure ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">${I18n.t('notes')}</label>
                    <textarea class="form-textarea" id="checkin-notes" 
                              placeholder="${I18n.t('notes_placeholder')}">${checkinData.notes || ''}</textarea>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block btn-lg">
                    <span>✓</span>
                    <span>${I18n.t('save')}</span>
                </button>
            </form>
        `;
    }

    /**
     * Met à jour l'affichage de la valeur du range
     * @param {HTMLInputElement} input - Input range
     */
    updateRangeValue(input) {
        const container = input.closest('.range-container');
        const valueDisplay = container.querySelector('.range-value');
        if (valueDisplay) {
            valueDisplay.textContent = input.value;
        }
    }
}
