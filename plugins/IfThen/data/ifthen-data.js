/**
 * IfThen Data - Templates et constantes
 */

export const RULE_TEMPLATES = {
    night_alone: {
        id: 'tpl_night_alone',
        name: { fr: 'Nuit seul', en: 'Night alone', ar: 'ليلة وحيد' },
        if: { timeRange: 'night', alone: true },
        then: { actionIds: ['phone_out_bedroom', 'walk_2min'], messageKey: 'rule_night_alone_msg' }
    },
    stress_high: {
        id: 'tpl_stress_high',
        name: { fr: 'Stress élevé', en: 'High stress', ar: 'إجهاد عالي' },
        if: { stressAbove: 7 },
        then: { actionIds: ['shower', 'breathing_446'], messageKey: 'rule_stress_high_msg' }
    },
    exposure: {
        id: 'tpl_exposure',
        name: { fr: 'Après exposition', en: 'After exposure', ar: 'بعد التعرض' },
        if: { exposed: true },
        then: { actionIds: ['close_app', 'leave_room', 'reset'], messageKey: 'rule_exposure_msg' }
    },
    bed_phone: {
        id: 'tpl_bed_phone',
        name: { fr: 'Téléphone au lit', en: 'Phone in bed', ar: 'الهاتف في السرير' },
        if: { inBedWithPhone: true },
        then: { actionIds: ['phone_out_bedroom', 'read_book'], messageKey: 'rule_bed_phone_msg' }
    },
    boredom: {
        id: 'tpl_boredom',
        name: { fr: 'Ennui', en: 'Boredom', ar: 'ملل' },
        if: { triggerTag: 'boredom' },
        then: { actionIds: ['call_friend', 'exercise', 'hobby'], messageKey: 'rule_boredom_msg' }
    }
};

export const ACTIONS = {
    phone_out_bedroom: { fr: 'Téléphone hors de la chambre', en: 'Phone out of bedroom', ar: 'الهاتف خارج الغرفة' },
    walk_2min: { fr: 'Marcher 2 minutes', en: 'Walk for 2 minutes', ar: 'المشي لمدة دقيقتين' },
    shower: { fr: 'Prendre une douche', en: 'Take a shower', ar: 'الاستحمام' },
    breathing_446: { fr: 'Respiration 4-4-6', en: 'Breathing 4-4-6', ar: 'تنفس 4-4-6' },
    close_app: { fr: 'Fermer l\'application/onglet', en: 'Close the app/tab', ar: 'إغلاق التطبيق' },
    leave_room: { fr: 'Quitter la pièce 2 min', en: 'Leave the room for 2 min', ar: 'مغادرة الغرفة لدقيقتين' },
    reset: { fr: 'Faire un reset mental', en: 'Do a mental reset', ar: 'إعادة ضبط ذهني' },
    read_book: { fr: 'Lire un livre', en: 'Read a book', ar: 'قراءة كتاب' },
    call_friend: { fr: 'Appeler un ami', en: 'Call a friend', ar: 'الاتصال بصديق' },
    exercise: { fr: 'Faire de l\'exercice', en: 'Do some exercise', ar: 'ممارسة التمارين' },
    hobby: { fr: 'Pratiquer un hobby', en: 'Practice a hobby', ar: 'ممارسة هواية' },
    cold_water: { fr: 'Eau froide sur le visage', en: 'Cold water on face', ar: 'ماء بارد على الوجه' },
    pushups: { fr: 'Faire des pompes', en: 'Do push-ups', ar: 'تمارين الضغط' }
};

export const LABELS = {
    fr: {
        title: 'Règles actives',
        manage: 'Gérer',
        noRules: 'Aucune règle active',
        modalTitle: 'Mes règles Si... Alors...',
        addTemplate: 'Ajouter depuis template',
        addCustom: 'Créer une règle',
        empty: 'Aucune règle. Ajoute-en une !',
        chooseTemplate: 'Choisir un modèle',
        back: 'Retour',
        createRule: 'Créer une règle',
        ruleName: 'Nom de la règle',
        condition: 'Condition (Si...)',
        actions: 'Actions (Alors...)',
        save: 'Enregistrer',
        confirmDelete: 'Supprimer cette règle ?',
        condNight: 'Nuit',
        condAlone: 'Seul',
        condExposed: 'Exposé',
        condBedPhone: 'Téléphone au lit',
        nameRequired: 'Nom requis'
    },
    en: {
        title: 'Active rules',
        manage: 'Manage',
        noRules: 'No active rules',
        modalTitle: 'My If... Then... Rules',
        addTemplate: 'Add from template',
        addCustom: 'Create a rule',
        empty: 'No rules. Add one!',
        chooseTemplate: 'Choose a template',
        back: 'Back',
        createRule: 'Create a rule',
        ruleName: 'Rule name',
        condition: 'Condition (If...)',
        actions: 'Actions (Then...)',
        save: 'Save',
        confirmDelete: 'Delete this rule?',
        condNight: 'Night',
        condAlone: 'Alone',
        condExposed: 'Exposed',
        condBedPhone: 'Phone in bed',
        nameRequired: 'Name required'
    },
    ar: {
        title: 'القواعد النشطة',
        manage: 'إدارة',
        noRules: 'لا توجد قواعد نشطة',
        modalTitle: 'قواعدي إذا... إذن...',
        addTemplate: 'إضافة من قالب',
        addCustom: 'إنشاء قاعدة',
        empty: 'لا توجد قواعد. أضف واحدة!',
        chooseTemplate: 'اختر قالبًا',
        back: 'رجوع',
        createRule: 'إنشاء قاعدة',
        ruleName: 'اسم القاعدة',
        condition: 'الشرط (إذا...)',
        actions: 'الإجراءات (إذن...)',
        save: 'حفظ',
        confirmDelete: 'حذف هذه القاعدة؟',
        condNight: 'ليل',
        condAlone: 'وحيد',
        condExposed: 'معرض',
        condBedPhone: 'الهاتف في السرير',
        nameRequired: 'الاسم مطلوب'
    }
};
