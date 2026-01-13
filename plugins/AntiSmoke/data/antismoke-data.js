/**
 * AntiSmoke Data - Données spécifiques à l'addiction à la cigarette
 */

// Déclencheurs spécifiques à la cigarette
export const TRIGGERS = {
    stress: { fr: 'Stress au travail', en: 'Work stress', ar: 'ضغط العمل' },
    coffee: { fr: 'Pause café', en: 'Coffee break', ar: 'استراحة قهوة' },
    after_meal: { fr: 'Après le repas', en: 'After a meal', ar: 'بعد الوجبة' },
    social: { fr: 'Entourage fumeur', en: 'Smokers around', ar: 'محيط مدخنين' },
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    alcohol: { fr: 'Consommation d\'alcool', en: 'Drinking alcohol', ar: 'شرب الكحول' },
    phone_call: { fr: 'Appel téléphonique', en: 'Phone call', ar: 'مكالمة هاتفية' },
    driving: { fr: 'En voiture', en: 'While driving', ar: 'أثناء القيادة' },
    waking_up: { fr: 'Au réveil', en: 'Upon waking', ar: 'عند الاستيقاظ' },
    anxiety: { fr: 'Anxiété', en: 'Anxiety', ar: 'قلق' }
};

// Signaux de pente spécifiques à la cigarette
export const SLOPE_SIGNALS = {
    automatic_urge: { fr: 'Envie automatique', en: 'Automatic urge', ar: 'رغبة تلقائية' },
    looking_for_pack: { fr: 'Chercher le paquet', en: 'Looking for the pack', ar: 'البحث عن العلبة' },
    justifying: { fr: 'Je mérite bien une pause', en: 'I deserve a break', ar: 'أستحق استراحة' },
    hand_to_mouth: { fr: 'Geste main-bouche', en: 'Hand-to-mouth gesture', ar: 'حركة اليد للفم' },
    smell_craving: { fr: 'Attiré par l\'odeur', en: 'Attracted by the smell', ar: 'منجذب للرائحة' },
    just_one: { fr: 'Juste une, ça ira', en: 'Just one won\'t hurt', ar: 'واحدة فقط لن تضر' }
};

// Règles d'environnement
export const ENVIRONMENT_RULES = {
    no_pack_home: { fr: 'Pas de paquet à la maison', en: 'No pack at home', ar: 'لا علبة في المنزل' },
    no_lighter: { fr: 'Pas de briquet sur moi', en: 'No lighter on me', ar: 'لا ولاعة معي' },
    smoke_free_zones: { fr: 'Éviter les zones fumeurs', en: 'Avoid smoking areas', ar: 'تجنب مناطق التدخين' },
    tell_friends: { fr: 'Amis informés de l\'arrêt', en: 'Friends know I quit', ar: 'الأصدقاء يعلمون أني توقفت' },
    substitute_ready: { fr: 'Substituts prêts', en: 'Substitutes ready', ar: 'البدائل جاهزة' }
};

// Conseils contextuels
export const CONTEXTUAL_TIPS = {
    fr: [
        'L\'envie passe en 3 minutes. Tu peux tenir.',
        'Bois un verre d\'eau à la place.',
        'Mâche un chewing-gum ou grignote une carotte.',
        'Respire profondément 5 fois.',
        'Tes poumons te remercient à chaque minute sans fumée.',
        'Pense à l\'argent économisé !',
        'Fais quelques étirements.',
        'Envoie un message à quelqu\'un.'
    ],
    en: [
        'The craving passes in 3 minutes. You can hold on.',
        'Drink a glass of water instead.',
        'Chew gum or snack on a carrot.',
        'Take 5 deep breaths.',
        'Your lungs thank you every smoke-free minute.',
        'Think about the money saved!',
        'Do some stretches.',
        'Text someone.'
    ],
    ar: [
        'الرغبة تمر في 3 دقائق. يمكنك الصمود.',
        'اشرب كوب ماء بدلاً من ذلك.',
        'امضغ علكة أو تناول جزرة.',
        'خذ 5 أنفاس عميقة.',
        'رئتاك تشكرانك كل دقيقة بدون دخان.',
        'فكر في المال الموفر!',
        'قم ببعض التمدد.',
        'أرسل رسالة لشخص ما.'
    ]
};

// Étapes pour stopper la pente
export const SLOPE_STEPS = {
    delay: { 
        fr: '⏱️ Attendre 3 minutes', 
        en: '⏱️ Wait 3 minutes', 
        ar: '⏱️ انتظر 3 دقائق', 
        desc: { 
            fr: 'L\'envie passe généralement en 3 minutes.', 
            en: 'The craving usually passes in 3 minutes.', 
            ar: 'الرغبة عادة تمر في 3 دقائق.' 
        } 
    },
    water: { 
        fr: '💧 Boire de l\'eau', 
        en: '💧 Drink water', 
        ar: '💧 اشرب ماء', 
        desc: { 
            fr: 'Un grand verre d\'eau pour occuper tes mains et ta bouche.', 
            en: 'A big glass of water to occupy your hands and mouth.', 
            ar: 'كوب ماء كبير لإشغال يديك وفمك.' 
        } 
    },
    breathe: { 
        fr: '🌬️ Respirer profondément', 
        en: '🌬️ Breathe deeply', 
        ar: '🌬️ تنفس بعمق', 
        desc: { 
            fr: 'Inspire lentement par le nez, expire par la bouche. 5 fois.', 
            en: 'Inhale slowly through nose, exhale through mouth. 5 times.', 
            ar: 'استنشق ببطء من الأنف، أخرج من الفم. 5 مرات.' 
        } 
    },
    substitute: { 
        fr: '🥕 Utiliser un substitut', 
        en: '🥕 Use a substitute', 
        ar: '🥕 استخدم بديلاً', 
        desc: { 
            fr: 'Chewing-gum, carotte, cure-dent, stylo...', 
            en: 'Chewing gum, carrot, toothpick, pen...', 
            ar: 'علكة، جزرة، عود أسنان، قلم...' 
        } 
    }
};

// Labels UI spécifiques
export const UI_LABELS = {
    fr: {
        title: 'Envie de fumer',
        subtitle: 'Tu as reconnu l\'envie. C\'est déjà une victoire.',
        signalsTitle: 'Qu\'est-ce qui a déclenché ?',
        stepsTitle: 'Étapes pour résister',
        stoppedCount: 'envies résistées',
        confirmButton: '✓ J\'ai résisté',
        configTitle: 'Configuration Anti-Tabac'
    },
    en: {
        title: 'Craving to smoke',
        subtitle: 'You recognized the craving. That\'s already a victory.',
        signalsTitle: 'What triggered it?',
        stepsTitle: 'Steps to resist',
        stoppedCount: 'cravings resisted',
        confirmButton: '✓ I resisted',
        configTitle: 'Anti-Smoke Configuration'
    },
    ar: {
        title: 'رغبة في التدخين',
        subtitle: 'لقد تعرفت على الرغبة. هذا بحد ذاته انتصار.',
        signalsTitle: 'ما الذي أثارها؟',
        stepsTitle: 'خطوات للمقاومة',
        stoppedCount: 'رغبات تم مقاومتها',
        confirmButton: '✓ قاومت',
        configTitle: 'إعدادات مكافحة التدخين'
    }
};
