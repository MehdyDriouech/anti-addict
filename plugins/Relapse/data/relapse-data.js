/**
 * Relapse Data - Constantes et labels
 */

export const TRIGGER_TAGS = {
    alone: { fr: 'Seul', en: 'Alone', ar: 'وحيد' },
    night: { fr: 'La nuit', en: 'At night', ar: 'في الليل' },
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    stress: { fr: 'Stress', en: 'Stress', ar: 'إجهاد' },
    social_scroll: { fr: 'Scroll réseaux', en: 'Social scrolling', ar: 'تصفح الشبكات' },
    sadness: { fr: 'Tristesse', en: 'Sadness', ar: 'حزن' },
    phone_bed: { fr: 'Téléphone au lit', en: 'Phone in bed', ar: 'الهاتف في السرير' },
    exposure: { fr: 'Exposition accidentelle', en: 'Accidental exposure', ar: 'تعرض عرضي' },
    fatigue: { fr: 'Fatigue', en: 'Fatigue', ar: 'تعب' },
    other: { fr: 'Autre', en: 'Other', ar: 'آخر' }
};

export const CHANGE_SUGGESTIONS = {
    fr: [
        'Téléphone hors de la chambre ce soir',
        'Pas de téléphone au lit',
        'Marcher 2 min au premier craving',
        'Appeler quelqu\'un si seul le soir',
        'Définir une heure de coucher',
        'Bloquer les applications déclencheurs',
        'Préparer une activité de remplacement'
    ],
    en: [
        'Phone out of bedroom tonight',
        'No phone in bed',
        'Walk 2 min at first craving',
        'Call someone if alone at night',
        'Set a bedtime',
        'Block trigger apps',
        'Prepare a replacement activity'
    ],
    ar: [
        'الهاتف خارج الغرفة الليلة',
        'لا هاتف في السرير',
        'المشي دقيقتين عند أول رغبة',
        'الاتصال بشخص إذا كنت وحيدًا',
        'تحديد وقت للنوم',
        'حظر التطبيقات المحفزة',
        'إعداد نشاط بديل'
    ]
};

export const LABELS = {
    fr: {
        step1Title: 'On repart maintenant',
        step1Message: 'Tu as fait une erreur, mais tu es ici. C\'est ce qui compte.',
        step1Message2: 'Répondons ensemble à 3 questions rapides pour apprendre de ce moment.',
        continue: 'Continuer',
        when: 'Quand était-ce ?',
        now: 'Maintenant',
        today: 'Plus tôt aujourd\'hui',
        trigger: 'Quel était le déclencheur principal ?',
        next: 'Suivant',
        change: 'Quel petit changement pour demain ?',
        placeholder: 'Ou écris le tien...',
        finish: 'Terminer',
        createRule: 'Créer une règle à partir de ça',
        recorded: 'Enregistré. Demain est un nouveau jour.',
        ruleCreated: 'Règle créée !'
    },
    en: {
        step1Title: 'Let\'s start again',
        step1Message: 'You made a mistake, but you\'re here. That\'s what matters.',
        step1Message2: 'Let\'s answer 3 quick questions to learn from this moment.',
        continue: 'Continue',
        when: 'When was it?',
        now: 'Now',
        today: 'Earlier today',
        trigger: 'What was the main trigger?',
        next: 'Next',
        change: 'What small change for tomorrow?',
        placeholder: 'Or write your own...',
        finish: 'Finish',
        createRule: 'Create a rule from this',
        recorded: 'Recorded. Tomorrow is a new day.',
        ruleCreated: 'Rule created!'
    },
    ar: {
        step1Title: 'لنبدأ من جديد',
        step1Message: 'لقد أخطأت، لكنك هنا. هذا ما يهم.',
        step1Message2: 'دعنا نجيب على 3 أسئلة سريعة للتعلم من هذه اللحظة.',
        continue: 'متابعة',
        when: 'متى حدث ذلك؟',
        now: 'الآن',
        today: 'في وقت سابق اليوم',
        trigger: 'ما كان السبب الرئيسي؟',
        next: 'التالي',
        change: 'ما التغيير الصغير لغد؟',
        placeholder: 'أو اكتب ما تريد...',
        finish: 'إنهاء',
        createRule: 'إنشاء قاعدة من هذا',
        recorded: 'تم التسجيل. غدًا يوم جديد.',
        ruleCreated: 'تم إنشاء القاعدة!'
    }
};

export const CONDITION_MAP = {
    alone: { alone: true },
    night: { timeRange: 'night' },
    phone_bed: { inBedWithPhone: true },
    stress: { stressAbove: 7 },
    exposure: { exposed: true },
    boredom: { triggerTag: 'boredom' },
    social_scroll: { triggerTag: 'social_scroll' }
};
