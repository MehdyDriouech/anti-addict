/**
 * AntiGambling Data - Données spécifiques à l'addiction au jeu d'argent
 */

export const TRIGGERS = {
    stress: { fr: 'Stress', en: 'Stress', ar: 'إجهاد' },
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    loneliness: { fr: 'Solitude', en: 'Loneliness', ar: 'وحدة' },
    financial_stress: { fr: 'Stress financier', en: 'Financial stress', ar: 'ضغط مالي' },
    evening: { fr: 'En fin de journée', en: 'End of day', ar: 'نهاية اليوم' },
    dopamine_seek: { fr: 'Recherche de sensation', en: 'Seeking sensation', ar: 'البحث عن الإحساس' }
};

export const SLOPE_SIGNALS = {
    just_one_bet: { fr: 'Juste un pari', en: 'Just one bet', ar: 'رهان واحد فقط' },
    trying_to_recover_losses: { fr: 'Je vais me refaire', en: 'Trying to recover losses', ar: 'سأستعيد خسائري' },
    losing_track_of_money: { fr: 'Je perds la notion des montants', en: 'Losing track of money', ar: 'أفقد تتبع المبالغ' },
    chasing_wins: { fr: 'Encore une chance', en: 'Chasing wins', ar: 'مطاردة الفوز' },
    hiding_activity: { fr: 'Je cache ce que je fais', en: 'Hiding activity', ar: 'أخفي ما أفعله' }
};

export const ENVIRONMENT_RULES = {
    // Règles optionnelles pour gambling - peut être vide ou minimal
};

export const CONTEXTUAL_TIPS = {
    fr: [
        'Une pause courte peut casser l\'élan.',
        'S\'éloigner quelques minutes aide parfois à clarifier.',
        'Chercher du soutien peut aider à traverser le moment.',
        'Respire profondément : 4-4-6.',
        'Lève-toi et change de pièce.',
        'Appelle ou envoie un message à quelqu\'un.',
        'Bois un verre d\'eau fraîche.',
        'Fais 10 pompes ou squats.'
    ],
    en: [
        'A short pause can break the momentum.',
        'Stepping away for a few minutes sometimes helps clarify.',
        'Seeking support can help get through the moment.',
        'Breathe deeply: 4-4-6.',
        'Stand up and change rooms.',
        'Call or text someone.',
        'Drink a glass of cold water.',
        'Do 10 push-ups or squats.'
    ],
    ar: [
        'استراحة قصيرة يمكن أن تكسر الزخم.',
        'الابتعاد لبضع دقائق يساعد أحياناً في التوضيح.',
        'البحث عن الدعم يمكن أن يساعد في تجاوز اللحظة.',
        'تنفس بعمق: 4-4-6.',
        'قم وغير الغرفة.',
        'اتصل أو أرسل رسالة لشخص ما.',
        'اشرب كوب ماء بارد.',
        'قم بـ 10 تمارين ضغط أو قرفصاء.'
    ]
};

export const SLOPE_STEPS = {
    leave: { 
        fr: '🚪 Quitter l\'endroit', 
        en: '🚪 Leave the place', 
        ar: '🚪 غادر المكان', 
        desc: { 
            fr: 'Lève-toi et change de lieu immédiatement. Quitte l\'app ou le site.', 
            en: 'Stand up and change location immediately. Leave the app or site.', 
            ar: 'قم وغير المكان فوراً. اترك التطبيق أو الموقع.' 
        } 
    },
    water: { 
        fr: '💧 Eau froide / visage', 
        en: '💧 Cold water / face', 
        ar: '💧 ماء بارد / الوجه', 
        desc: { 
            fr: 'Un verre d\'eau fraîche ou de l\'eau froide sur le visage pour couper le cycle.', 
            en: 'A glass of cold water or cold water on your face to break the cycle.', 
            ar: 'كوب ماء بارد أو ماء بارد على الوجه لكسر الدورة.' 
        } 
    },
    move: { 
        fr: '🏃 Mouvement court', 
        en: '🏃 Short movement', 
        ar: '🏃 حركة قصيرة', 
        desc: { 
            fr: '10 pompes, squats, ou marche 2 minutes. Sortir si possible.', 
            en: '10 push-ups, squats, or walk 2 minutes. Go outside if possible.', 
            ar: '10 تمارين ضغط، قرفصاء، أو امش دقيقتين. اخرج إن أمكن.' 
        } 
    }
};

export const UI_LABELS = {
    fr: {
        title: 'Pente glissante',
        subtitle: 'Tu as reconnu les signaux. C\'est déjà une victoire.',
        signalsTitle: 'Quel signal ?',
        stepsTitle: 'Étapes de sortie',
        stoppedCount: 'pentes stoppées',
        confirmButton: '✓ J\'ai stoppé la pente',
        configTitle: 'Configuration Anti-Jeu d\'argent',
        completeStep: 'Fait',
        completed: 'Bravo !',
        completedMessage: 'Tu as stoppé cette pente. Continue comme ça !',
        close: 'Fermer'
    },
    en: {
        title: 'Slippery slope',
        subtitle: 'You recognized the signals. That\'s already a victory.',
        signalsTitle: 'What signal?',
        stepsTitle: 'Exit steps',
        stoppedCount: 'slopes stopped',
        confirmButton: '✓ I stopped the slope',
        configTitle: 'Anti-Gambling Configuration',
        completeStep: 'Done',
        completed: 'Well done!',
        completedMessage: 'You stopped this slope. Keep it up!',
        close: 'Close'
    },
    ar: {
        title: 'المنحدر الزلق',
        subtitle: 'لقد تعرفت على الإشارات. هذا بحد ذاته انتصار.',
        signalsTitle: 'ما الإشارة؟',
        stepsTitle: 'خطوات الخروج',
        stoppedCount: 'منحدرات متوقفة',
        confirmButton: '✓ أوقفت المنحدر',
        configTitle: 'إعدادات مكافحة القمار',
        completeStep: 'تم',
        completed: 'أحسنت!',
        completedMessage: 'لقد أوقفت هذا المنحدر. استمر هكذا!',
        close: 'إغلاق'
    }
};
