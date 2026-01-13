/**
 * Spiritual Data - Constantes et labels
 */

export const PLAYLIST_CONTEXTS = {
    morning: { fr: 'Matin', en: 'Morning', ar: 'صباح', emoji: '🌅' },
    evening: { fr: 'Soir', en: 'Evening', ar: 'مساء', emoji: '🌙' },
    crisis: { fr: 'Moment difficile', en: 'Difficult moment', ar: 'لحظة صعبة', emoji: '🆘' },
    afterRelapse: { fr: 'Après rechute', en: 'After relapse', ar: 'بعد الانتكاسة', emoji: '🌱' }
};

export const PRESET_GOALS = {
    fr: ['Lire 10 pages de texte sacré', 'Prier/méditer 10 minutes', 'Écouter un rappel spirituel', 'Faire un acte de charité', 'Pratiquer la gratitude', 'Se lever pour la prière de l\'aube'],
    en: ['Read 10 pages of sacred text', 'Pray/meditate 10 minutes', 'Listen to a spiritual reminder', 'Do an act of charity', 'Practice gratitude', 'Wake up for dawn prayer'],
    ar: ['قراءة 10 صفحات من القرآن', 'صلاة/تأمل 10 دقائق', 'الاستماع لتذكير روحي', 'عمل صدقة', 'ممارسة الامتنان', 'الاستيقاظ لصلاة الفجر']
};

export const THEME_FILTERS = {
    morning: ['discipline', 'intention', 'gratitude'],
    evening: ['gratitude', 'reflection', 'peace'],
    crisis: ['lower_gaze', 'avoid_paths', 'patience', 'struggle'],
    afterRelapse: ['mercy', 'repentance', 'hope', 'forgiveness']
};

export const LABELS = {
    fr: {
        title: '📿 Espace spirituel', dhikr: 'Compteur dhikr', goals: 'Objectifs du jour', playlists: 'Cartes spirituelles',
        reset: 'Réinitialiser', addGoal: 'Ajouter un objectif', complete: 'Marquer comme fait', noGoals: 'Aucun objectif pour aujourd\'hui',
        next: 'Autre carte', back: 'Retour', noCards: 'Aucune carte disponible', spiritual: 'Spirituel'
    },
    en: {
        title: '📿 Spiritual space', dhikr: 'Dhikr counter', goals: 'Today\'s goals', playlists: 'Spiritual cards',
        reset: 'Reset', addGoal: 'Add a goal', complete: 'Mark as done', noGoals: 'No goals for today',
        next: 'Another card', back: 'Back', noCards: 'No cards available', spiritual: 'Spiritual'
    },
    ar: {
        title: '📿 المساحة الروحية', dhikr: 'عداد الذكر', goals: 'أهداف اليوم', playlists: 'البطاقات الروحية',
        reset: 'إعادة تعيين', addGoal: 'إضافة هدف', complete: 'وضع علامة مكتمل', noGoals: 'لا أهداف لليوم',
        next: 'بطاقة أخرى', back: 'رجوع', noCards: 'لا توجد بطاقات', spiritual: 'روحي'
    }
};
