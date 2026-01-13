/**
 * Tools View - Rendu HTML pour le drawer d'outils
 */

import { TOOLS_LABELS } from '../data/tools-data.js';

export class ToolsView {
    constructor() {
        this.drawerOverlay = null;
    }

    /**
     * Récupère les labels selon la langue
     * @param {string} lang - Langue
     * @returns {Object} Labels
     */
    getLabels(lang) {
        return TOOLS_LABELS[lang] || TOOLS_LABELS.fr;
    }

    /**
     * Récupère les labels du drawer selon la langue
     * @param {string} lang - Langue
     * @returns {Object} Labels du drawer
     */
    getDrawerLabels(lang) {
        return this.getLabels(lang).drawer;
    }

    /**
     * Récupère le label du menu selon la langue
     * @param {string} lang - Langue
     * @returns {string} Label du menu
     */
    getMenuLabel(lang) {
        return this.getLabels(lang).menuLabel;
    }

    /**
     * Rend le drawer d'outils
     * @param {Object} state - State de l'application
     * @param {Object} homeLabels - Labels de la page d'accueil
     * @param {string} configButtonLabel - Label du bouton config
     * @returns {HTMLElement} Élément overlay du drawer
     */
    renderDrawer(state, homeLabels, configButtonLabel) {
        // Supprimer l'ancien si existe
        const existing = document.getElementById('toolsDrawerOverlay');
        if (existing) existing.remove();
        
        const lang = state.profile.lang;
        const dl = this.getDrawerLabels(lang);
        
        // Fallback pour homeLabels si undefined
        const safeHomeLabels = homeLabels || {};
        const fallbackLabels = {
            slopeNowShort: 'Pente',
            eveningRitualShort: 'Rituel',
            programs: 'Programmes',
            spiritualShort: 'Spirituel',
            journal: 'Journal',
            calendar: 'Calendrier',
            viewHeatmap: 'Heatmap',
            viewExperiments: 'Expériences'
        };
        
        // Utiliser homeLabels avec fallback
        const getLabel = (key) => safeHomeLabels[key] || fallbackLabels[key] || key;
        
        const overlay = document.createElement('div');
        overlay.id = 'toolsDrawerOverlay';
        overlay.className = 'tools-drawer-overlay';
        overlay.innerHTML = `
            <div class="tools-drawer">
                <div class="tools-drawer-handle" onclick="Tools.closeDrawer()"></div>
                <div class="tools-drawer-header">
                    <h3 class="tools-drawer-title">🧰 ${dl.title}</h3>
                    <button class="tools-drawer-close" onclick="Tools.closeDrawer()">×</button>
                </div>
                <div class="tools-drawer-content">
                    <!-- Section URGENCE -->
                    <div class="tools-section">
                        <div class="tools-section-title">🚨 ${dl.urgence}</div>
                        <div class="tool-grid">
                            <button class="tool-card priority-urgent" onclick="Tools.closeDrawer(); openSlopeForCurrentAddiction()">
                                <span class="tool-icon">⚠️</span>
                                <span class="tool-label">${getLabel('slopeNowShort')}</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Section ACCOMPAGNEMENT -->
                    <div class="tools-section">
                        <div class="tools-section-title">💜 ${dl.accompagnement}</div>
                        <div class="tool-grid">
                            <button class="tool-card priority-support" onclick="Tools.closeDrawer(); typeof Evening !== 'undefined' && Evening.openEveningRitual(window.state)">
                                <span class="tool-icon">🌙</span>
                                <span class="tool-label">${getLabel('eveningRitualShort')}</span>
                            </button>
                            <button class="tool-card priority-support" onclick="Tools.closeDrawer(); typeof Programs !== 'undefined' && Programs.openSelect(window.state)">
                                <span class="tool-icon">📚</span>
                                <span class="tool-label">${getLabel('programs')}</span>
                            </button>
                            ${state.profile.spiritualEnabled ? `
                                <button class="tool-card priority-support" onclick="Tools.closeDrawer(); typeof Spiritual !== 'undefined' && Spiritual.open(window.state)">
                                    <span class="tool-icon">🤲</span>
                                    <span class="tool-label">${getLabel('spiritualShort')}</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Section SUIVI -->
                    <div class="tools-section">
                        <div class="tools-section-title">📈 ${dl.suivi}</div>
                        <div class="tool-grid">
                            <button class="tool-card priority-tracking" onclick="Tools.closeDrawer(); Router.navigateTo('dashboard')">
                                <span class="tool-icon">📊</span>
                                <span class="tool-label">${dl.title || 'Dashboard'}</span>
                            </button>
                            <button class="tool-card priority-tracking" onclick="Tools.closeDrawer(); typeof Journal !== 'undefined' && Journal.openJournalModal(window.state)">
                                <span class="tool-icon">📝</span>
                                <span class="tool-label">${getLabel('journal')}</span>
                            </button>
                            <button class="tool-card priority-tracking" onclick="Tools.closeDrawer(); typeof Calendar !== 'undefined' && Calendar.open(window.state)">
                                <span class="tool-icon">📅</span>
                                <span class="tool-label">${getLabel('calendar')}</span>
                            </button>
                            <button class="tool-card priority-tracking" onclick="Tools.closeDrawer(); typeof Heatmap !== 'undefined' && Heatmap.openHeatmapModal(window.state)">
                                <span class="tool-icon">📊</span>
                                <span class="tool-label">${getLabel('viewHeatmap')}</span>
                            </button>
                            <button class="tool-card priority-tracking" onclick="Tools.closeDrawer(); typeof Experiments !== 'undefined' && Experiments.openExperimentsModal(window.state)">
                                <span class="tool-icon">🧪</span>
                                <span class="tool-label">${getLabel('viewExperiments')}</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Section CONFIG -->
                    <div class="tools-section">
                        <div class="tools-section-title">⚙️ ${dl.config}</div>
                        <div class="tool-grid">
                            <button class="tool-card priority-config" onclick="Tools.closeDrawer(); openConfigForCurrentAddiction()">
                                <span class="tool-icon">⚙️</span>
                                <span class="tool-label">${configButtonLabel}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.drawerOverlay = overlay;
        
        // Fermer en cliquant sur l'overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeDrawer();
            }
        });
        
        // Activer l'animation après insertion
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
        
        return overlay;
    }

    /**
     * Ferme le drawer
     */
    closeDrawer() {
        if (this.drawerOverlay) {
            this.drawerOverlay.classList.remove('active');
            setTimeout(() => {
                if (this.drawerOverlay) {
                    this.drawerOverlay.remove();
                    this.drawerOverlay = null;
                }
            }, 300);
        }
    }
}
