/**
 * Coaching Data - Constantes et labels
 */

export const CORRELATION_THRESHOLDS = {
    stress: 7, craving: 6, minSamples: 3
};

export const DAY_PERIODS = {
    morning: { start: 6, end: 12, fr: 'Matin', en: 'Morning', ar: 'صباح' },
    afternoon: { start: 12, end: 18, fr: 'Après-midi', en: 'Afternoon', ar: 'بعد الظهر' },
    evening: { start: 18, end: 22, fr: 'Soir', en: 'Evening', ar: 'مساء' },
    night: { start: 22, end: 6, fr: 'Nuit', en: 'Night', ar: 'ليل' }
};

export const RULE_SUGGESTIONS = {
    alone: { ifCondition: { fr: 'Si je suis seul', en: 'If I\'m alone', ar: 'إذا كنت وحدي' }, thenAction: { fr: 'Appeler quelqu\'un', en: 'Call someone', ar: 'اتصل بشخص ما' } },
    night: { ifCondition: { fr: 'Si c\'est la nuit', en: 'If it\'s night', ar: 'إذا كان الليل' }, thenAction: { fr: 'Téléphone dans le salon', en: 'Phone in living room', ar: 'الهاتف في الصالة' } },
    boredom: { ifCondition: { fr: 'Si je m\'ennuie', en: 'If I\'m bored', ar: 'إذا شعرت بالملل' }, thenAction: { fr: 'Sortir marcher 5 min', en: 'Walk 5 min', ar: 'امش 5 دقائق' } },
    stress: { ifCondition: { fr: 'Si je suis stressé', en: 'If I\'m stressed', ar: 'إذا كنت متوترا' }, thenAction: { fr: 'Respiration 4-4-6', en: 'Breathing 4-4-6', ar: 'تنفس 4-4-6' } },
    fatigue: { ifCondition: { fr: 'Si je suis fatigué', en: 'If I\'m tired', ar: 'إذا كنت متعبا' }, thenAction: { fr: 'Douche froide ou dormir', en: 'Cold shower or sleep', ar: 'دش بارد أو نوم' } }
};

export const PREDEFINED_ADVICE = {
    porn: {
        retrospective: [
            { id: 'porn_evening_solitude', messageKey: 'coaching.porn.evening_solitude' },
            { id: 'porn_low_energy', messageKey: 'coaching.porn.low_energy' },
            { id: 'porn_stayed_present', messageKey: 'coaching.porn.stayed_present' }
        ],
        preventive: [
            { id: 'porn_calm_evenings', messageKey: 'coaching.porn.calm_evenings' },
            { id: 'porn_boredom_urge', messageKey: 'coaching.porn.boredom_urge' },
            { id: 'porn_phone_bed', messageKey: 'coaching.porn.phone_bed' }
        ],
        prescriptive: [
            { id: 'porn_leave_room', messageKey: 'coaching.porn.leave_room', suggestedAction: 'movement_short' },
            { id: 'porn_water_face', messageKey: 'coaching.porn.water_face', suggestedAction: 'water_cold' },
            { id: 'porn_short_movement', messageKey: 'coaching.porn.short_movement', suggestedAction: 'movement_short' }
        ]
    },
    cigarette: {
        retrospective: [
            { id: 'cigarette_routine_cravings', messageKey: 'coaching.cigarette.routine_cravings' },
            { id: 'cigarette_stress_intensity', messageKey: 'coaching.cigarette.stress_intensity' },
            { id: 'cigarette_traversed_cravings', messageKey: 'coaching.cigarette.traversed_cravings' }
        ],
        preventive: [
            { id: 'cigarette_break_moments', messageKey: 'coaching.cigarette.break_moments' },
            { id: 'cigarette_social_situations', messageKey: 'coaching.cigarette.social_situations' },
            { id: 'cigarette_fatigue_urge', messageKey: 'coaching.cigarette.fatigue_urge' }
        ],
        prescriptive: [
            { id: 'cigarette_change_routine', messageKey: 'coaching.cigarette.change_routine', suggestedAction: 'movement_short' },
            { id: 'cigarette_breathe_minute', messageKey: 'coaching.cigarette.breathe_minute', suggestedAction: 'breathing' },
            { id: 'cigarette_occupy_hands', messageKey: 'coaching.cigarette.occupy_hands', suggestedAction: 'movement_short' }
        ]
    },
    alcohol: {
        retrospective: [
            { id: 'alcohol_end_of_day', messageKey: 'coaching.alcohol.end_of_day' },
            { id: 'alcohol_relaxation_moments', messageKey: 'coaching.alcohol.relaxation_moments' },
            { id: 'alcohol_attention_occasions', messageKey: 'coaching.alcohol.attention_occasions' }
        ],
        preventive: [
            { id: 'alcohol_social_evenings', messageKey: 'coaching.alcohol.social_evenings' },
            { id: 'alcohol_fatigue_decisions', messageKey: 'coaching.alcohol.fatigue_decisions' },
            { id: 'alcohol_alternative_drink', messageKey: 'coaching.alcohol.alternative_drink' }
        ],
        prescriptive: [
            { id: 'alcohol_plan_alternative', messageKey: 'coaching.alcohol.plan_alternative', suggestedAction: 'planning' },
            { id: 'alcohol_pause_before', messageKey: 'coaching.alcohol.pause_before', suggestedAction: 'breathing' },
            { id: 'alcohol_fresh_air', messageKey: 'coaching.alcohol.fresh_air', suggestedAction: 'movement_short' }
        ]
    },
    drugs: {
        retrospective: [
            { id: 'drugs_stress_cravings', messageKey: 'coaching.drugs.stress_cravings' },
            { id: 'drugs_regular_contexts', messageKey: 'coaching.drugs.regular_contexts' },
            { id: 'drugs_traversed_difficult', messageKey: 'coaching.drugs.traversed_difficult' }
        ],
        preventive: [
            { id: 'drugs_fatigue_overload', messageKey: 'coaching.drugs.fatigue_overload' },
            { id: 'drugs_unexpected_situations', messageKey: 'coaching.drugs.unexpected_situations' },
            { id: 'drugs_remember_why', messageKey: 'coaching.drugs.remember_why' }
        ],
        prescriptive: [
            { id: 'drugs_leave_context', messageKey: 'coaching.drugs.leave_context', suggestedAction: 'movement_short' },
            { id: 'drugs_talk_trusted', messageKey: 'coaching.drugs.talk_trusted', suggestedAction: 'social' },
            { id: 'drugs_simple_physical', messageKey: 'coaching.drugs.simple_physical', suggestedAction: 'movement_short' }
        ]
    },
    social_media: {
        retrospective: [
            { id: 'social_media_low_energy_scroll', messageKey: 'coaching.social_media.low_energy_scroll' },
            { id: 'social_media_boredom_automatic', messageKey: 'coaching.social_media.boredom_automatic' },
            { id: 'social_media_reduced_sessions', messageKey: 'coaching.social_media.reduced_sessions' }
        ],
        preventive: [
            { id: 'social_media_no_objective', messageKey: 'coaching.social_media.no_objective' },
            { id: 'social_media_before_sleep', messageKey: 'coaching.social_media.before_sleep' },
            { id: 'social_media_limit_evening', messageKey: 'coaching.social_media.limit_evening' }
        ],
        prescriptive: [
            { id: 'social_media_close_app', messageKey: 'coaching.social_media.close_app', suggestedAction: 'pause' },
            { id: 'social_media_replace_action', messageKey: 'coaching.social_media.replace_action', suggestedAction: 'movement_short' },
            { id: 'social_media_phone_away', messageKey: 'coaching.social_media.phone_away', suggestedAction: 'environment' }
        ]
    },
    gaming: {
        retrospective: [
            { id: 'gaming_long_sessions', messageKey: 'coaching.gaming.long_sessions' },
            { id: 'gaming_automatic_pause', messageKey: 'coaching.gaming.automatic_pause' },
            { id: 'gaming_stopped_earlier', messageKey: 'coaching.gaming.stopped_earlier' }
        ],
        preventive: [
            { id: 'gaming_end_of_day', messageKey: 'coaching.gaming.end_of_day' },
            { id: 'gaming_fatigue_stop', messageKey: 'coaching.gaming.fatigue_stop' },
            { id: 'gaming_define_duration', messageKey: 'coaching.gaming.define_duration' }
        ],
        prescriptive: [
            { id: 'gaming_set_timer', messageKey: 'coaching.gaming.set_timer', suggestedAction: 'planning' },
            { id: 'gaming_physical_break', messageKey: 'coaching.gaming.physical_break', suggestedAction: 'movement_short' },
            { id: 'gaming_change_activity', messageKey: 'coaching.gaming.change_activity', suggestedAction: 'movement_short' }
        ]
    },
    food: {
        retrospective: [
            { id: 'food_strong_emotion', messageKey: 'coaching.food.strong_emotion' },
            { id: 'food_fatigue_role', messageKey: 'coaching.food.fatigue_role' },
            { id: 'food_attentive_signals', messageKey: 'coaching.food.attentive_signals' }
        ],
        preventive: [
            { id: 'food_stress_moments', messageKey: 'coaching.food.stress_moments' },
            { id: 'food_skip_meals', messageKey: 'coaching.food.skip_meals' },
            { id: 'food_anticipate_snack', messageKey: 'coaching.food.anticipate_snack' }
        ],
        prescriptive: [
            { id: 'food_drink_water', messageKey: 'coaching.food.drink_water', suggestedAction: 'water' },
            { id: 'food_breathe_seconds', messageKey: 'coaching.food.breathe_seconds', suggestedAction: 'breathing' },
            { id: 'food_change_room', messageKey: 'coaching.food.change_room', suggestedAction: 'movement_short' }
        ]
    },
    shopping: {
        retrospective: [
            { id: 'shopping_emotion_rises', messageKey: 'coaching.shopping.emotion_rises' },
            { id: 'shopping_scroll_precedes', messageKey: 'coaching.shopping.scroll_precedes' },
            { id: 'shopping_resisted_impulses', messageKey: 'coaching.shopping.resisted_impulses' }
        ],
        preventive: [
            { id: 'shopping_boredom_moments', messageKey: 'coaching.shopping.boredom_moments' },
            { id: 'shopping_promotions_trigger', messageKey: 'coaching.shopping.promotions_trigger' },
            { id: 'shopping_wait_24h', messageKey: 'coaching.shopping.wait_24h' }
        ],
        prescriptive: [
            { id: 'shopping_close_app', messageKey: 'coaching.shopping.close_app', suggestedAction: 'pause' },
            { id: 'shopping_note_urge', messageKey: 'coaching.shopping.note_urge', suggestedAction: 'journaling' },
            { id: 'shopping_remember_goal', messageKey: 'coaching.shopping.remember_goal', suggestedAction: 'reflection' }
        ]
    }
};

export const LABELS = {
    fr: {
        title: '📊 Insights de la semaine', summary: 'Résumé', cravings: 'cravings', episodes: 'épisodes', wins: 'victoires', slopes: 'pentes',
        triggers: 'Top déclencheurs', hours: 'Heures à risque', correlations: 'Patterns détectés', suggestions: 'Règles suggérées',
        addRule: 'Ajouter cette règle', noData: 'Pas assez de données cette semaine', ruleAdded: 'Règle ajoutée !',
        stressCorrelation: 'Stress élevé = {x}x plus de cravings', solitudeCorrelation: 'Solitude = {x}x plus de cravings',
        phoneCorrelation: 'Téléphone au lit = {x}x plus d\'événements nocturnes', new: 'Nouveaux insights', view: 'Voir'
    },
    en: {
        title: '📊 Weekly insights', summary: 'Summary', cravings: 'cravings', episodes: 'episodes', wins: 'wins', slopes: 'slopes',
        triggers: 'Top triggers', hours: 'Risk hours', correlations: 'Detected patterns', suggestions: 'Suggested rules',
        addRule: 'Add this rule', noData: 'Not enough data this week', ruleAdded: 'Rule added!',
        stressCorrelation: 'High stress = {x}x more cravings', solitudeCorrelation: 'Loneliness = {x}x more cravings',
        phoneCorrelation: 'Phone in bed = {x}x more night events', new: 'New insights', view: 'View'
    },
    ar: {
        title: '📊 رؤى الأسبوع', summary: 'ملخص', cravings: 'رغبات', episodes: 'حوادث', wins: 'انتصارات', slopes: 'منحدرات',
        triggers: 'أعلى المحفزات', hours: 'ساعات الخطر', correlations: 'الأنماط المكتشفة', suggestions: 'قواعد مقترحة',
        addRule: 'إضافة هذه القاعدة', noData: 'بيانات غير كافية هذا الأسبوع', ruleAdded: 'تمت إضافة القاعدة!',
        stressCorrelation: 'ضغط عالي = {x} ضعف الرغبات', solitudeCorrelation: 'وحدة = {x} ضعف الرغبات',
        phoneCorrelation: 'هاتف في السرير = {x} ضعف أحداث الليل', new: 'رؤى جديدة', view: 'عرض'
    }
};
