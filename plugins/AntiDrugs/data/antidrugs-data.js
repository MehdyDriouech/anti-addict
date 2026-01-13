/**
 * AntiDrugs Data - Données spécifiques à l'addiction aux substances
 */

export const TRIGGERS = {
    stress: { fr: 'Stress intense', en: 'Intense stress', ar: 'ضغط شديد' },
    emotions: { fr: 'Émotions difficiles', en: 'Difficult emotions', ar: 'مشاعر صعبة' },
    social: { fr: 'Contexte social', en: 'Social context', ar: 'سياق اجتماعي' },
    boredom: { fr: 'Ennui profond', en: 'Deep boredom', ar: 'ملل عميق' },
    flashback: { fr: 'Flashback/Souvenir', en: 'Flashback/Memory', ar: 'ذكريات ماضية' },
    party: { fr: 'Fête/Soirée', en: 'Party', ar: 'حفلة' },
    dealer_contact: { fr: 'Contact avec dealer', en: 'Dealer contact', ar: 'اتصال بالمروج' },
    place: { fr: 'Lieu associé', en: 'Associated place', ar: 'مكان مرتبط' },
    music: { fr: 'Musique associée', en: 'Associated music', ar: 'موسيقى مرتبطة' },
    anxiety: { fr: 'Anxiété/Panique', en: 'Anxiety/Panic', ar: 'قلق/ذعر' }
};

export const SLOPE_SIGNALS = {
    thinking: { fr: 'Y penser souvent', en: 'Thinking about it often', ar: 'التفكير فيها كثيراً' },
    romanticizing: { fr: 'Romantiser le passé', en: 'Romanticizing the past', ar: 'تجميل الماضي' },
    contact: { fr: 'Envie de contacter', en: 'Wanting to contact', ar: 'الرغبة في الاتصال' },
    planning: { fr: 'Planifier mentalement', en: 'Mentally planning', ar: 'التخطيط ذهنياً' },
    isolating: { fr: 'S\'isoler', en: 'Isolating', ar: 'العزلة' },
    justifying: { fr: 'Se justifier', en: 'Justifying', ar: 'التبرير' }
};

export const ENVIRONMENT_RULES = {
    delete_contacts: { fr: 'Contacts supprimés', en: 'Contacts deleted', ar: 'جهات الاتصال محذوفة' },
    avoid_places: { fr: 'Lieux évités', en: 'Places avoided', ar: 'الأماكن متجنبة' },
    support_network: { fr: 'Réseau de soutien', en: 'Support network', ar: 'شبكة دعم' },
    therapist: { fr: 'Suivi thérapeutique', en: 'Therapy follow-up', ar: 'متابعة علاجية' },
    emergency_plan: { fr: 'Plan d\'urgence prêt', en: 'Emergency plan ready', ar: 'خطة طوارئ جاهزة' }
};

export const CONTEXTUAL_TIPS = {
    fr: [
        'Appelle ton sponsor ou un proche maintenant.',
        'Cette envie va passer. Tu l\'as déjà fait avant.',
        'Pense à ce que tu as à perdre.',
        'Rappelle-toi les conséquences.',
        'Tu n\'es pas seul. Demande de l\'aide.',
        'Chaque minute compte. Tiens bon.',
        'Fais quelque chose de physique maintenant.',
        'Change d\'environnement immédiatement.'
    ],
    en: [
        'Call your sponsor or a loved one now.',
        'This craving will pass. You\'ve done it before.',
        'Think about what you have to lose.',
        'Remember the consequences.',
        'You\'re not alone. Ask for help.',
        'Every minute counts. Hold on.',
        'Do something physical now.',
        'Change your environment immediately.'
    ],
    ar: [
        'اتصل بداعمك أو قريب الآن.',
        'هذه الرغبة ستمر. لقد فعلتها من قبل.',
        'فكر فيما ستخسره.',
        'تذكر العواقب.',
        'لست وحدك. اطلب المساعدة.',
        'كل دقيقة مهمة. اصمد.',
        'افعل شيئاً جسدياً الآن.',
        'غير بيئتك فوراً.'
    ]
};

export const SLOPE_STEPS = {
    call: { 
        fr: '📞 Appeler quelqu\'un', 
        en: '📞 Call someone', 
        ar: '📞 اتصل بشخص ما', 
        desc: { 
            fr: 'Sponsor, ami sobre, ligne d\'écoute.', 
            en: 'Sponsor, sober friend, helpline.', 
            ar: 'داعم، صديق صاحٍ، خط مساعدة.' 
        } 
    },
    leave: { 
        fr: '🚪 Quitter immédiatement', 
        en: '🚪 Leave immediately', 
        ar: '🚪 غادر فوراً', 
        desc: { 
            fr: 'Change de lieu. Va dans un endroit sûr.', 
            en: 'Change location. Go somewhere safe.', 
            ar: 'غير المكان. اذهب لمكان آمن.' 
        } 
    },
    ground: { 
        fr: '🧘 Ancrage 5-4-3-2-1', 
        en: '🧘 Grounding 5-4-3-2-1', 
        ar: '🧘 تأريض 5-4-3-2-1', 
        desc: { 
            fr: '5 choses que tu vois, 4 que tu touches...', 
            en: '5 things you see, 4 you touch...', 
            ar: '5 أشياء تراها، 4 تلمسها...' 
        } 
    }
};

export const UI_LABELS = {
    fr: {
        title: 'Envie de consommer',
        subtitle: 'Tu as reconnu les signaux. C\'est un acte de force.',
        signalsTitle: 'Qu\'est-ce qui a déclenché ?',
        stepsTitle: 'Actions d\'urgence',
        stoppedCount: 'crises surmontées',
        confirmButton: '✓ J\'ai tenu bon',
        configTitle: 'Configuration Anti-Substances'
    },
    en: {
        title: 'Urge to use',
        subtitle: 'You recognized the signals. That\'s an act of strength.',
        signalsTitle: 'What triggered it?',
        stepsTitle: 'Emergency actions',
        stoppedCount: 'crises overcome',
        confirmButton: '✓ I held on',
        configTitle: 'Anti-Drugs Configuration'
    },
    ar: {
        title: 'رغبة في التعاطي',
        subtitle: 'لقد تعرفت على الإشارات. هذا عمل قوة.',
        signalsTitle: 'ما الذي أثارها؟',
        stepsTitle: 'إجراءات طوارئ',
        stoppedCount: 'أزمات تم تجاوزها',
        confirmButton: '✓ صمدت',
        configTitle: 'إعدادات مكافحة المواد'
    }
};
