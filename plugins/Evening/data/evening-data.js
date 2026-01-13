/**
 * Evening Data - Constantes et labels
 */

export const HELPED_SUGGESTIONS = {
    fr: ['Marcher', 'Respirer', 'Appeler un ami', 'Faire du sport', 'Lire', 'Méditer', 'Sortir'],
    en: ['Walking', 'Breathing', 'Calling a friend', 'Exercising', 'Reading', 'Meditating', 'Going outside'],
    ar: ['المشي', 'التنفس', 'الاتصال بصديق', 'الرياضة', 'القراءة', 'التأمل', 'الخروج']
};

// Questions d'exposition contextuelles par addiction
export const EXPOSURE_QUESTIONS = {
    fr: {
        porn: 'As-tu été exposé à du contenu adulte aujourd\'hui ?',
        cigarette: 'As-tu fumé aujourd\'hui ?',
        alcohol: 'As-tu bu de l\'alcool aujourd\'hui ?',
        drugs: 'As-tu consommé des substances aujourd\'hui ?',
        social_media: 'As-tu fait un usage excessif des réseaux sociaux aujourd\'hui ?',
        gaming: 'As-tu joué de manière excessive aujourd\'hui ?',
        food: 'As-tu fait des excès alimentaires aujourd\'hui ?',
        shopping: 'As-tu fait des achats compulsifs aujourd\'hui ?'
    },
    en: {
        porn: 'Were you exposed to adult content today?',
        cigarette: 'Did you smoke today?',
        alcohol: 'Did you drink alcohol today?',
        drugs: 'Did you use substances today?',
        social_media: 'Did you overuse social media today?',
        gaming: 'Did you game excessively today?',
        food: 'Did you overeat today?',
        shopping: 'Did you shop compulsively today?'
    },
    ar: {
        porn: 'هل تعرضت لمحتوى للبالغين اليوم؟',
        cigarette: 'هل دخنت اليوم؟',
        alcohol: 'هل شربت الكحول اليوم؟',
        drugs: 'هل استخدمت مواد اليوم؟',
        social_media: 'هل أفرطت في استخدام وسائل التواصل اليوم؟',
        gaming: 'هل لعبت بشكل مفرط اليوم؟',
        food: 'هل أفرطت في الأكل اليوم؟',
        shopping: 'هل تسوقت بشكل قسري اليوم؟'
    }
};

export const LABELS = {
    fr: {
        title: '🌙 Rituel du soir',
        subtitle: '2 minutes pour clôturer la journée',
        exposed: 'As-tu été exposé à du contenu adulte aujourd\'hui ?', // Fallback
        yes: 'Oui',
        no: 'Non',
        helped: 'Qu\'est-ce qui t\'a aidé aujourd\'hui ?',
        helpedPlaceholder: 'Ex: marcher, respirer, parler à quelqu\'un...',
        gratitude: 'Un mot de gratitude',
        gratitudePlaceholder: 'Ex: famille, santé, progrès...',
        save: 'Terminer le rituel',
        // Summary
        titleComplete: 'Rituel terminé !',
        summary: 'Résumé de ta journée',
        exposedLabel: 'Exposition',
        exposedYes: 'Oui - demain sera différent',
        exposedNo: 'Non - bravo !',
        helpedLabel: 'Ce qui a aidé',
        gratitudeLabel: 'Gratitude',
        tomorrow: 'Intention pour demain',
        close: 'Fermer',
        goodNight: 'Bonne nuit 🌙'
    },
    en: {
        title: '🌙 Evening ritual',
        subtitle: '2 minutes to close the day',
        exposed: 'Were you exposed to adult content today?',
        yes: 'Yes',
        no: 'No',
        helped: 'What helped you today?',
        helpedPlaceholder: 'Ex: walking, breathing, talking to someone...',
        gratitude: 'One word of gratitude',
        gratitudePlaceholder: 'Ex: family, health, progress...',
        save: 'Complete ritual',
        // Summary
        titleComplete: 'Ritual complete!',
        summary: 'Summary of your day',
        exposedLabel: 'Exposure',
        exposedYes: 'Yes - tomorrow will be different',
        exposedNo: 'No - well done!',
        helpedLabel: 'What helped',
        gratitudeLabel: 'Gratitude',
        tomorrow: 'Intention for tomorrow',
        close: 'Close',
        goodNight: 'Good night 🌙'
    },
    ar: {
        title: '🌙 طقس المساء',
        subtitle: 'دقيقتان لإنهاء اليوم',
        exposed: 'هل تعرضت لمحتوى للبالغين اليوم؟',
        yes: 'نعم',
        no: 'لا',
        helped: 'ما الذي ساعدك اليوم؟',
        helpedPlaceholder: 'مثال: المشي، التنفس، التحدث مع شخص...',
        gratitude: 'كلمة امتنان واحدة',
        gratitudePlaceholder: 'مثال: العائلة، الصحة، التقدم...',
        save: 'إنهاء الطقس',
        // Summary
        titleComplete: 'اكتمل الطقس!',
        summary: 'ملخص يومك',
        exposedLabel: 'التعرض',
        exposedYes: 'نعم - غدًا سيكون مختلفًا',
        exposedNo: 'لا - أحسنت!',
        helpedLabel: 'ما ساعد',
        gratitudeLabel: 'الامتنان',
        tomorrow: 'نية الغد',
        close: 'إغلاق',
        goodNight: 'تصبح على خير 🌙'
    }
};
