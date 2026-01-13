/**
 * Heatmap Data - Constantes et configuration
 */

export const BUCKETS = ['morning', 'noon', 'afternoon', 'evening', 'night', 'late'];

export const BUCKET_LABELS = {
    morning: { fr: '5h-9h', en: '5-9am', ar: '٥-٩ص' },
    noon: { fr: '9h-12h', en: '9-12pm', ar: '٩-١٢' },
    afternoon: { fr: '12h-17h', en: '12-5pm', ar: '١٢-٥م' },
    evening: { fr: '17h-21h', en: '5-9pm', ar: '٥-٩م' },
    night: { fr: '21h-0h', en: '9pm-12', ar: '٩م-١٢' },
    late: { fr: '0h-5h', en: '12-5am', ar: '١٢-٥ص' }
};

export const HEATMAP_FILTERS = {
    all: { fr: 'Tous', en: 'All', ar: 'الكل' },
    high_stress: { fr: 'Stress élevé', en: 'High stress', ar: 'ضغط عالي' },
    night_only: { fr: 'Soir/Nuit', en: 'Evening/Night', ar: 'مساء/ليل' },
    weekends: { fr: 'Week-ends', en: 'Weekends', ar: 'نهاية الأسبوع' }
};

export const LABELS = {
    fr: {
        title: '🗓️ Heatmap des risques',
        subtitle: 'Identifie tes moments à risque',
        legend: 'Légende',
        low: 'Faible',
        med: 'Moyen',
        high: 'Élevé',
        noData: 'Pas de données',
        days7: '7 jours',
        days14: '14 jours',
        days30: '30 jours',
        filters: 'Filtres',
        insights: 'Insights',
        miniTitle: 'Moments à risque',
        view: 'Voir détails',
        highRisk: 'Risque élevé',
        cravings: 'Cravings',
        slopes: 'Pentes',
        episodes: 'Épisodes'
    },
    en: {
        title: '🗓️ Risk heatmap',
        subtitle: 'Identify your risk moments',
        legend: 'Legend',
        low: 'Low',
        med: 'Medium',
        high: 'High',
        noData: 'No data',
        days7: '7 days',
        days14: '14 days',
        days30: '30 days',
        filters: 'Filters',
        insights: 'Insights',
        miniTitle: 'Risk moments',
        view: 'View details',
        highRisk: 'High risk',
        cravings: 'Cravings',
        slopes: 'Slopes',
        episodes: 'Episodes'
    },
    ar: {
        title: '🗓️ خريطة المخاطر',
        subtitle: 'حدد لحظات الخطر',
        legend: 'مفتاح',
        low: 'منخفض',
        med: 'متوسط',
        high: 'مرتفع',
        noData: 'لا بيانات',
        days7: '٧ أيام',
        days14: '١٤ يوم',
        days30: '٣٠ يوم',
        filters: 'مرشحات',
        insights: 'رؤى',
        miniTitle: 'لحظات الخطر',
        view: 'عرض التفاصيل',
        highRisk: 'خطر مرتفع',
        cravings: 'رغبات',
        slopes: 'منحدرات',
        episodes: 'حوادث'
    }
};

export const INSIGHT_TEXTS = {
    riskiestSlot: {
        fr: (label) => `Créneau le plus à risque: ${label}`,
        en: (label) => `Highest risk time: ${label}`,
        ar: (label) => `الوقت الأكثر خطورة: ${label}`
    },
    weekendsRiskier: {
        fr: 'Week-ends plus risqués que la semaine',
        en: 'Weekends riskier than weekdays',
        ar: 'نهايات الأسبوع أكثر خطورة من أيام الأسبوع'
    },
    eveningNightRisk: {
        fr: 'La majorité des risques sont le soir/nuit',
        en: 'Most risks are in evening/night',
        ar: 'معظم المخاطر في المساء/الليل'
    },
    stressCorrelation: {
        fr: 'Stress élevé = plus de risques',
        en: 'High stress = more risks',
        ar: 'ضغط عالي = مخاطر أكثر'
    }
};
