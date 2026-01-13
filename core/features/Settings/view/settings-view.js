/**
 * Settings View - Rendu HTML pour les réglages
 */

import { BUILD_VERSION, LANGUAGE_LABELS } from '../data/settings-data.js';

export class SettingsView {
    /**
     * Rend l'écran de réglages
     * @param {Object} state - State de l'application
     * @param {Function} getAddictionIcon - Fonction pour obtenir l'icône d'une addiction
     */
    render(state, getAddictionIcon) {
        const screen = document.getElementById('screen-settings');
        if (!screen) return;
        
        const langLabels = LANGUAGE_LABELS;
        const religionLabels = { 
            none: I18n.t('religion_none'), 
            islam: I18n.t('religion_islam'),
            christianity: I18n.t('religion_christianity'),
            judaism: I18n.t('religion_judaism'),
            buddhism: I18n.t('religion_buddhism')
        };
        
        screen.innerHTML = `
            <div class="mb-lg">
                <h2>${I18n.t('settings')}</h2>
            </div>
            
            <!-- Section Profil -->
            <div class="settings-section">
                <div class="settings-title">${I18n.t('appearance')}</div>
                <div class="settings-list">
                    <div class="settings-item" onclick="openLanguageModal()">
                        <div class="settings-item-left">
                            <div class="settings-item-icon">🌍</div>
                            <div class="settings-item-text">
                                <span class="settings-item-title">${I18n.t('language')}</span>
                                <span class="settings-item-value">${langLabels[state.profile.lang]}</span>
                            </div>
                        </div>
                        <div class="settings-item-right">›</div>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-left">
                            <div class="settings-item-icon">${(state.settings.theme || 'dark') === 'light' ? '☀️' : '🌙'}</div>
                            <div class="settings-item-text">
                                <span class="settings-item-title">${(state.settings.theme || 'dark') === 'light' ? 'Thème clair' : 'Thème sombre'}</span>
                                <span class="settings-item-value">${(state.settings.theme || 'dark') === 'light' ? 'Activé' : 'Activé'}</span>
                            </div>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" 
                                   ${(state.settings.theme || 'dark') === 'light' ? 'checked' : ''}
                                   onchange="toggleTheme()">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Section Spirituel -->
            <div class="settings-section">
                <div class="settings-title">${I18n.t('spiritual_cards')}</div>
                <div class="settings-list">
                    <div class="settings-item" onclick="openReligionModal()">
                        <div class="settings-item-left">
                            <div class="settings-item-icon">🤲</div>
                            <div class="settings-item-text">
                                <span class="settings-item-title">${I18n.t('religion')}</span>
                                <span class="settings-item-value">${religionLabels[state.profile.religion]}</span>
                            </div>
                        </div>
                        <div class="settings-item-right">›</div>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-left">
                            <div class="settings-item-icon">✨</div>
                            <div class="settings-item-text">
                                <span class="settings-item-title">${I18n.t('spiritual_cards')}</span>
                                <span class="settings-item-value">${state.profile.spiritualEnabled ? I18n.t('enabled') : I18n.t('disabled')}</span>
                            </div>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" id="toggle-spiritual" 
                                   ${state.profile.spiritualEnabled ? 'checked' : ''}
                                   onchange="toggleSpiritualCards(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Section Addictions -->
            <div class="settings-section">
                <div class="settings-title">${I18n.t('addictions')}</div>
                <div class="settings-list">
                    ${(typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAllAddictionIds ? AddictionsConfig.getAllAddictionIds() : ['porn', 'cigarette', 'alcohol', 'drugs']).map(id => {
                        const isTracked = state.addictions.some(a => a.id === id);
                        const icon = getAddictionIcon(id);
                        return `
                            <div class="settings-item">
                                <div class="settings-item-left">
                                    <div class="settings-item-icon">${icon}</div>
                                    <div class="settings-item-text">
                                        <span class="settings-item-title">${I18n.t('addiction_' + id)}</span>
                                    </div>
                                </div>
                                <label class="toggle">
                                    <input type="checkbox" 
                                           ${isTracked ? 'checked' : ''}
                                           onchange="toggleAddiction('${id}', this.checked)">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Section Données -->
            <div class="settings-section">
                <div class="settings-title">${I18n.t('data_management')}</div>
                <div class="settings-list">
                    <div class="settings-item" onclick="exportData()">
                        <div class="settings-item-left">
                            <div class="settings-item-icon">📤</div>
                            <div class="settings-item-text">
                                <span class="settings-item-title">${I18n.t('export_data')}</span>
                            </div>
                        </div>
                        <div class="settings-item-right">›</div>
                    </div>
                    <div class="settings-item" onclick="triggerImport()">
                        <div class="settings-item-left">
                            <div class="settings-item-icon">📥</div>
                            <div class="settings-item-text">
                                <span class="settings-item-title">${I18n.t('import_data')}</span>
                            </div>
                        </div>
                        <div class="settings-item-right">›</div>
                    </div>
                    <div class="settings-item" onclick="confirmClearData()">
                        <div class="settings-item-left">
                            <div class="settings-item-icon">🗑️</div>
                            <div class="settings-item-text">
                                <span class="settings-item-title" style="color: var(--danger)">${I18n.t('clear_data')}</span>
                            </div>
                        </div>
                        <div class="settings-item-right">›</div>
                    </div>
                </div>
            </div>
            
            <!-- Input file caché pour l'import -->
            <input type="file" id="import-file" accept=".json" style="display: none" onchange="handleImport(this)">
            
            <!-- Section À propos -->
            <div class="settings-section">
                <div class="settings-title">${I18n.t('about')}</div>
                <div class="about-content">
                    <p class="about-description">
                        Revenir est une application web progressive (PWA) pour le suivi et la gestion des addictions, 
                        avec un focus sur la confidentialité et le fonctionnement hors-ligne. 
                        100% privée, toutes les données restent sur votre appareil.
                    </p>
                    <div class="about-links">
                        <a href="https://github.com/MehdyDriouech/anti-addict" target="_blank" rel="noopener noreferrer" class="about-link">
                            <span class="about-link-icon">📦</span>
                            <span>Code source (GitHub)</span>
                        </a>
                        <a href="https://paypal.me/MDRIOUECH" target="_blank" rel="noopener noreferrer" class="about-link">
                            <span class="about-link-icon">💝</span>
                            <span>Soutenir le projet</span>
                        </a>
                    </div>
                    <div class="settings-item" style="margin-top: var(--space-md);">
                        <div class="settings-item-left">
                            <div class="settings-item-icon">ℹ️</div>
                            <div class="settings-item-text">
                                <span class="settings-item-title">${I18n.t('version')}</span>
                                <span class="settings-item-value">5.0 (${BUILD_VERSION})</span>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="text-secondary mt-md" style="font-size: 0.875rem; text-align: center;">
                    ${I18n.t('privacy_note')}
                </p>
                <p class="text-secondary mt-sm" style="font-size: 0.75rem; text-align: center; font-style: italic;">
                    Cette application ne remplace pas un suivi médical ou thérapeutique professionnel.
                </p>
            </div>
        `;
    }
}
