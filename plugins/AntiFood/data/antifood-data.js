/**
 * AntiFood Data - Données spécifiques à l'addiction alimentaire compulsive
 */

export const TRIGGERS = {
    stress: { fr: 'Stress', en: 'Stress', ar: 'إجهاد' },
    emotions: { fr: 'Émotions difficiles', en: 'Difficult emotions', ar: 'مشاعر صعبة' },
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    fatigue: { fr: 'Fatigue', en: 'Fatigue', ar: 'تعب' },
    reward: { fr: 'Récompense', en: 'Reward', ar: 'مكافأة' },
    social: { fr: 'Contexte social', en: 'Social context', ar: 'سياق اجتماعي' },
    night: { fr: 'Nuit', en: 'Night', ar: 'ليل' },
    tv: { fr: 'Devant la TV', en: 'In front of TV', ar: 'أمام التلفاز' },
    sadness: { fr: 'Tristesse', en: 'Sadness', ar: 'حزن' },
    anxiety: { fr: 'Anxiété', en: 'Anxiety', ar: 'قلق' }
};

export const SLOPE_SIGNALS = {
    automatic: { fr: 'Grignotage automatique', en: 'Automatic snacking', ar: 'أكل تلقائي' },
    no_hunger: { fr: 'Manger sans faim', en: 'Eating without hunger', ar: 'أكل بدون جوع' },
    compensation: { fr: 'Manger pour compenser', en: 'Eating to compensate', ar: 'أكل للتعويض' },
    hiding: { fr: 'Manger en cachette', en: 'Eating in secret', ar: 'أكل في السر' },
    craving_sugar: { fr: 'Envie de sucre', en: 'Sugar craving', ar: 'رغبة في السكر' },
    guilt: { fr: 'Culpabilité après', en: 'Guilt afterwards', ar: 'شعور بالذنب بعدها' }
};

export const ENVIRONMENT_RULES = {
    no_stock_junk: { fr: 'Pas de stock de junk food', en: 'No junk food stock', ar: 'لا مخزون وجبات سريعة' },
    eat_at_table: { fr: 'Manger à table seulement', en: 'Eat at table only', ar: 'الأكل على الطاولة فقط' },
    no_screens: { fr: 'Pas d\'écrans en mangeant', en: 'No screens while eating', ar: 'لا شاشات أثناء الأكل' },
    meal_planning: { fr: 'Repas planifiés', en: 'Meals planned', ar: 'وجبات مخططة' },
    water_first: { fr: 'Boire de l\'eau d\'abord', en: 'Drink water first', ar: 'اشرب ماء أولاً' }
};

export const CONTEXTUAL_TIPS = {
    fr: [
        'Bois un grand verre d\'eau et attends 10 minutes.',
        'Est-ce vraiment de la faim ou une émotion ?',
        'Fais autre chose avec tes mains.',
        'Sors de la cuisine.',
        'Appelle quelqu\'un pour parler.',
        'Fais une courte marche.',
        'La sensation passera. Tu es plus fort.',
        'Écris ce que tu ressens vraiment.'
    ],
    en: [
        'Drink a big glass of water and wait 10 minutes.',
        'Is it really hunger or an emotion?',
        'Do something else with your hands.',
        'Leave the kitchen.',
        'Call someone to talk.',
        'Take a short walk.',
        'The feeling will pass. You\'re stronger.',
        'Write down what you really feel.'
    ],
    ar: [
        'اشرب كوباً كبيراً من الماء وانتظر 10 دقائق.',
        'هل هذا جوع حقيقي أم عاطفة؟',
        'افعل شيئاً آخر بيديك.',
        'اخرج من المطبخ.',
        'اتصل بشخص للتحدث.',
        'امشِ قليلاً.',
        'الشعور سيمر. أنت أقوى.',
        'اكتب ما تشعر به حقاً.'
    ]
};

export const SLOPE_STEPS = {
    water: { 
        fr: '💧 Boire de l\'eau', 
        en: '💧 Drink water', 
        ar: '💧 اشرب ماء', 
        desc: { fr: 'Un grand verre d\'eau. Attends 10 minutes.', en: 'A big glass of water. Wait 10 minutes.', ar: 'كوب كبير من الماء. انتظر 10 دقائق.' } 
    },
    leave_kitchen: { 
        fr: '🚪 Quitter la cuisine', 
        en: '🚪 Leave the kitchen', 
        ar: '🚪 غادر المطبخ', 
        desc: { fr: 'Change de pièce maintenant.', en: 'Change rooms now.', ar: 'غير الغرفة الآن.' } 
    },
    activity: { 
        fr: '🎯 Autre activité', 
        en: '🎯 Other activity', 
        ar: '🎯 نشاط آخر', 
        desc: { fr: 'Marche, appel, lecture, écriture...', en: 'Walk, call, read, write...', ar: 'امشِ، اتصل، اقرأ، اكتب...' } 
    }
};

export const UI_LABELS = {
    fr: {
        title: 'Envie de grignoter',
        subtitle: 'Tu as reconnu l\'envie. C\'est déjà une victoire.',
        signalsTitle: 'Qu\'est-ce qui a déclenché ?',
        stepsTitle: 'Étapes pour résister',
        stoppedCount: 'envies résistées',
        confirmButton: '✓ J\'ai résisté',
        configTitle: 'Configuration Anti-Grignotage'
    },
    en: {
        title: 'Craving to snack',
        subtitle: 'You recognized the urge. That\'s already a victory.',
        signalsTitle: 'What triggered it?',
        stepsTitle: 'Steps to resist',
        stoppedCount: 'cravings resisted',
        confirmButton: '✓ I resisted',
        configTitle: 'Anti-Snacking Configuration'
    },
    ar: {
        title: 'رغبة في الأكل',
        subtitle: 'لقد تعرفت على الرغبة. هذا بحد ذاته انتصار.',
        signalsTitle: 'ما الذي أثارها؟',
        stepsTitle: 'خطوات للمقاومة',
        stoppedCount: 'رغبات تم مقاومتها',
        confirmButton: '✓ قاومت',
        configTitle: 'إعدادات مكافحة الأكل العاطفي'
    }
};
