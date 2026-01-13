/**
 * AddictionBase Data - Données partagées pour toutes les addictions
 */

// Déclencheurs communs à toutes les addictions
export const COMMON_TRIGGERS = {
    stress: { fr: 'Stress', en: 'Stress', ar: 'إجهاد' },
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    fatigue: { fr: 'Fatigue', en: 'Fatigue', ar: 'تعب' },
    emotions: { fr: 'Émotions fortes', en: 'Strong emotions', ar: 'مشاعر قوية' },
    alone: { fr: 'Seul', en: 'Alone', ar: 'وحيد' },
    social: { fr: 'Contexte social', en: 'Social context', ar: 'سياق اجتماعي' },
    routine: { fr: 'Habitude/Routine', en: 'Habit/Routine', ar: 'عادة/روتين' },
    anxiety: { fr: 'Anxiété', en: 'Anxiety', ar: 'قلق' }
};

// Actions de remplacement communes
export const COMMON_ACTIONS = {
    breathing_446: { 
        fr: 'Respiration 4-4-6', 
        en: '4-4-6 Breathing', 
        ar: 'تنفس 4-4-6',
        desc: {
            fr: 'Inspire 4s, retiens 4s, expire 6s',
            en: 'Inhale 4s, hold 4s, exhale 6s',
            ar: 'استنشق 4 ثوان، احبس 4 ثوان، أخرج 6 ثوان'
        }
    },
    walk_2min: { 
        fr: 'Marche 2 minutes', 
        en: 'Walk 2 minutes', 
        ar: 'امش دقيقتين',
        desc: {
            fr: 'Sors et marche, même juste 2 minutes',
            en: 'Go outside and walk, even just 2 minutes',
            ar: 'اخرج وامش، حتى لو دقيقتين فقط'
        }
    },
    drink_water: { 
        fr: 'Boire de l\'eau', 
        en: 'Drink water', 
        ar: 'اشرب ماء',
        desc: {
            fr: 'Un grand verre d\'eau fraîche',
            en: 'A big glass of cold water',
            ar: 'كوب كبير من الماء البارد'
        }
    },
    call_friend: { 
        fr: 'Appeler quelqu\'un', 
        en: 'Call someone', 
        ar: 'اتصل بشخص ما',
        desc: {
            fr: 'Appelle un ami ou un proche',
            en: 'Call a friend or loved one',
            ar: 'اتصل بصديق أو قريب'
        }
    },
    leave_situation: { 
        fr: 'Quitter la situation', 
        en: 'Leave the situation', 
        ar: 'غادر الموقف',
        desc: {
            fr: 'Change de lieu immédiatement',
            en: 'Change location immediately',
            ar: 'غير المكان فوراً'
        }
    },
    delay_5min: { 
        fr: 'Attendre 5 minutes', 
        en: 'Wait 5 minutes', 
        ar: 'انتظر 5 دقائق',
        desc: {
            fr: 'Repousse de 5 minutes avant de céder',
            en: 'Delay 5 minutes before giving in',
            ar: 'أجل 5 دقائق قبل الاستسلام'
        }
    },
    cold_water: { 
        fr: 'Eau froide sur le visage', 
        en: 'Cold water on face', 
        ar: 'ماء بارد على الوجه',
        desc: {
            fr: 'Asperge ton visage d\'eau froide',
            en: 'Splash cold water on your face',
            ar: 'رش ماء بارد على وجهك'
        }
    },
    pushups: { 
        fr: 'Faire des pompes', 
        en: 'Do push-ups', 
        ar: 'قم بتمارين ضغط',
        desc: {
            fr: '10 pompes pour rediriger l\'énergie',
            en: '10 push-ups to redirect energy',
            ar: '10 تمارين ضغط لتحويل الطاقة'
        }
    }
};

// Étapes de la pente (slope steps) communes
export const COMMON_SLOPE_STEPS = {
    leave: { 
        fr: '🚪 Quitter l\'endroit', 
        en: '🚪 Leave the place', 
        ar: '🚪 غادر المكان', 
        desc: { 
            fr: 'Lève-toi et change de lieu immédiatement.', 
            en: 'Stand up and change location immediately.', 
            ar: 'قم وغير المكان فوراً.' 
        } 
    },
    water: { 
        fr: '💧 Boire de l\'eau', 
        en: '💧 Drink water', 
        ar: '💧 اشرب ماء', 
        desc: { 
            fr: 'Un verre d\'eau fraîche pour couper le cycle.', 
            en: 'A glass of cold water to break the cycle.', 
            ar: 'كوب ماء بارد لكسر الدورة.' 
        } 
    },
    move: { 
        fr: '🏃 Bouger le corps', 
        en: '🏃 Move your body', 
        ar: '🏃 حرك جسمك', 
        desc: { 
            fr: '10 pompes, squats, ou marche 2 minutes.', 
            en: '10 push-ups, squats, or walk 2 minutes.', 
            ar: '10 تمارين ضغط، قرفصاء، أو امش دقيقتين.' 
        } 
    }
};

// Labels UI communs
export const UI_LABELS = {
    fr: {
        title: 'Pente glissante',
        subtitle: 'Tu as reconnu les signaux. C\'est déjà une victoire.',
        signalsTitle: 'Signaux détectés',
        stepsTitle: 'Étapes de sortie',
        stoppedCount: 'pentes stoppées',
        confirmButton: '✓ J\'ai stoppé la pente',
        completeStep: 'Fait',
        completed: 'Bravo !',
        completedMessage: 'Tu as stoppé cette pente. Continue comme ça !',
        close: 'Fermer'
    },
    en: {
        title: 'Slippery slope',
        subtitle: 'You recognized the signals. That\'s already a victory.',
        signalsTitle: 'Detected signals',
        stepsTitle: 'Exit steps',
        stoppedCount: 'slopes stopped',
        confirmButton: '✓ I stopped the slope',
        completeStep: 'Done',
        completed: 'Well done!',
        completedMessage: 'You stopped this slope. Keep it up!',
        close: 'Close'
    },
    ar: {
        title: 'المنحدر الزلق',
        subtitle: 'لقد تعرفت على الإشارات. هذا بحد ذاته انتصار.',
        signalsTitle: 'الإشارات المكتشفة',
        stepsTitle: 'خطوات الخروج',
        stoppedCount: 'منحدرات متوقفة',
        confirmButton: '✓ أوقفت المنحدر',
        completeStep: 'تم',
        completed: 'أحسنت!',
        completedMessage: 'لقد أوقفت هذا المنحدر. استمر هكذا!',
        close: 'إغلاق'
    }
};
