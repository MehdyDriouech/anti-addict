/**
 * Actions Data - Constantes et configuration
 */

export const PREDEFINED_ACTIONS = {
    // Mouvement
    walk_2min: { 
        emoji: '🚶', 
        category: 'movement',
        name: { fr: 'Marcher 2 minutes', en: 'Walk 2 minutes', ar: 'المشي دقيقتين' }
    },
    pushups: { 
        emoji: '💪', 
        category: 'movement',
        name: { fr: 'Faire des pompes', en: 'Do push-ups', ar: 'تمارين الضغط' }
    },
    squats: { 
        emoji: '🦵', 
        category: 'movement',
        name: { fr: 'Faire des squats', en: 'Do squats', ar: 'تمارين القرفصاء' }
    },
    stretch: { 
        emoji: '🧘', 
        category: 'movement',
        name: { fr: 'S\'étirer', en: 'Stretch', ar: 'تمدد' }
    },
    leave_room: { 
        emoji: '🚪', 
        category: 'movement',
        name: { fr: 'Quitter la pièce', en: 'Leave the room', ar: 'غادر الغرفة' }
    },
    
    // Respiration / Calme
    breathing_446: { 
        emoji: '🌬️', 
        category: 'calm',
        name: { fr: 'Respiration 4-4-6', en: 'Breathing 4-4-6', ar: 'تنفس 4-4-6' }
    },
    cold_water: { 
        emoji: '💧', 
        category: 'calm',
        name: { fr: 'Eau froide sur le visage', en: 'Cold water on face', ar: 'ماء بارد على الوجه' }
    },
    drink_water: { 
        emoji: '🥤', 
        category: 'calm',
        name: { fr: 'Boire un verre d\'eau', en: 'Drink water', ar: 'اشرب ماء' }
    },
    shower: { 
        emoji: '🚿', 
        category: 'calm',
        name: { fr: 'Prendre une douche', en: 'Take a shower', ar: 'الاستحمام' }
    },
    
    // Social
    call_friend: { 
        emoji: '📞', 
        category: 'social',
        name: { fr: 'Appeler un ami', en: 'Call a friend', ar: 'اتصل بصديق' }
    },
    text_someone: { 
        emoji: '💬', 
        category: 'social',
        name: { fr: 'Envoyer un message', en: 'Text someone', ar: 'أرسل رسالة' }
    },
    go_public: { 
        emoji: '🏪', 
        category: 'social',
        name: { fr: 'Aller dans un lieu public', en: 'Go to a public place', ar: 'اذهب لمكان عام' }
    },
    
    // Diversion
    read_book: { 
        emoji: '📖', 
        category: 'diversion',
        name: { fr: 'Lire un livre', en: 'Read a book', ar: 'اقرأ كتاباً' }
    },
    play_music: { 
        emoji: '🎵', 
        category: 'diversion',
        name: { fr: 'Écouter de la musique', en: 'Listen to music', ar: 'استمع للموسيقى' }
    },
    hobby: { 
        emoji: '🎨', 
        category: 'diversion',
        name: { fr: 'Pratiquer un hobby', en: 'Practice a hobby', ar: 'مارس هواية' }
    },
    
    // Tech
    close_app: { 
        emoji: '❌', 
        category: 'tech',
        name: { fr: 'Fermer l\'application', en: 'Close the app', ar: 'أغلق التطبيق' }
    },
    phone_out_bedroom: { 
        emoji: '📵', 
        category: 'tech',
        name: { fr: 'Téléphone hors chambre', en: 'Phone out of bedroom', ar: 'الهاتف خارج الغرفة' }
    },
    airplane_mode: { 
        emoji: '✈️', 
        category: 'tech',
        name: { fr: 'Mode avion', en: 'Airplane mode', ar: 'وضع الطيران' }
    },
    
    // Mental
    mental_reset: { 
        emoji: '🧠', 
        category: 'mental',
        name: { fr: 'Reset mental', en: 'Mental reset', ar: 'إعادة ضبط ذهني' }
    },
    gratitude: { 
        emoji: '🙏', 
        category: 'mental',
        name: { fr: 'Penser à 3 gratitudes', en: 'Think of 3 gratitudes', ar: 'فكر في 3 نعم' }
    },
    urge_surf: { 
        emoji: '🌊', 
        category: 'mental',
        name: { fr: 'Urge surfing', en: 'Urge surfing', ar: 'ركوب الموجة' }
    }
};

export const CATEGORIES = {
    movement: { fr: 'Mouvement', en: 'Movement', ar: 'حركة', emoji: '🏃' },
    calm: { fr: 'Calme', en: 'Calm', ar: 'هدوء', emoji: '😌' },
    social: { fr: 'Social', en: 'Social', ar: 'اجتماعي', emoji: '👥' },
    diversion: { fr: 'Diversion', en: 'Diversion', ar: 'تشتيت', emoji: '🎮' },
    tech: { fr: 'Tech', en: 'Tech', ar: 'تقنية', emoji: '📱' },
    mental: { fr: 'Mental', en: 'Mental', ar: 'ذهني', emoji: '🧠' },
    custom: { fr: 'Personnalisé', en: 'Custom', ar: 'مخصص', emoji: '✨' }
};

export const LABELS = {
    fr: {
        title: '📚 Ma bibliothèque d\'actions',
        subtitle: 'Ce qui marche pour moi',
        addNew: 'Ajouter une action',
        favorites: 'Favoris',
        all: 'Toutes',
        noFavorites: 'Aucun favori. Appuie sur ⭐ pour ajouter.',
        delete: 'Supprimer',
        name: 'Nom de l\'action',
        emoji: 'Emoji',
        save: 'Enregistrer',
        newAction: 'Nouvelle action',
        back: 'Retour',
        randomAction: 'Action aléatoire',
        more: 'Plus d\'actions',
        actionDone: 'Action faite !',
        added: 'Ajouté',
        nameRequired: 'Nom requis',
        confirmDelete: 'Supprimer cette action ?'
    },
    en: {
        title: '📚 My action library',
        subtitle: 'What works for me',
        addNew: 'Add an action',
        favorites: 'Favorites',
        all: 'All',
        noFavorites: 'No favorites. Tap ⭐ to add.',
        delete: 'Delete',
        name: 'Action name',
        emoji: 'Emoji',
        save: 'Save',
        newAction: 'New action',
        back: 'Back',
        randomAction: 'Random action',
        more: 'More actions',
        actionDone: 'Action done!',
        added: 'Added',
        nameRequired: 'Name required',
        confirmDelete: 'Delete this action?'
    },
    ar: {
        title: '📚 مكتبة أفعالي',
        subtitle: 'ما يناسبني',
        addNew: 'إضافة فعل',
        favorites: 'المفضلة',
        all: 'الكل',
        noFavorites: 'لا مفضلات. اضغط ⭐ للإضافة.',
        delete: 'حذف',
        name: 'اسم الفعل',
        emoji: 'إيموجي',
        save: 'حفظ',
        newAction: 'فعل جديد',
        back: 'رجوع',
        randomAction: 'فعل عشوائي',
        more: 'المزيد من الأفعال',
        actionDone: 'تم الفعل!',
        added: 'تم الإضافة',
        nameRequired: 'الاسم مطلوب',
        confirmDelete: 'حذف هذا الفعل؟'
    }
};

export const EMOJI_OPTIONS = ['💪', '🚶', '📞', '🧘', '🎵', '📖', '🏃', '🌊', '⭐', '🌟', '💫', '🔥', '✨', '🎯'];
