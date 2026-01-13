/**
 * AntiAlcohol Data - Données spécifiques à l'addiction à l'alcool
 */

export const TRIGGERS = {
    social: { fr: 'Événement social', en: 'Social event', ar: 'حدث اجتماعي' },
    stress: { fr: 'Stress', en: 'Stress', ar: 'إجهاد' },
    routine: { fr: 'Habitude (apéro)', en: 'Habit (happy hour)', ar: 'عادة (ساعة سعيدة)' },
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    emotions: { fr: 'Émotions difficiles', en: 'Difficult emotions', ar: 'مشاعر صعبة' },
    celebration: { fr: 'Célébration', en: 'Celebration', ar: 'احتفال' },
    peer_pressure: { fr: 'Pression des pairs', en: 'Peer pressure', ar: 'ضغط الأقران' },
    restaurant: { fr: 'Au restaurant', en: 'At restaurant', ar: 'في المطعم' },
    end_of_day: { fr: 'Fin de journée', en: 'End of day', ar: 'نهاية اليوم' },
    weekend: { fr: 'Week-end', en: 'Weekend', ar: 'عطلة نهاية الأسبوع' }
};

export const SLOPE_SIGNALS = {
    automatism: { fr: 'Automatisme (aller au bar)', en: 'Automatism (going to bar)', ar: 'تلقائية (الذهاب للبار)' },
    peer_pressure: { fr: 'Pression sociale', en: 'Social pressure', ar: 'ضغط اجتماعي' },
    just_one: { fr: 'Juste un verre', en: 'Just one drink', ar: 'كأس واحد فقط' },
    reward: { fr: 'Je le mérite', en: 'I deserve it', ar: 'أستحق ذلك' },
    checking_stock: { fr: 'Vérifier les stocks', en: 'Checking stock', ar: 'التحقق من المخزون' },
    planning_drink: { fr: 'Planifier l\'apéro', en: 'Planning drinks', ar: 'التخطيط للشرب' }
};

export const ENVIRONMENT_RULES = {
    no_alcohol_home: { fr: 'Pas d\'alcool à la maison', en: 'No alcohol at home', ar: 'لا كحول في المنزل' },
    avoid_bars: { fr: 'Éviter les bars', en: 'Avoid bars', ar: 'تجنب البارات' },
    tell_friends: { fr: 'Amis informés', en: 'Friends informed', ar: 'الأصدقاء على علم' },
    alternative_drinks: { fr: 'Boissons alternatives prêtes', en: 'Alternative drinks ready', ar: 'مشروبات بديلة جاهزة' },
    no_drink_stress: { fr: 'Pas de verre si stressé', en: 'No drink when stressed', ar: 'لا شرب عند التوتر' }
};

export const CONTEXTUAL_TIPS = {
    fr: [
        'Commande un mocktail ou une eau gazeuse.',
        'Tu peux dire non sans te justifier.',
        'Rappelle-toi pourquoi tu as commencé.',
        'Pense à comment tu te sentiras demain.',
        'Propose une autre activité.',
        'Appelle quelqu\'un de confiance.',
        'L\'envie passe. Attends 10 minutes.',
        'Ton foie te remercie !'
    ],
    en: [
        'Order a mocktail or sparkling water.',
        'You can say no without explaining.',
        'Remember why you started.',
        'Think about how you\'ll feel tomorrow.',
        'Suggest another activity.',
        'Call someone you trust.',
        'The craving will pass. Wait 10 minutes.',
        'Your liver thanks you!'
    ],
    ar: [
        'اطلب موكتيل أو ماء غازي.',
        'يمكنك قول لا دون تبرير.',
        'تذكر لماذا بدأت.',
        'فكر كيف ستشعر غداً.',
        'اقترح نشاطاً آخر.',
        'اتصل بشخص تثق به.',
        'الرغبة ستمر. انتظر 10 دقائق.',
        'كبدك يشكرك!'
    ]
};

export const SLOPE_STEPS = {
    leave: { 
        fr: '🚪 Quitter la situation', 
        en: '🚪 Leave the situation', 
        ar: '🚪 غادر الموقف', 
        desc: { 
            fr: 'Éloigne-toi du bar ou de la table.', 
            en: 'Move away from the bar or table.', 
            ar: 'ابتعد عن البار أو الطاولة.' 
        } 
    },
    alternative: { 
        fr: '🥤 Commander autre chose', 
        en: '🥤 Order something else', 
        ar: '🥤 اطلب شيئاً آخر', 
        desc: { 
            fr: 'Eau, soda, mocktail, café...', 
            en: 'Water, soda, mocktail, coffee...', 
            ar: 'ماء، صودا، موكتيل، قهوة...' 
        } 
    },
    call: { 
        fr: '📱 Appeler quelqu\'un', 
        en: '📱 Call someone', 
        ar: '📱 اتصل بشخص ما', 
        desc: { 
            fr: 'Parle à un ami sobre ou un proche.', 
            en: 'Talk to a sober friend or loved one.', 
            ar: 'تحدث مع صديق صاحٍ أو قريب.' 
        } 
    }
};

export const UI_LABELS = {
    fr: {
        title: 'Envie de boire',
        subtitle: 'Tu as reconnu l\'envie. C\'est déjà une victoire.',
        signalsTitle: 'Qu\'est-ce qui a déclenché ?',
        stepsTitle: 'Étapes pour résister',
        stoppedCount: 'envies résistées',
        confirmButton: '✓ J\'ai résisté',
        configTitle: 'Configuration Anti-Alcool'
    },
    en: {
        title: 'Craving to drink',
        subtitle: 'You recognized the craving. That\'s already a victory.',
        signalsTitle: 'What triggered it?',
        stepsTitle: 'Steps to resist',
        stoppedCount: 'cravings resisted',
        confirmButton: '✓ I resisted',
        configTitle: 'Anti-Alcohol Configuration'
    },
    ar: {
        title: 'رغبة في الشرب',
        subtitle: 'لقد تعرفت على الرغبة. هذا بحد ذاته انتصار.',
        signalsTitle: 'ما الذي أثارها؟',
        stepsTitle: 'خطوات للمقاومة',
        stoppedCount: 'رغبات تم مقاومتها',
        confirmButton: '✓ قاومت',
        configTitle: 'إعدادات مكافحة الكحول'
    }
};
