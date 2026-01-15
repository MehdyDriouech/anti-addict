/**
 * Init View - Rendu HTML pour l'initialisation
 */

export class InitView {
    /**
     * Applique les traductions à l'UI statique
     */
    applyTranslations() {
        // Traduire les éléments avec data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = I18n.t(key);
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = I18n.t(key);
        });
        
        // Mettre à jour le titre de l'app
        document.title = I18n.t('app_name');
    }
}
