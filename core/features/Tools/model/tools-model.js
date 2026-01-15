/**
 * Tools Model - Logique métier pour le drawer d'outils
 */

import { ADDICTION_PLUGINS } from '../data/tools-data.js';

export class ToolsModel {
    /**
     * Récupère le nom du plugin pour une addiction
     * @param {string} addictionId - ID de l'addiction
     * @returns {string|null} Nom du plugin ou null
     */
    getPluginName(addictionId) {
        return ADDICTION_PLUGINS[addictionId] || null;
    }

    /**
     * Génère le label du bouton Config selon l'addiction
     * @param {Object} state - State de l'application
     * @returns {string} Label du bouton
     */
    getConfigButtonLabel(state) {
        const lang = state.profile?.lang || 'fr';
        const currentAddiction = state.addictions?.[0] || 'porn';
        
        // Récupérer le nom de l'addiction depuis AddictionsConfig
        let addictionName = '';
        if (typeof AddictionsConfig !== 'undefined' && AddictionsConfig.getAddictionConfig) {
            const config = AddictionsConfig.getAddictionConfig(currentAddiction);
            if (config && config.labelKey) {
                addictionName = I18n.t(config.labelKey);
            }
        }
        
        // Fallback si pas de nom trouvé
        if (!addictionName) {
            const fallbackNames = {
                fr: { porn: 'Contenu adulte', cigarette: 'Cigarette', alcohol: 'Alcool', drugs: 'Substances', social_media: 'Réseaux sociaux', gaming: 'Jeux vidéo', food: 'Nourriture', shopping: 'Achats' },
                en: { porn: 'Adult content', cigarette: 'Cigarette', alcohol: 'Alcohol', drugs: 'Substances', social_media: 'Social media', gaming: 'Gaming', food: 'Food', shopping: 'Shopping' },
                ar: { porn: 'محتوى للبالغين', cigarette: 'سجائر', alcohol: 'كحول', drugs: 'مواد', social_media: 'وسائل التواصل', gaming: 'ألعاب', food: 'طعام', shopping: 'تسوق' }
            };
            addictionName = fallbackNames[lang]?.[currentAddiction] || fallbackNames.fr[currentAddiction] || 'Addiction';
        }
        
        const labels = {
            fr: `Configurer ${addictionName}`,
            en: `Configure ${addictionName}`,
            ar: `إعدادات ${addictionName}`
        };
        
        return labels[lang] || labels.fr;
    }
}
