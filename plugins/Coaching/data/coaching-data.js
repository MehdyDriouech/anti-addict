/**
 * Coaching Data - Constantes et labels
 */

export const CORRELATION_THRESHOLDS = {
    stress: 7, craving: 6, minSamples: 3
};

export const DAY_PERIODS = {
    morning: { start: 6, end: 12, fr: 'Matin', en: 'Morning', ar: 'صباح' },
    afternoon: { start: 12, end: 18, fr: 'Après-midi', en: 'Afternoon', ar: 'بعد الظهر' },
    evening: { start: 18, end: 22, fr: 'Soir', en: 'Evening', ar: 'مساء' },
    night: { start: 22, end: 6, fr: 'Nuit', en: 'Night', ar: 'ليل' }
};

export const RULE_SUGGESTIONS = {
    alone: { ifCondition: { fr: 'Si je suis seul', en: 'If I\'m alone', ar: 'إذا كنت وحدي' }, thenAction: { fr: 'Appeler quelqu\'un', en: 'Call someone', ar: 'اتصل بشخص ما' } },
    night: { ifCondition: { fr: 'Si c\'est la nuit', en: 'If it\'s night', ar: 'إذا كان الليل' }, thenAction: { fr: 'Téléphone dans le salon', en: 'Phone in living room', ar: 'الهاتف في الصالة' } },
    boredom: { ifCondition: { fr: 'Si je m\'ennuie', en: 'If I\'m bored', ar: 'إذا شعرت بالملل' }, thenAction: { fr: 'Sortir marcher 5 min', en: 'Walk 5 min', ar: 'امش 5 دقائق' } },
    stress: { ifCondition: { fr: 'Si je suis stressé', en: 'If I\'m stressed', ar: 'إذا كنت متوترا' }, thenAction: { fr: 'Respiration 4-4-6', en: 'Breathing 4-4-6', ar: 'تنفس 4-4-6' } },
    fatigue: { ifCondition: { fr: 'Si je suis fatigué', en: 'If I\'m tired', ar: 'إذا كنت متعبا' }, thenAction: { fr: 'Douche froide ou dormir', en: 'Cold shower or sleep', ar: 'دش بارد أو نوم' } }
};

export const LABELS = {
    fr: {
        title: '📊 Insights de la semaine', summary: 'Résumé', cravings: 'cravings', episodes: 'épisodes', wins: 'victoires', slopes: 'pentes',
        triggers: 'Top déclencheurs', hours: 'Heures à risque', correlations: 'Patterns détectés', suggestions: 'Règles suggérées',
        addRule: 'Ajouter cette règle', noData: 'Pas assez de données cette semaine', ruleAdded: 'Règle ajoutée !',
        stressCorrelation: 'Stress élevé = {x}x plus de cravings', solitudeCorrelation: 'Solitude = {x}x plus de cravings',
        phoneCorrelation: 'Téléphone au lit = {x}x plus d\'événements nocturnes', new: 'Nouveaux insights', view: 'Voir'
    },
    en: {
        title: '📊 Weekly insights', summary: 'Summary', cravings: 'cravings', episodes: 'episodes', wins: 'wins', slopes: 'slopes',
        triggers: 'Top triggers', hours: 'Risk hours', correlations: 'Detected patterns', suggestions: 'Suggested rules',
        addRule: 'Add this rule', noData: 'Not enough data this week', ruleAdded: 'Rule added!',
        stressCorrelation: 'High stress = {x}x more cravings', solitudeCorrelation: 'Loneliness = {x}x more cravings',
        phoneCorrelation: 'Phone in bed = {x}x more night events', new: 'New insights', view: 'View'
    },
    ar: {
        title: '📊 رؤى الأسبوع', summary: 'ملخص', cravings: 'رغبات', episodes: 'حوادث', wins: 'انتصارات', slopes: 'منحدرات',
        triggers: 'أعلى المحفزات', hours: 'ساعات الخطر', correlations: 'الأنماط المكتشفة', suggestions: 'قواعد مقترحة',
        addRule: 'إضافة هذه القاعدة', noData: 'بيانات غير كافية هذا الأسبوع', ruleAdded: 'تمت إضافة القاعدة!',
        stressCorrelation: 'ضغط عالي = {x} ضعف الرغبات', solitudeCorrelation: 'وحدة = {x} ضعف الرغبات',
        phoneCorrelation: 'هاتف في السرير = {x} ضعف أحداث الليل', new: 'رؤى جديدة', view: 'عرض'
    }
};
