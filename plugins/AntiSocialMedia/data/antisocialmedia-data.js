/**
 * AntiSocialMedia Data - Données spécifiques à l'addiction aux réseaux sociaux
 */

export const TRIGGERS = {
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    procrastination: { fr: 'Procrastination', en: 'Procrastination', ar: 'تسويف' },
    fomo: { fr: 'Peur de rater (FOMO)', en: 'Fear of missing out', ar: 'الخوف من الفوات' },
    notification: { fr: 'Notification reçue', en: 'Notification received', ar: 'استلام إشعار' },
    waiting: { fr: 'Attente (file, transport)', en: 'Waiting (queue, transit)', ar: 'انتظار' },
    stress: { fr: 'Stress', en: 'Stress', ar: 'إجهاد' },
    waking_up: { fr: 'Au réveil', en: 'Upon waking', ar: 'عند الاستيقاظ' },
    before_sleep: { fr: 'Avant de dormir', en: 'Before sleep', ar: 'قبل النوم' },
    loneliness: { fr: 'Solitude', en: 'Loneliness', ar: 'وحدة' },
    validation: { fr: 'Besoin de validation', en: 'Need for validation', ar: 'الحاجة للتقدير' }
};

export const SLOPE_SIGNALS = {
    scroll_infini: { fr: 'Scroll sans fin', en: 'Endless scrolling', ar: 'تصفح لا نهائي' },
    comparaison: { fr: 'Me comparer aux autres', en: 'Comparing myself to others', ar: 'مقارنة نفسي بالآخرين' },
    refresh: { fr: 'Rafraîchir compulsivement', en: 'Compulsive refreshing', ar: 'تحديث قسري' },
    checking_likes: { fr: 'Vérifier les likes', en: 'Checking likes', ar: 'التحقق من الإعجابات' },
    lost_time: { fr: 'Perte de temps', en: 'Losing track of time', ar: 'ضياع الوقت' },
    anxiety: { fr: 'Anxiété après usage', en: 'Anxiety after use', ar: 'قلق بعد الاستخدام' }
};

export const ENVIRONMENT_RULES = {
    no_phone_bedroom: { fr: 'Pas de téléphone dans la chambre', en: 'No phone in bedroom', ar: 'لا هاتف في غرفة النوم' },
    app_limits: { fr: 'Limites de temps sur apps', en: 'Time limits on apps', ar: 'حدود وقت على التطبيقات' },
    notifications_off: { fr: 'Notifications désactivées', en: 'Notifications off', ar: 'الإشعارات معطلة' },
    grayscale: { fr: 'Écran en noir et blanc', en: 'Grayscale screen', ar: 'شاشة أبيض وأسود' },
    no_morning_check: { fr: 'Pas de check au réveil', en: 'No check upon waking', ar: 'لا تفقد عند الاستيقاظ' }
};

export const CONTEXTUAL_TIPS = {
    fr: [
        'Pose ton téléphone dans une autre pièce.',
        'Que ferais-tu si tu n\'avais pas de smartphone ?',
        'Les likes ne définissent pas ta valeur.',
        'Ce que tu vois est un highlight reel, pas la réalité.',
        'Fais une vraie pause : regarde par la fenêtre.',
        'Chaque minute hors écran est gagnée pour toi.',
        'Les autres aussi retouchent leurs photos.',
        'Et si tu appelais quelqu\'un au lieu de scroller ?'
    ],
    en: [
        'Put your phone in another room.',
        'What would you do without a smartphone?',
        'Likes don\'t define your worth.',
        'What you see is a highlight reel, not reality.',
        'Take a real break: look out the window.',
        'Every minute off screen is won for you.',
        'Others also edit their photos.',
        'What if you called someone instead of scrolling?'
    ],
    ar: [
        'ضع هاتفك في غرفة أخرى.',
        'ماذا ستفعل بدون هاتف ذكي؟',
        'الإعجابات لا تحدد قيمتك.',
        'ما تراه هو أفضل اللحظات، ليس الواقع.',
        'خذ استراحة حقيقية: انظر من النافذة.',
        'كل دقيقة بعيداً عن الشاشة هي مكسب لك.',
        'الآخرون أيضاً يعدلون صورهم.',
        'ماذا لو اتصلت بشخص بدلاً من التصفح؟'
    ]
};

export const SLOPE_STEPS = {
    close: { 
        fr: '📵 Fermer l\'app', 
        en: '📵 Close the app', 
        ar: '📵 أغلق التطبيق', 
        desc: { fr: 'Ferme immédiatement l\'application.', en: 'Close the app immediately.', ar: 'أغلق التطبيق فوراً.' } 
    },
    put_away: { 
        fr: '📱 Poser le téléphone', 
        en: '📱 Put phone away', 
        ar: '📱 ضع الهاتف جانباً', 
        desc: { fr: 'Dans une autre pièce si possible.', en: 'In another room if possible.', ar: 'في غرفة أخرى إن أمكن.' } 
    },
    activity: { 
        fr: '🎯 Faire une vraie activité', 
        en: '🎯 Do a real activity', 
        ar: '🎯 قم بنشاط حقيقي', 
        desc: { fr: 'Marche, lecture, conversation...', en: 'Walk, read, have a conversation...', ar: 'امشِ، اقرأ، تحدث...' } 
    }
};

export const UI_LABELS = {
    fr: {
        title: 'Envie de scroller',
        subtitle: 'Tu as reconnu l\'envie. C\'est déjà un pas.',
        signalsTitle: 'Qu\'est-ce qui a déclenché ?',
        stepsTitle: 'Étapes pour décrocher',
        stoppedCount: 'sessions évitées',
        confirmButton: '✓ J\'ai décroché',
        configTitle: 'Configuration Réseaux Sociaux'
    },
    en: {
        title: 'Urge to scroll',
        subtitle: 'You recognized the urge. That\'s already a step.',
        signalsTitle: 'What triggered it?',
        stepsTitle: 'Steps to disconnect',
        stoppedCount: 'sessions avoided',
        confirmButton: '✓ I disconnected',
        configTitle: 'Social Media Configuration'
    },
    ar: {
        title: 'رغبة في التصفح',
        subtitle: 'لقد تعرفت على الرغبة. هذه بحد ذاتها خطوة.',
        signalsTitle: 'ما الذي أثارها؟',
        stepsTitle: 'خطوات للانفصال',
        stoppedCount: 'جلسات تم تجنبها',
        confirmButton: '✓ انفصلت',
        configTitle: 'إعدادات وسائل التواصل'
    }
};
