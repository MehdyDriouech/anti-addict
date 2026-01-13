/**
 * AntiPorn Data - Constantes et labels
 */

export const TRIGGERS = {
    alone: { fr: 'Seul à la maison', en: 'Home alone', ar: 'وحيد في المنزل' },
    night: { fr: 'La nuit', en: 'At night', ar: 'في الليل' },
    boredom: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
    stress: { fr: 'Stress', en: 'Stress', ar: 'إجهاد' },
    social_scroll: { fr: 'Scroll réseaux sociaux', en: 'Social media scrolling', ar: 'تصفح وسائل التواصل' },
    fatigue: { fr: 'Fatigue', en: 'Fatigue', ar: 'تعب' },
    rejection: { fr: 'Sentiment de rejet', en: 'Feeling rejected', ar: 'شعور بالرفض' },
    anxiety: { fr: 'Anxiété', en: 'Anxiety', ar: 'قلق' }
};

export const SLOPE_SIGNALS = {
    soft_images: { fr: 'Images suggestives', en: 'Suggestive images', ar: 'صور إيحائية' },
    endless_scroll: { fr: 'Scroll sans fin', en: 'Endless scrolling', ar: 'تصفح لا نهائي' },
    searching: { fr: 'Recherches ambiguës', en: 'Ambiguous searches', ar: 'بحث غامض' },
    incognito: { fr: 'Mode navigation privée', en: 'Private browsing', ar: 'تصفح خاص' },
    justifying: { fr: 'Justifications internes', en: 'Internal justifications', ar: 'تبريرات داخلية' },
    isolation: { fr: 'S\'isoler', en: 'Isolating yourself', ar: 'العزلة' }
};

export const ENVIRONMENT_RULES = {
    phoneOutBedroom: { fr: 'Téléphone hors de la chambre la nuit', en: 'Phone out of bedroom at night', ar: 'الهاتف خارج غرفة النوم ليلاً' },
    noPhoneBed: { fr: 'Pas de téléphone au lit', en: 'No phone in bed', ar: 'لا هاتف في السرير' },
    blockTriggersList: { fr: 'Applications déclencheurs bloquées', en: 'Trigger apps blocked', ar: 'التطبيقات المحفزة محظورة' },
    screenTimeLimit: { fr: 'Limite de temps d\'écran définie', en: 'Screen time limit set', ar: 'حد زمني للشاشة محدد' },
    accountabilityPartner: { fr: 'Partenaire de responsabilité', en: 'Accountability partner', ar: 'شريك مسؤولية' }
};

export const CONTEXTUAL_TIPS = {
    fr: ['Rappelle-toi: ce moment va passer.', 'Lève-toi et change de pièce.', 'Appelle ou envoie un message à quelqu\'un.', 'Bois un verre d\'eau fraîche.', 'Fais 10 pompes ou squats.', 'Mets de la musique et bouge.', 'Sors prendre l\'air, même 2 minutes.', 'Respire profondément: 4-4-6.'],
    en: ['Remember: this moment will pass.', 'Stand up and change rooms.', 'Call or text someone.', 'Drink a glass of cold water.', 'Do 10 push-ups or squats.', 'Put on music and move.', 'Go outside for fresh air, even 2 minutes.', 'Breathe deeply: 4-4-6.'],
    ar: ['تذكر: هذه اللحظة ستمر.', 'قم وغير الغرفة.', 'اتصل أو أرسل رسالة لشخص ما.', 'اشرب كوب ماء بارد.', 'قم بـ 10 تمارين ضغط.', 'شغل موسيقى وتحرك.', 'اخرج للهواء الطلق، حتى لدقيقتين.', 'تنفس بعمق: 4-4-6.']
};

export const NIGHT_CHECKLIST_ITEMS = {
    phone_out: { fr: 'Téléphone hors chambre', en: 'Phone out of room', ar: 'الهاتف خارج الغرفة', emoji: '📵' },
    lights_dim: { fr: 'Lumières tamisées', en: 'Lights dimmed', ar: 'أضواء خافتة', emoji: '💡' },
    leave_bed: { fr: 'Si craving: quitter le lit', en: 'If craving: leave bed', ar: 'إذا رغبة: غادر السرير', emoji: '🛏️' },
    no_screens: { fr: 'Pas d\'écrans 30min avant', en: 'No screens 30min before', ar: 'لا شاشات 30 دقيقة قبل', emoji: '📺' },
    prayer: { fr: 'Prière/méditation', en: 'Prayer/meditation', ar: 'صلاة/تأمل', emoji: '🙏' },
    door_open: { fr: 'Porte ouverte', en: 'Door open', ar: 'الباب مفتوح', emoji: '🚪' }
};

export const SLOPE_STEPS = {
    leave: { fr: '🚪 Quitter l\'endroit', en: '🚪 Leave the place', ar: '🚪 غادر المكان', desc: { fr: 'Lève-toi et change de pièce immédiatement.', en: 'Stand up and change rooms immediately.', ar: 'قم وغير الغرفة فوراً.' } },
    water: { fr: '💧 Boire de l\'eau', en: '💧 Drink water', ar: '💧 اشرب ماء', desc: { fr: 'Un verre d\'eau fraîche pour couper le cycle.', en: 'A glass of cold water to break the cycle.', ar: 'كوب ماء بارد لكسر الدورة.' } },
    move: { fr: '🏃 Bouger le corps', en: '🏃 Move your body', ar: '🏃 حرك جسمك', desc: { fr: '10 pompes, squats, ou marche 2 minutes.', en: '10 push-ups, squats, or walk 2 minutes.', ar: '10 تمارين ضغط، قرفصاء، أو امش دقيقتين.' } }
};

export const UI_LABELS = {
    fr: {
        title: 'Pente glissante',
        subtitle: 'Tu as reconnu les signaux. C\'est déjà une victoire.',
        signalsTitle: 'Signaux détectés',
        stepsTitle: 'Étapes de sortie',
        stoppedCount: 'pentes stoppées',
        confirmButton: '✓ J\'ai stoppé la pente',
        configTitle: 'Configuration Anti-Porno'
    },
    en: {
        title: 'Slippery slope',
        subtitle: 'You recognized the signals. That\'s already a victory.',
        signalsTitle: 'Detected signals',
        stepsTitle: 'Exit steps',
        stoppedCount: 'slopes stopped',
        confirmButton: '✓ I stopped the slope',
        configTitle: 'Anti-Porn Configuration'
    },
    ar: {
        title: 'المنحدر الزلق',
        subtitle: 'لقد تعرفت على الإشارات. هذا بحد ذاته انتصار.',
        signalsTitle: 'الإشارات المكتشفة',
        stepsTitle: 'خطوات الخروج',
        stoppedCount: 'منحدرات متوقفة',
        confirmButton: '✓ أوقفت المنحدر',
        configTitle: 'إعدادات مكافحة الإباحية'
    }
};
