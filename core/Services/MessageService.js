/**
 * MessageService.js - Service centralisé pour les messages multilingues
 * 
 * Centralise tous les messages de l'application pour éviter la duplication
 * et faciliter la maintenance.
 */

export class MessageService {
    constructor(i18nService = null) {
        this.i18n = i18nService;
    }

    /**
     * Récupère un message PIN selon l'action et le type
     * @param {string} lang - Langue (fr, en, ar)
     * @param {string} action - Action (set, change, disable)
     * @param {string} type - Type (success, error, mismatch)
     * @returns {string} Message traduit
     */
    getPinMessage(lang, action, type) {
        const messages = {
            set: {
                success: {
                    fr: 'Code PIN défini avec succès',
                    en: 'PIN code set successfully',
                    ar: 'تم تعيين رمز PIN بنجاح'
                },
                error: {
                    fr: 'Erreur lors de la définition du PIN',
                    en: 'Error setting PIN',
                    ar: 'خطأ في تعيين رمز PIN'
                }
            },
            change: {
                success: {
                    fr: 'Code PIN modifié avec succès',
                    en: 'PIN code changed successfully',
                    ar: 'تم تغيير رمز PIN بنجاح'
                },
                error: {
                    fr: 'Ancien code PIN incorrect',
                    en: 'Wrong old PIN code',
                    ar: 'رمز PIN القديم غير صحيح'
                }
            },
            disable: {
                success: {
                    fr: 'Verrouillage désactivé',
                    en: 'Lock disabled',
                    ar: 'تم تعطيل القفل'
                },
                error: {
                    fr: 'Code PIN incorrect',
                    en: 'Wrong PIN code',
                    ar: 'رمز PIN غير صحيح'
                }
            },
            mismatch: {
                fr: 'Les codes PIN ne correspondent pas',
                en: 'PIN codes do not match',
                ar: 'رموز PIN غير متطابقة'
            },
            mismatchNew: {
                fr: 'Les nouveaux codes PIN ne correspondent pas',
                en: 'New PIN codes do not match',
                ar: 'رموز PIN الجديدة غير متطابقة'
            }
        };

        if (type === 'mismatch' || type === 'mismatchNew') {
            return messages[type][lang] || messages[type].fr;
        }

        return messages[action]?.[type]?.[lang] || messages[action]?.[type]?.fr || '';
    }

    /**
     * Récupère un message de toast
     * @param {string} lang - Langue
     * @param {string} key - Clé du message
     * @param {Object} params - Paramètres optionnels
     * @returns {string} Message traduit
     */
    getToastMessage(lang, key, params = {}) {
        const messages = {
            addictionEnabled: {
                fr: 'Addiction activée',
                en: 'Addiction enabled',
                ar: 'تم تفعيل الإدمان'
            },
            addictionDisabled: {
                fr: 'Addiction désactivée',
                en: 'Addiction disabled',
                ar: 'تم تعطيل الإدمان'
            },
            autoLockEnabled: {
                fr: 'Verrouillage automatique activé',
                en: 'Auto-lock enabled',
                ar: 'تم تفعيل القفل التلقائي'
            },
            autoLockDisabled: {
                fr: 'Verrouillage automatique désactivé',
                en: 'Auto-lock disabled',
                ar: 'تم تعطيل القفل التلقائي'
            },
            autoLockTabBlurEnabled: {
                fr: 'Verrouillage au changement d\'onglet activé',
                en: 'Lock on tab change enabled',
                ar: 'تم تفعيل القفل عند تغيير علامة التبويب'
            },
            autoLockTabBlurDisabled: {
                fr: 'Verrouillage au changement d\'onglet désactivé',
                en: 'Lock on tab change disabled',
                ar: 'تم تعطيل القفل عند تغيير علامة التبويب'
            },
            autoLockPinRequired: {
                fr: 'Active d\'abord le verrouillage PIN dans les réglages',
                en: 'Enable PIN lock in settings first',
                ar: 'قم بتفعيل قفل PIN في الإعدادات أولاً'
            },
            coachingModeChanged: {
                fr: 'Mode de coaching modifié',
                en: 'Coaching mode changed',
                ar: 'تم تغيير وضع التدريب'
            },
            delayUpdated: {
                fr: 'Délai mis à jour',
                en: 'Delay updated',
                ar: 'تم تحديث التأخير'
            },
            routineSaved: {
                fr: 'Routine enregistrée !',
                en: 'Routine saved!',
                ar: 'تم حفظ الروتين!'
            },
            configurationSaved: {
                fr: 'Configuration enregistrée',
                en: 'Configuration saved',
                ar: 'تم حفظ الإعدادات'
            },
            phoneBedSuccess: {
                fr: 'Bravo ! 🎉',
                en: 'Well done! 🎉',
                ar: 'أحسنت! 🎉'
            },
            slopeStopped: {
                fr: (count) => `Bravo ! ${count} pentes stoppées au total.`,
                en: (count) => `Well done! ${count} slopes stopped in total.`,
                ar: (count) => `أحسنت! ${count} منحدرات متوقفة في المجموع.`
            }
        };

        const message = messages[key];
        if (!message) {
            return '';
        }

        // Si c'est une fonction, l'appeler avec les paramètres
        if (typeof message === 'function') {
            return message(params.count || 0);
        }

        return message[lang] || message.fr || '';
    }

    /**
     * Récupère un message via I18n si disponible, sinon utilise les messages par défaut
     * @param {string} key - Clé I18n
     * @param {string} lang - Langue
     * @param {string} fallback - Message de fallback
     * @returns {string} Message traduit
     */
    getI18nMessage(key, lang, fallback = '') {
        if (this.i18n && typeof this.i18n.t === 'function') {
            const translated = this.i18n.t(key);
            // Si la traduction retourne la clé, utiliser le fallback
            if (translated && translated !== key) {
                return translated;
            }
        }
        return fallback;
    }
}

// Instance singleton par défaut
const instance = new MessageService();
export default instance;
