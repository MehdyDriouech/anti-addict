/**
 * AntiShopping Data - Données spécifiques à l'addiction aux achats compulsifs
 */

export const TRIGGERS = {
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    emotions: { fr: 'Émotions difficiles', en: 'Difficult emotions', ar: 'مشاعر صعبة' },
    promo: { fr: 'Promo/Soldes', en: 'Sale/Promo', ar: 'تخفيضات' },
    stress: { fr: 'Stress', en: 'Stress', ar: 'إجهاد' },
    reward: { fr: 'Me récompenser', en: 'Rewarding myself', ar: 'مكافأة نفسي' },
    night: { fr: 'Navigation nocturne', en: 'Night browsing', ar: 'تصفح ليلي' },
    social: { fr: 'Influence sociale', en: 'Social influence', ar: 'تأثير اجتماعي' },
    ads: { fr: 'Publicité ciblée', en: 'Targeted ads', ar: 'إعلانات موجهة' },
    payday: { fr: 'Jour de paie', en: 'Payday', ar: 'يوم الراتب' },
    loneliness: { fr: 'Solitude', en: 'Loneliness', ar: 'وحدة' }
};

export const SLOPE_SIGNALS = {
    browsing: { fr: 'Navigation sur sites shopping', en: 'Browsing shopping sites', ar: 'تصفح مواقع التسوق' },
    cart: { fr: 'Panier abandonné', en: 'Abandoned cart', ar: 'سلة متروكة' },
    justifying: { fr: 'Justifications ("j\'en ai besoin")', en: 'Justifying ("I need it")', ar: 'تبريرات ("أحتاجه")' },
    checking_price: { fr: 'Vérifier les prix plusieurs fois', en: 'Checking prices multiple times', ar: 'التحقق من الأسعار مراراً' },
    night_shopping: { fr: 'Shopping de nuit', en: 'Night shopping', ar: 'تسوق ليلي' },
    hiding: { fr: 'Cacher les achats', en: 'Hiding purchases', ar: 'إخفاء المشتريات' }
};

export const ENVIRONMENT_RULES = {
    no_saved_cards: { fr: 'Pas de carte enregistrée', en: 'No saved cards', ar: 'لا بطاقات محفوظة' },
    unsubscribe: { fr: 'Désabonné des newsletters', en: 'Unsubscribed from newsletters', ar: 'إلغاء الاشتراك من النشرات' },
    wait_24h: { fr: 'Règle des 24h avant achat', en: '24h rule before buying', ar: 'قاعدة 24 ساعة قبل الشراء' },
    budget: { fr: 'Budget mensuel fixé', en: 'Monthly budget set', ar: 'ميزانية شهرية محددة' },
    wishlist: { fr: 'Utiliser une wishlist', en: 'Use a wishlist', ar: 'استخدام قائمة أمنيات' }
};

export const CONTEXTUAL_TIPS = {
    fr: [
        'Ferme cet onglet. Tu n\'en as pas vraiment besoin.',
        'Attends 24 heures avant d\'acheter.',
        'Combien d\'heures de travail pour ça ?',
        'Tu as déjà quelque chose de similaire.',
        'Le plaisir de l\'achat passe vite. Le regret reste.',
        'Mets ce montant de côté pour un vrai projet.',
        'Les soldes reviennent toujours.',
        'Est-ce que ça te rendra vraiment heureux ?'
    ],
    en: [
        'Close that tab. You don\'t really need it.',
        'Wait 24 hours before buying.',
        'How many work hours for this?',
        'You already have something similar.',
        'The thrill of buying fades fast. Regret stays.',
        'Put that money aside for a real project.',
        'Sales always come back.',
        'Will it really make you happy?'
    ],
    ar: [
        'أغلق هذا التبويب. أنت لا تحتاجه حقاً.',
        'انتظر 24 ساعة قبل الشراء.',
        'كم ساعة عمل لهذا؟',
        'لديك بالفعل شيء مشابه.',
        'متعة الشراء تتلاشى سريعاً. الندم يبقى.',
        'ضع هذا المبلغ جانباً لمشروع حقيقي.',
        'التخفيضات تعود دائماً.',
        'هل سيجعلك هذا سعيداً حقاً؟'
    ]
};

export const SLOPE_STEPS = {
    close: { 
        fr: '🛑 Fermer le site', 
        en: '🛑 Close the site', 
        ar: '🛑 أغلق الموقع', 
        desc: { fr: 'Ferme tous les onglets shopping.', en: 'Close all shopping tabs.', ar: 'أغلق جميع تبويبات التسوق.' } 
    },
    wait: { 
        fr: '⏰ Attendre 24h', 
        en: '⏰ Wait 24h', 
        ar: '⏰ انتظر 24 ساعة', 
        desc: { fr: 'Ajoute à la wishlist et reviens demain.', en: 'Add to wishlist and come back tomorrow.', ar: 'أضف للمفضلة وعد غداً.' } 
    },
    calculate: { 
        fr: '🧮 Calculer le vrai coût', 
        en: '🧮 Calculate real cost', 
        ar: '🧮 احسب التكلفة الحقيقية', 
        desc: { fr: 'Combien d\'heures de travail ?', en: 'How many work hours?', ar: 'كم ساعة عمل؟' } 
    }
};

export const UI_LABELS = {
    fr: {
        title: 'Envie d\'acheter',
        subtitle: 'Tu as reconnu l\'envie. C\'est déjà un pas vers le contrôle.',
        signalsTitle: 'Qu\'est-ce qui a déclenché ?',
        stepsTitle: 'Étapes pour résister',
        stoppedCount: 'achats évités',
        confirmButton: '✓ J\'ai résisté',
        configTitle: 'Configuration Anti-Achats'
    },
    en: {
        title: 'Urge to buy',
        subtitle: 'You recognized the urge. That\'s a step towards control.',
        signalsTitle: 'What triggered it?',
        stepsTitle: 'Steps to resist',
        stoppedCount: 'purchases avoided',
        confirmButton: '✓ I resisted',
        configTitle: 'Anti-Shopping Configuration'
    },
    ar: {
        title: 'رغبة في الشراء',
        subtitle: 'لقد تعرفت على الرغبة. هذه خطوة نحو السيطرة.',
        signalsTitle: 'ما الذي أثارها؟',
        stepsTitle: 'خطوات للمقاومة',
        stoppedCount: 'مشتريات تم تجنبها',
        confirmButton: '✓ قاومت',
        configTitle: 'إعدادات مكافحة التسوق'
    }
};
