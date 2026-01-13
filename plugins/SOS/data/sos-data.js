/**
 * SOS Data - Constantes et données statiques
 */

// Messages d'urgence
export const EMERGENCY_MESSAGES = {
    fr: [
        'Ce moment va passer.',
        'Respire. Tu es là, c\'est déjà beaucoup.',
        'Une petite action maintenant peut t\'aider.',
        'Chaque instant où tu prends soin de toi compte.',
        'Tu n\'es pas seul. Prends soin de toi.'
    ],
    en: [
        'This moment will pass.',
        'Breathe. You\'re here, and that\'s already a lot.',
        'One small action now can help you.',
        'Every moment you take care of yourself counts.',
        'You\'re not alone. Take care of yourself.'
    ],
    ar: [
        'هذه اللحظة ستمر.',
        'تنفس. أنت هنا، وهذا كثير.',
        'فعل صغير الآن يمكن أن يساعدك.',
        'كل لحظة تعتني فيها بنفسك مهمة.',
        'لست وحدك. اعتن بنفسك.'
    ]
};

// Actions SOS prioritaires (sous-ensemble des actions)
export const PRIORITY_ACTIONS = [
    'leave_room',
    'cold_water',
    'breathing_446',
    'walk_2min',
    'call_friend',
    'pushups'
];

// Labels de traduction
export const LABELS = {
    fr: {
        title: 'SOS',
        message: 'Tu peux le faire',
        randomAction: 'Action aléatoire',
        breathe: 'Respirer',
        close: 'Je vais mieux',
        lowText: 'Mode minimal',
        spiritual: 'Rappel spirituel',
        button: 'SOS',
        inhale: 'Inspire',
        hold: 'Retiens',
        exhale: 'Expire',
        done: 'Terminé !',
        success: 'Bravo ! Tu as résisté 💪'
    },
    en: {
        title: 'SOS',
        message: 'You can do this',
        randomAction: 'Random action',
        breathe: 'Breathe',
        close: 'I\'m better now',
        lowText: 'Minimal mode',
        spiritual: 'Spiritual reminder',
        button: 'SOS',
        inhale: 'Inhale',
        hold: 'Hold',
        exhale: 'Exhale',
        done: 'Done!',
        success: 'Well done! You resisted 💪'
    },
    ar: {
        title: 'طوارئ',
        message: 'يمكنك فعل ذلك',
        randomAction: 'فعل عشوائي',
        breathe: 'تنفس',
        close: 'أنا أفضل الآن',
        lowText: 'وضع مختصر',
        spiritual: 'تذكير روحي',
        button: 'طوارئ',
        inhale: 'استنشق',
        hold: 'احتفظ',
        exhale: 'ازفر',
        done: 'تم!',
        success: 'أحسنت! لقد قاومت 💪'
    }
};
