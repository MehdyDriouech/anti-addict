/**
 * Commitments View - Rendu HTML pour les engagements
 */

import { LABELS } from '../data/commitments-data.js';

export class CommitmentsView {
    constructor() {
        this.modalEl = null;
    }
    
    /**
     * Crée ou récupère l'élément modal
     * @returns {HTMLElement} Élément modal
     */
    createModal() {
        let modal = document.getElementById('commitmentsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'commitmentsModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        this.modalEl = modal;
        return modal;
    }
    
    /**
     * Rend la modale avec la liste des engagements
     * @param {Object} state - State de l'application
     * @param {Array} commitments - Liste des engagements
     */
    renderModal(state, commitments) {
        const modal = this.createModal();
        const lang = state.profile?.lang || 'fr';
        // Utiliser i18n si disponible, sinon fallback vers LABELS
        const l = typeof I18n !== 'undefined' ? {
            title: I18n.t('commitments_title'),
            empty: I18n.t('commitments_empty'),
            emptyDesc: I18n.t('commitments_empty_desc'),
            fromProgram: I18n.t('commitment_from_program'),
            day: I18n.t('commitment_day'),
            date: I18n.t('commitment_date'),
            commitmentText: I18n.t('commitment_text'),
            keyLesson: I18n.t('commitment_lesson'),
            celebration: I18n.t('commitment_celebration'),
            close: I18n.t('close')
        } : (LABELS[lang] || LABELS.fr);
        
        if (commitments.length === 0) {
            modal.innerHTML = `
                <div class="modal-content commitments-modal">
                    <button class="modal-close" onclick="Commitments.closeModal()">×</button>
                    <div class="commitments-header">
                        <h2>💪 ${l.title}</h2>
                    </div>
                    <div class="commitments-empty">
                        <div class="empty-icon">📝</div>
                        <h3>${l.empty}</h3>
                        <p>${l.emptyDesc}</p>
                    </div>
                </div>
            `;
        } else {
            const commitmentsHtml = commitments.map(commitment => {
                const formattedDate = commitment.date 
                    ? this.formatDate(commitment.date, lang)
                    : '';
                
                const programText = l.fromProgram.replace('{program}', commitment.programLabel);
                const dayText = commitment.day !== null ? l.day.replace('{day}', commitment.day) : '';
                const dateText = formattedDate ? l.date.replace('{date}', formattedDate) : '';
                
                return `
                    <div class="commitment-card">
                        <div class="commitment-header">
                            <div class="commitment-meta">
                                <span class="commitment-program">${programText}</span>
                                ${dayText ? `<span class="commitment-day">${dayText}</span>` : ''}
                                ${dateText ? `<span class="commitment-date">${dateText}</span>` : ''}
                            </div>
                        </div>
                        <div class="commitment-content">
                            <div class="commitment-section">
                                <h4>${l.commitmentText}</h4>
                                <p class="commitment-text">${this.escapeHtml(commitment.commitment)}</p>
                            </div>
                            ${commitment.keyLesson ? `
                                <div class="commitment-section">
                                    <h4>${l.keyLesson}</h4>
                                    <p class="commitment-text">${this.escapeHtml(commitment.keyLesson)}</p>
                                </div>
                            ` : ''}
                            ${commitment.celebration ? `
                                <div class="commitment-section">
                                    <h4>${l.celebration}</h4>
                                    <p class="commitment-text">${this.escapeHtml(commitment.celebration)}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            modal.innerHTML = `
                <div class="modal-content commitments-modal">
                    <button class="modal-close" onclick="Commitments.closeModal()">×</button>
                    <div class="commitments-header">
                        <h2>💪 ${l.title}</h2>
                    </div>
                    <div class="commitments-list">
                        ${commitmentsHtml}
                    </div>
                </div>
            `;
        }
        
        // Fermer en cliquant sur l'overlay (éviter les doublons)
        if (!modal._hasClickListener) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
            modal._hasClickListener = true;
        }
        
        // Afficher la modale
        modal.classList.add('active');
    }
    
    /**
     * Formate une date selon la langue
     * @param {string} dateISO - Date au format ISO
     * @param {string} lang - Langue
     * @returns {string} Date formatée
     */
    formatDate(dateISO, lang) {
        if (!dateISO) return '';
        
        const date = new Date(dateISO);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        if (lang === 'ar') {
            return date.toLocaleDateString('ar-SA', options);
        } else if (lang === 'en') {
            return date.toLocaleDateString('en-US', options);
        } else {
            return date.toLocaleDateString('fr-FR', options);
        }
    }
    
    /**
     * Échappe le HTML pour éviter les injections
     * @param {string} text - Texte à échapper
     * @returns {string} Texte échappé
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Ferme la modale
     */
    closeModal() {
        if (this.modalEl) {
            this.modalEl.classList.remove('active');
            setTimeout(() => {
                if (this.modalEl && !this.modalEl.classList.contains('active')) {
                    this.modalEl.remove();
                    this.modalEl = null;
                }
            }, 300);
        }
    }
}
