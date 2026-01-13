/**
 * Experiments Data - Templates et labels
 */

export const EXPERIMENT_TEMPLATES = {
    phone_out_bedroom: {
        id: 'tpl_phone_out_bedroom',
        name: { fr: 'Téléphone hors de la chambre', en: 'Phone out of bedroom', ar: 'الهاتف خارج الغرفة' },
        description: {
            fr: 'Chaque soir, laisse ton téléphone hors de ta chambre à partir de 22h.',
            en: 'Every night, leave your phone outside your bedroom from 10pm.',
            ar: 'كل مساء، اترك هاتفك خارج غرفة نومك من الساعة ١٠.'
        },
        days: 7,
        rule: { type: 'phoneOutBedroom', value: true }
    },
    no_phone_bed: {
        id: 'tpl_no_phone_bed',
        name: { fr: 'Pas de téléphone au lit', en: 'No phone in bed', ar: 'لا هاتف في السرير' },
        description: {
            fr: 'Ne jamais utiliser ton téléphone au lit pendant 7 jours.',
            en: 'Never use your phone in bed for 7 days.',
            ar: 'لا تستخدم هاتفك في السرير لمدة ٧ أيام.'
        },
        days: 7,
        rule: { type: 'noPhoneBed', value: true }
    },
    walk_on_craving: {
        id: 'tpl_walk_on_craving',
        name: { fr: 'Marche 2 min au craving', en: 'Walk 2 min on craving', ar: 'امشِ دقيقتين عند الرغبة' },
        description: {
            fr: 'À chaque craving, sors marcher 2 minutes avant de faire quoi que ce soit.',
            en: 'At every craving, go for a 2-minute walk before doing anything.',
            ar: 'عند كل رغبة، اخرج وامشِ دقيقتين قبل فعل أي شيء.'
        },
        days: 7,
        rule: { type: 'walkOnCraving', value: true }
    },
    evening_ritual: {
        id: 'tpl_evening_ritual',
        name: { fr: 'Rituel du soir obligatoire', en: 'Mandatory evening ritual', ar: 'طقس المساء إلزامي' },
        description: {
            fr: 'Faire le rituel du soir tous les jours pendant 7 jours.',
            en: 'Complete the evening ritual every day for 7 days.',
            ar: 'أكمل طقس المساء كل يوم لمدة ٧ أيام.'
        },
        days: 7,
        rule: { type: 'eveningRitual', value: true }
    },
    cold_shower: {
        id: 'tpl_cold_shower',
        name: { fr: 'Douche froide quotidienne', en: 'Daily cold shower', ar: 'دش بارد يومي' },
        description: {
            fr: 'Terminer chaque douche par 30 secondes d\'eau froide.',
            en: 'End each shower with 30 seconds of cold water.',
            ar: 'انهِ كل دش بـ ٣٠ ثانية من الماء البارد.'
        },
        days: 7,
        rule: { type: 'coldShower', value: true }
    }
};

export const LABELS = {
    fr: {
        title: '🧪 Expériences',
        subtitle: 'Teste des changements pendant 7 jours',
        active: 'Expérience en cours',
        day: 'Jour',
        of: 'sur',
        end: 'Terminer',
        noActive: 'Aucune expérience en cours',
        start: 'Démarrer une expérience',
        past: 'Expériences passées',
        noPast: 'Aucune expérience terminée',
        improvement: 'Amélioration cravings',
        baseline: 'Baseline',
        results: 'Résultats',
        days: 'jours',
        experimentStarted: 'Expérience démarrée !',
        experimentEnded: 'Expérience terminée !'
    },
    en: {
        title: '🧪 Experiments',
        subtitle: 'Test changes for 7 days',
        active: 'Active experiment',
        day: 'Day',
        of: 'of',
        end: 'End',
        noActive: 'No active experiment',
        start: 'Start an experiment',
        past: 'Past experiments',
        noPast: 'No completed experiments',
        improvement: 'Cravings improvement',
        baseline: 'Baseline',
        results: 'Results',
        days: 'days',
        experimentStarted: 'Experiment started!',
        experimentEnded: 'Experiment ended!'
    },
    ar: {
        title: '🧪 التجارب',
        subtitle: 'اختبر التغييرات لمدة ٧ أيام',
        active: 'تجربة نشطة',
        day: 'اليوم',
        of: 'من',
        end: 'إنهاء',
        noActive: 'لا توجد تجربة نشطة',
        start: 'ابدأ تجربة',
        past: 'التجارب السابقة',
        noPast: 'لا توجد تجارب مكتملة',
        improvement: 'تحسن الرغبات',
        baseline: 'الخط الأساسي',
        results: 'النتائج',
        days: 'أيام',
        experimentStarted: 'بدأت التجربة!',
        experimentEnded: 'انتهت التجربة!'
    }
};
