/**
 * AntiGaming Data - Données spécifiques à l'addiction aux jeux vidéo
 */

export const TRIGGERS = {
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    stress: { fr: 'Stress', en: 'Stress', ar: 'إجهاد' },
    escape: { fr: 'Besoin d\'évasion', en: 'Need to escape', ar: 'الحاجة للهروب' },
    frustration: { fr: 'Frustration', en: 'Frustration', ar: 'إحباط' },
    friends_online: { fr: 'Amis en ligne', en: 'Friends online', ar: 'أصدقاء متصلون' },
    new_content: { fr: 'Nouveau contenu/event', en: 'New content/event', ar: 'محتوى/حدث جديد' },
    evening: { fr: 'Fin de journée', en: 'End of day', ar: 'نهاية اليوم' },
    weekend: { fr: 'Week-end', en: 'Weekend', ar: 'عطلة نهاية الأسبوع' },
    loneliness: { fr: 'Solitude', en: 'Loneliness', ar: 'وحدة' },
    procrastination: { fr: 'Procrastination', en: 'Procrastination', ar: 'تسويف' }
};

export const SLOPE_SIGNALS = {
    one_more: { fr: '"Encore une partie"', en: '"One more game"', ar: '"لعبة أخرى"' },
    anger_loss: { fr: 'Colère après défaite', en: 'Anger after loss', ar: 'غضب بعد الخسارة' },
    time_lost: { fr: 'Perte de temps', en: 'Losing track of time', ar: 'ضياع الوقت' },
    skip_meal: { fr: 'Sauter un repas', en: 'Skipping a meal', ar: 'تخطي وجبة' },
    neglect: { fr: 'Négliger autres activités', en: 'Neglecting activities', ar: 'إهمال النشاطات' },
    late_night: { fr: 'Jouer tard la nuit', en: 'Playing late at night', ar: 'اللعب متأخراً' }
};

export const ENVIRONMENT_RULES = {
    time_limit: { fr: 'Limite de temps quotidienne', en: 'Daily time limit', ar: 'حد زمني يومي' },
    no_gaming_bedroom: { fr: 'Pas de jeux dans la chambre', en: 'No gaming in bedroom', ar: 'لا ألعاب في غرفة النوم' },
    schedule: { fr: 'Horaires de jeu définis', en: 'Set gaming schedule', ar: 'جدول لعب محدد' },
    real_hobbies: { fr: 'Hobbies réels planifiés', en: 'Real hobbies planned', ar: 'هوايات حقيقية مخططة' },
    parental_control: { fr: 'Contrôle parental activé', en: 'Parental control on', ar: 'رقابة أبوية مفعلة' }
};

export const CONTEXTUAL_TIPS = {
    fr: [
        'Pose la manette et fais autre chose pendant 15 minutes.',
        'Ton corps a besoin de bouger. Lève-toi !',
        'As-tu mangé ? Bu de l\'eau ?',
        'Les vraies connexions valent plus que les virtuelles.',
        'Le jeu sera toujours là. Tes responsabilités aussi.',
        'Une pause maintenant = plus de plaisir après.',
        'Qu\'aurais-tu accompli dans la vraie vie ?',
        'Tes yeux et ton dos te remercieront.'
    ],
    en: [
        'Put down the controller and do something else for 15 minutes.',
        'Your body needs to move. Stand up!',
        'Have you eaten? Drunk water?',
        'Real connections are worth more than virtual ones.',
        'The game will still be there. So will your responsibilities.',
        'A break now = more enjoyment later.',
        'What would you have accomplished in real life?',
        'Your eyes and back will thank you.'
    ],
    ar: [
        'ضع وحدة التحكم وافعل شيئاً آخر لمدة 15 دقيقة.',
        'جسمك يحتاج للحركة. قف!',
        'هل أكلت؟ شربت ماء؟',
        'العلاقات الحقيقية أثمن من الافتراضية.',
        'اللعبة ستظل موجودة. ومسؤولياتك أيضاً.',
        'استراحة الآن = متعة أكثر لاحقاً.',
        'ماذا كنت ستنجز في الحياة الحقيقية؟',
        'عيناك وظهرك سيشكرانك.'
    ]
};

export const SLOPE_STEPS = {
    save_quit: { 
        fr: '💾 Sauvegarder et quitter', 
        en: '💾 Save and quit', 
        ar: '💾 احفظ واخرج', 
        desc: { fr: 'Sauvegarde ta partie et ferme le jeu.', en: 'Save your game and close it.', ar: 'احفظ لعبتك وأغلقها.' } 
    },
    move: { 
        fr: '🏃 Bouger le corps', 
        en: '🏃 Move your body', 
        ar: '🏃 حرك جسمك', 
        desc: { fr: 'Étirements, marche, pompes...', en: 'Stretches, walk, push-ups...', ar: 'تمدد، امشِ، تمارين ضغط...' } 
    },
    real_activity: { 
        fr: '🎯 Activité réelle', 
        en: '🎯 Real activity', 
        ar: '🎯 نشاط حقيقي', 
        desc: { fr: 'Fais quelque chose dans le monde réel.', en: 'Do something in the real world.', ar: 'افعل شيئاً في العالم الحقيقي.' } 
    }
};

export const UI_LABELS = {
    fr: {
        title: 'Envie de jouer',
        subtitle: 'Tu as reconnu l\'envie. C\'est un premier pas.',
        signalsTitle: 'Qu\'est-ce qui a déclenché ?',
        stepsTitle: 'Étapes pour décrocher',
        stoppedCount: 'sessions contrôlées',
        confirmButton: '✓ J\'ai décroché',
        configTitle: 'Configuration Anti-Gaming'
    },
    en: {
        title: 'Urge to play',
        subtitle: 'You recognized the urge. That\'s a first step.',
        signalsTitle: 'What triggered it?',
        stepsTitle: 'Steps to disconnect',
        stoppedCount: 'controlled sessions',
        confirmButton: '✓ I disconnected',
        configTitle: 'Anti-Gaming Configuration'
    },
    ar: {
        title: 'رغبة في اللعب',
        subtitle: 'لقد تعرفت على الرغبة. هذه خطوة أولى.',
        signalsTitle: 'ما الذي أثارها؟',
        stepsTitle: 'خطوات للانفصال',
        stoppedCount: 'جلسات متحكم بها',
        confirmButton: '✓ انفصلت',
        configTitle: 'إعدادات مكافحة الألعاب'
    }
};
