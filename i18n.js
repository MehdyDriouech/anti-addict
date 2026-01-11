/**
 * i18n.js - Internationalisation pour l'application Revenir
 * 
 * Fonctionnalités:
 * - Chargement des fichiers de traduction JSON
 * - Fallback embarqué si fetch échoue (mode file://)
 * - Fonction t() pour récupérer les traductions
 * - Gestion RTL pour l'arabe
 */

// Traductions chargées
let currentStrings = {};
let currentSpiritualCards = [];
let currentLang = 'fr';

// Fallback embarqué minimal pour fonctionner sans serveur (mode file://)
const FALLBACK_STRINGS = {
    fr: {
        app_name: "Revenir",
        app_tagline: "Un pas à la fois",
        today: "Aujourd'hui",
        craving_now: "Protocole Anti-Rechute",
        checkin: "Check-in",
        settings: "Réglages",
        cravings_today: "Utilisation du protocole aujourd'hui",
        streak: "Streak",
        days: "jours",
        step1_title: "1. Couper",
        step1_desc: "Quitte immédiatement le déclencheur",
        step2_title: "2. Respire",
        step2_desc: "Respiration 4-4-6 : inspire 4s, retiens 4s, expire 6s",
        step3_title: "3. Remplace",
        step3_desc: "Fais une action courte : marche, eau froide, appel",
        timer_start: "Démarrer",
        timer_pause: "Pause",
        timer_reset: "Reset",
        back: "Retour",
        save: "Enregistrer",
        cancel: "Annuler",
        export_data: "Exporter les données",
        import_data: "Importer les données",
        language: "Langue",
        religion: "Religion",
        religion_none: "Aucune",
        religion_islam: "Islam",
        religion_christianity: "Christianisme",
        religion_judaism: "Judaïsme",
        religion_buddhism: "Bouddhisme",
        spiritual_cards: "Cartes spirituelles",
        enabled: "Activées",
        disabled: "Désactivées",
        addictions: "Addictions suivies",
        addiction_porn: "Contenu adulte",
        addiction_cigarette: "Cigarette",
        addiction_alcohol: "Alcool",
        addiction_drugs: "Substances",
        goal: "Objectif",
        goal_abstinence: "Abstinence",
        goal_reduce: "Réduire",
        goal_choice: "Mon choix",
        mood: "Humeur",
        stress: "Stress",
        craving: "Envie",
        solitude: "Solitude",
        exposure: "Exposition",
        exposure_desc: "As-tu été exposé à un déclencheur ?",
        notes: "Notes",
        notes_placeholder: "Comment te sens-tu ?",
        checkin_saved: "Check-in enregistré",
        history: "Historique",
        no_checkins: "Aucun check-in encore",
        import_success: "Import réussi",
        import_error: "Erreur d'import",
        export_success: "Export réussi",
        discreet_mode: "Mode discret",
        notifications: "Notifications",
        clear_data: "Effacer les données",
        clear_confirm: "Êtes-vous sûr ? Cette action est irréversible.",
        yes: "Oui",
        no: "Non",
        spiritual_reminder: "Rappel",
        no_spiritual: "—",
        onboarding_welcome: "Bienvenue",
        onboarding_desc: "Configure ton espace personnel",
        start: "Commencer",
        select_addictions: "Sélectionne les addictions à suivre",
        craving_logged: "Craving enregistré",
        stay_strong: "Tu gères, continue !",
        minute: "min",
        second: "sec",
        protocol_title: "Protocole 90 secondes",
        protocol_subtitle: "Tu peux reprendre le contrôle.",
        protocol_step1: "Lève-toi",
        protocol_step2: "Bois un verre d'eau",
        protocol_step3: "Lave ton visage à l'eau froide",
        protocol_step4: "Change de pièce",
        protocol_step5: "Respire profondément",
        protocol_moved: "J'ai bougé / je suis sorti de la pièce",
        breathing_title: "Respiration guidée",
        breathing_inhale: "Inspire",
        breathing_hold: "Retiens",
        breathing_exhale: "Expire",
        how_feel_now: "Comment te sens-tu maintenant ?",
        intensity_label: "Intensité de l'envie (1-5)",
        intensity_very_low: "Très faible",
        intensity_very_high: "Très forte",
        show_encouragement: "Afficher un texte d'encouragement",
        back_to_calm: "Retour au calme",
        protocol_complete: "Protocole terminé ! Tu as géré.",
        done: "Terminé",
        you_are_stronger: "Tu es plus fort que tu ne le penses.",
        this_will_pass: "Ce moment va passer.",
        keep_going: "Continue comme ça !",
        one_step_at_time: "Un pas à la fois.",
        breathe_slowly: "Respire lentement..."
    },
    en: {
        app_name: "Revenir",
        app_tagline: "One step at a time",
        today: "Today",
        craving_now: "Craving now",
        checkin: "Check-in",
        settings: "Settings",
        cravings_today: "Cravings today",
        streak: "Streak",
        days: "days",
        step1_title: "1. Cut",
        step1_desc: "Immediately leave the trigger",
        step2_title: "2. Breathe",
        step2_desc: "4-4-6 breathing: inhale 4s, hold 4s, exhale 6s",
        step3_title: "3. Replace",
        step3_desc: "Do a quick action: walk, cold water, call someone",
        timer_start: "Start",
        timer_pause: "Pause",
        timer_reset: "Reset",
        back: "Back",
        save: "Save",
        cancel: "Cancel",
        export_data: "Export data",
        import_data: "Import data",
        language: "Language",
        religion: "Religion",
        religion_none: "None",
        religion_islam: "Islam",
        religion_christianity: "Christianity",
        religion_judaism: "Judaism",
        religion_buddhism: "Buddhism",
        spiritual_cards: "Spiritual cards",
        enabled: "Enabled",
        disabled: "Disabled",
        addictions: "Tracked addictions",
        addiction_porn: "Adult content",
        addiction_cigarette: "Cigarette",
        addiction_alcohol: "Alcohol",
        addiction_drugs: "Substances",
        goal: "Goal",
        goal_abstinence: "Abstinence",
        goal_reduce: "Reduce",
        goal_choice: "My choice",
        mood: "Mood",
        stress: "Stress",
        craving: "Craving",
        solitude: "Loneliness",
        exposure: "Exposure",
        exposure_desc: "Were you exposed to a trigger?",
        notes: "Notes",
        notes_placeholder: "How do you feel?",
        checkin_saved: "Check-in saved",
        history: "History",
        no_checkins: "No check-ins yet",
        import_success: "Import successful",
        import_error: "Import error",
        export_success: "Export successful",
        discreet_mode: "Discreet mode",
        notifications: "Notifications",
        clear_data: "Clear data",
        clear_confirm: "Are you sure? This cannot be undone.",
        yes: "Yes",
        no: "No",
        spiritual_reminder: "Reminder",
        no_spiritual: "—",
        onboarding_welcome: "Welcome",
        onboarding_desc: "Set up your personal space",
        start: "Start",
        select_addictions: "Select addictions to track",
        craving_logged: "Craving logged",
        stay_strong: "You got this, keep going!",
        minute: "min",
        second: "sec",
        protocol_title: "90 Second Protocol",
        protocol_subtitle: "You can regain control.",
        protocol_step1: "Stand up",
        protocol_step2: "Drink a glass of water",
        protocol_step3: "Wash your face with cold water",
        protocol_step4: "Change rooms",
        protocol_step5: "Breathe deeply",
        protocol_moved: "I moved / I left the room",
        breathing_title: "Guided Breathing",
        breathing_inhale: "Inhale",
        breathing_hold: "Hold",
        breathing_exhale: "Exhale",
        how_feel_now: "How do you feel now?",
        intensity_label: "Urge intensity (1-5)",
        intensity_very_low: "Very low",
        intensity_very_high: "Very high",
        show_encouragement: "Show encouragement text",
        back_to_calm: "Back to calm",
        protocol_complete: "Protocol complete! You handled it.",
        done: "Done",
        you_are_stronger: "You are stronger than you think.",
        this_will_pass: "This moment will pass.",
        keep_going: "Keep it up!",
        one_step_at_time: "One step at a time.",
        breathe_slowly: "Breathe slowly..."
    },
    ar: {
        app_name: "عودة",
        app_tagline: "خطوة بخطوة",
        today: "اليوم",
        craving_now: "رغبة الآن",
        checkin: "تسجيل يومي",
        settings: "الإعدادات",
        cravings_today: "الرغبات اليوم",
        streak: "أيام متتالية",
        days: "أيام",
        step1_title: "١. اقطع",
        step1_desc: "غادر المحفز فوراً",
        step2_title: "٢. تنفس",
        step2_desc: "تنفس ٤-٤-٦: شهيق ٤ث، احبس ٤ث، زفير ٦ث",
        step3_title: "٣. استبدل",
        step3_desc: "افعل شيئاً قصيراً: امشِ، ماء بارد، اتصل بأحد",
        timer_start: "ابدأ",
        timer_pause: "توقف",
        timer_reset: "إعادة",
        back: "رجوع",
        save: "حفظ",
        cancel: "إلغاء",
        export_data: "تصدير البيانات",
        import_data: "استيراد البيانات",
        language: "اللغة",
        religion: "الدين",
        religion_none: "بدون",
        religion_islam: "الإسلام",
        religion_christianity: "المسيحية",
        religion_judaism: "اليهودية",
        religion_buddhism: "البوذية",
        spiritual_cards: "البطاقات الروحية",
        enabled: "مفعّلة",
        disabled: "معطّلة",
        addictions: "الإدمانات المتتبعة",
        addiction_porn: "محتوى للبالغين",
        addiction_cigarette: "السجائر",
        addiction_alcohol: "الكحول",
        addiction_drugs: "المواد",
        goal: "الهدف",
        goal_abstinence: "امتناع كامل",
        goal_reduce: "تقليل",
        goal_choice: "اختياري",
        mood: "المزاج",
        stress: "التوتر",
        craving: "الرغبة",
        solitude: "الوحدة",
        exposure: "التعرض",
        exposure_desc: "هل تعرضت لمحفز؟",
        notes: "ملاحظات",
        notes_placeholder: "كيف تشعر؟",
        checkin_saved: "تم الحفظ",
        history: "السجل",
        no_checkins: "لا يوجد تسجيلات بعد",
        import_success: "تم الاستيراد",
        import_error: "خطأ في الاستيراد",
        export_success: "تم التصدير",
        discreet_mode: "الوضع السري",
        notifications: "الإشعارات",
        clear_data: "مسح البيانات",
        clear_confirm: "هل أنت متأكد؟ لا يمكن التراجع.",
        yes: "نعم",
        no: "لا",
        spiritual_reminder: "تذكير",
        no_spiritual: "—",
        onboarding_welcome: "مرحباً",
        onboarding_desc: "أعد مساحتك الشخصية",
        start: "ابدأ",
        select_addictions: "اختر الإدمانات للمتابعة",
        craving_logged: "تم تسجيل الرغبة",
        stay_strong: "أنت قوي، استمر!",
        minute: "د",
        second: "ث",
        protocol_title: "بروتوكول ٩٠ ثانية",
        protocol_subtitle: "يمكنك استعادة السيطرة.",
        protocol_step1: "قف",
        protocol_step2: "اشرب كوب ماء",
        protocol_step3: "اغسل وجهك بالماء البارد",
        protocol_step4: "غيّر الغرفة",
        protocol_step5: "تنفس بعمق",
        protocol_moved: "تحركت / خرجت من الغرفة",
        breathing_title: "تنفس موجه",
        breathing_inhale: "شهيق",
        breathing_hold: "احبس",
        breathing_exhale: "زفير",
        how_feel_now: "كيف تشعر الآن؟",
        intensity_label: "شدة الرغبة (١-٥)",
        intensity_very_low: "ضعيفة جداً",
        intensity_very_high: "قوية جداً",
        show_encouragement: "عرض نص تشجيعي",
        back_to_calm: "العودة للهدوء",
        protocol_complete: "اكتمل البروتوكول! أحسنت.",
        done: "تم",
        you_are_stronger: "أنت أقوى مما تظن.",
        this_will_pass: "هذه اللحظة ستمر.",
        keep_going: "استمر هكذا!",
        one_step_at_time: "خطوة بخطوة.",
        breathe_slowly: "تنفس ببطء..."
    }
};

// Fallback embarqué pour les cartes spirituelles (version minimale)
const FALLBACK_SPIRITUAL = {
    fr: {
        cards: [
            { id: "islam_001", theme: "lower_gaze", addiction: "porn", text: "Baisser le regard protège le cœur et renforce la foi.", ref: "Qur'an 24:30", lang: "fr" },
            { id: "islam_002", theme: "repentance", addiction: "any", text: "Allah accueille toujours celui qui revient sincèrement.", ref: "Qur'an 39:53", lang: "fr" },
            { id: "islam_003", theme: "avoid_paths", addiction: "porn", text: "Ne t'approche pas des chemins qui mènent à la tentation.", ref: "Qur'an 17:32", lang: "fr" },
            { id: "islam_004", theme: "discipline", addiction: "any", text: "Le jeûne est un bouclier contre les désirs.", ref: "Sahih al-Bukhari 5066", lang: "fr" },
            { id: "islam_005", theme: "hope", addiction: "any", text: "La joie d'Allah pour ton repentir est immense.", ref: "Sahih Muslim 2747a", lang: "fr" }
        ]
    },
    en: {
        cards: [
            { id: "islam_001", theme: "lower_gaze", addiction: "porn", text: "Lowering the gaze protects the heart and strengthens faith.", ref: "Qur'an 24:30", lang: "en" },
            { id: "islam_002", theme: "repentance", addiction: "any", text: "Allah always welcomes those who return sincerely.", ref: "Qur'an 39:53", lang: "en" },
            { id: "islam_003", theme: "avoid_paths", addiction: "porn", text: "Do not approach the paths that lead to temptation.", ref: "Qur'an 17:32", lang: "en" },
            { id: "islam_004", theme: "discipline", addiction: "any", text: "Fasting is a shield against desires.", ref: "Sahih al-Bukhari 5066", lang: "en" },
            { id: "islam_005", theme: "hope", addiction: "any", text: "Allah's joy at your repentance is immense.", ref: "Sahih Muslim 2747a", lang: "en" }
        ]
    },
    ar: {
        cards: [
            { id: "islam_001", theme: "lower_gaze", addiction: "porn", text: "غض البصر يحمي القلب ويقوي الإيمان.", ref: "القرآن ٢٤:٣٠", lang: "ar" },
            { id: "islam_002", theme: "repentance", addiction: "any", text: "الله يقبل دائماً من يعود إليه بصدق.", ref: "القرآن ٣٩:٥٣", lang: "ar" },
            { id: "islam_003", theme: "avoid_paths", addiction: "porn", text: "لا تقترب من الطرق التي تؤدي إلى الفتنة.", ref: "القرآن ١٧:٣٢", lang: "ar" },
            { id: "islam_004", theme: "discipline", addiction: "any", text: "الصوم درع ضد الشهوات.", ref: "صحيح البخاري ٥٠٦٦", lang: "ar" },
            { id: "islam_005", theme: "hope", addiction: "any", text: "فرح الله بتوبتك عظيم.", ref: "صحيح مسلم ٢٧٤٧أ", lang: "ar" }
        ]
    }
};

/**
 * Charge les traductions pour une langue donnée
 * @param {string} lang - Code langue (fr, en, ar)
 * @returns {Promise<boolean>} Succès du chargement
 */
async function loadStrings(lang) {
    currentLang = lang;
    
    try {
        // Tenter de charger depuis les fichiers JSON
        const response = await fetch(`data/texts/strings.${lang}.json`);
        if (response.ok) {
            currentStrings = await response.json();
            console.log(`[i18n] Traductions ${lang} chargées depuis JSON`);
            return true;
        }
        throw new Error('Fetch failed');
    } catch (error) {
        // Fallback sur les traductions embarquées
        console.warn(`[i18n] Fallback sur traductions embarquées pour ${lang}`);
        currentStrings = FALLBACK_STRINGS[lang] || FALLBACK_STRINGS.fr;
        return true;
    }
}

/**
 * Charge les cartes spirituelles pour une langue donnée
 * @param {string} lang - Code langue (fr, en, ar)
 * @param {string} religion - Religion (none, islam)
 * @returns {Promise<boolean>} Succès du chargement
 */
async function loadSpiritualCards(lang, religion) {
    if (religion === 'none') {
        currentSpiritualCards = [];
        return true;
    }
    
    try {
        const response = await fetch(`data/texts/spiritual_${religion}.${lang}.json`);
        if (response.ok) {
            const data = await response.json();
            currentSpiritualCards = data.cards || [];
            console.log(`[i18n] Cartes spirituelles ${religion}/${lang} chargées`);
            return true;
        }
        throw new Error('Fetch failed');
    } catch (error) {
        // Fallback sur les cartes embarquées
        console.warn(`[i18n] Fallback sur cartes spirituelles embarquées pour ${lang}`);
        const fallback = FALLBACK_SPIRITUAL[lang] || FALLBACK_SPIRITUAL.fr;
        currentSpiritualCards = fallback.cards || [];
        return true;
    }
}

/**
 * Récupère une traduction par sa clé
 * @param {string} key - Clé de traduction
 * @param {Object} params - Paramètres optionnels pour interpolation
 * @returns {string} Texte traduit
 */
function t(key, params = {}) {
    let text = currentStrings[key] || key;
    
    // Interpolation simple des paramètres {param}
    Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
    });
    
    return text;
}

/**
 * Récupère une carte spirituelle selon le contexte
 * @param {Object} context - { addictionId, theme }
 * @returns {Object|null} Carte spirituelle ou null
 */
function getSpiritualCard(context = {}) {
    if (currentSpiritualCards.length === 0) {
        return null;
    }
    
    let filtered = [...currentSpiritualCards];
    
    // Filtrer par addiction si spécifié
    if (context.addictionId) {
        const byAddiction = filtered.filter(
            c => c.addiction === context.addictionId || c.addiction === 'any'
        );
        if (byAddiction.length > 0) {
            filtered = byAddiction;
        }
    }
    
    // Filtrer par thème si spécifié
    if (context.theme) {
        const byTheme = filtered.filter(c => c.theme === context.theme);
        if (byTheme.length > 0) {
            filtered = byTheme;
        }
    }
    
    // Retourner une carte aléatoire
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
}

/**
 * Retourne la langue courante
 * @returns {string}
 */
function getCurrentLang() {
    return currentLang;
}

/**
 * Vérifie si la langue courante est RTL
 * @returns {boolean}
 */
function isRTL() {
    return currentLang === 'ar';
}

/**
 * Applique la direction RTL au document
 * @param {boolean} rtl - Activer/désactiver RTL
 */
function applyRTL(rtl) {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
}

/**
 * Initialise i18n avec une langue
 * @param {string} lang - Code langue
 * @param {string} religion - Religion pour les cartes
 * @returns {Promise<void>}
 */
async function initI18n(lang, religion = 'none') {
    await loadStrings(lang);
    await loadSpiritualCards(lang, religion);
    applyRTL(lang === 'ar');
}

/**
 * Retourne toutes les cartes spirituelles chargées
 * @returns {Array}
 */
function getSpiritualCards() {
    return currentSpiritualCards || [];
}

// Export global
window.I18n = {
    t,
    loadStrings,
    loadSpiritualCards,
    getSpiritualCard,
    getSpiritualCards,
    getCurrentLang,
    isRTL,
    applyRTL,
    initI18n,
    FALLBACK_STRINGS,
    FALLBACK_SPIRITUAL
};
