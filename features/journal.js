/**
 * features/journal.js - Journal de bord V3
 * 
 * Fonctionnalités:
 * - Entrées par tags (filtrage facile)
 * - CRUD des entrées
 * - Export JSON du journal
 * - Recherche par date/tags
 */

// ============================================
// TAGS PRÉDÉFINIS
// ============================================

const JOURNAL_TAGS = {
    gratitude: { fr: 'Gratitude', en: 'Gratitude', ar: 'امتنان', icon: '🙏' },
    reflection: { fr: 'Réflexion', en: 'Reflection', ar: 'تأمل', icon: '💭' },
    victory: { fr: 'Victoire', en: 'Victory', ar: 'انتصار', icon: '🏆' },
    struggle: { fr: 'Difficulté', en: 'Struggle', ar: 'صعوبة', icon: '⚡' },
    trigger: { fr: 'Déclencheur', en: 'Trigger', ar: 'محفز', icon: '⚠️' },
    lesson: { fr: 'Leçon', en: 'Lesson', ar: 'درس', icon: '📚' },
    goal: { fr: 'Objectif', en: 'Goal', ar: 'هدف', icon: '🎯' },
    mood: { fr: 'Humeur', en: 'Mood', ar: 'مزاج', icon: '😊' }
};

// ============================================
// MODAL JOURNAL
// ============================================

let journalModalEl = null;
let activeTagFilter = null;
let editingEntryId = null;

/**
 * Ouvre le modal du journal
 * @param {Object} state - State de l'application
 */
function openJournalModal(state) {
    if (!journalModalEl) {
        journalModalEl = document.createElement('div');
        journalModalEl.className = 'modal-overlay';
        journalModalEl.id = 'journalModal';
        document.body.appendChild(journalModalEl);
    }
    
    activeTagFilter = null;
    editingEntryId = null;
    renderJournalContent(state);
    journalModalEl.classList.add('active');
}

/**
 * Ferme le modal du journal
 */
function closeJournalModal() {
    if (journalModalEl) {
        journalModalEl.classList.remove('active');
    }
}

/**
 * Rendu du contenu du journal
 */
function renderJournalContent(state) {
    const lang = state.profile.lang;
    
    const labels = {
        fr: {
            title: '📝 Journal de bord',
            subtitle: 'Tes pensées et réflexions',
            newEntry: 'Nouvelle entrée',
            filterBy: 'Filtrer par tag:',
            all: 'Tous',
            noEntries: 'Aucune entrée encore',
            placeholder: 'Écris tes pensées...',
            save: 'Enregistrer',
            cancel: 'Annuler',
            export: 'Exporter',
            delete: 'Supprimer',
            edit: 'Modifier'
        },
        en: {
            title: '📝 Journal',
            subtitle: 'Your thoughts and reflections',
            newEntry: 'New entry',
            filterBy: 'Filter by tag:',
            all: 'All',
            noEntries: 'No entries yet',
            placeholder: 'Write your thoughts...',
            save: 'Save',
            cancel: 'Cancel',
            export: 'Export',
            delete: 'Delete',
            edit: 'Edit'
        },
        ar: {
            title: '📝 اليوميات',
            subtitle: 'أفكارك وتأملاتك',
            newEntry: 'إدخال جديد',
            filterBy: 'تصفية حسب:',
            all: 'الكل',
            noEntries: 'لا توجد إدخالات',
            placeholder: 'اكتب أفكارك...',
            save: 'حفظ',
            cancel: 'إلغاء',
            export: 'تصدير',
            delete: 'حذف',
            edit: 'تعديل'
        }
    };
    
    const l = labels[lang] || labels.fr;
    
    // Filtrer les entrées
    let entries = state.journal?.entries || [];
    if (activeTagFilter) {
        entries = entries.filter(e => e.tags && e.tags.includes(activeTagFilter));
    }
    // Trier du plus récent au plus ancien
    entries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    journalModalEl.innerHTML = `
        <div class="modal-content journal-modal">
            <button class="modal-close" onclick="Journal.closeJournalModal()">×</button>
            
            <div class="journal-header">
                <h2>${l.title}</h2>
                <p>${l.subtitle}</p>
            </div>
            
            <!-- Bouton nouvelle entrée -->
            <button class="btn btn-primary btn-block mb-md" onclick="Journal.showEntryForm()">
                + ${l.newEntry}
            </button>
            
            <!-- Formulaire d'entrée (caché par défaut) -->
            <div id="journalEntryForm" class="journal-form hidden">
                <textarea id="journalEntryText" class="input journal-textarea" 
                          placeholder="${l.placeholder}"></textarea>
                
                <div class="journal-tags-select">
                    ${Object.entries(JOURNAL_TAGS).map(([key, tag]) => `
                        <button class="chip tag-chip" data-tag="${key}" onclick="Journal.toggleEntryTag('${key}')">
                            ${tag.icon} ${tag[lang] || tag.fr}
                        </button>
                    `).join('')}
                </div>
                
                <div class="journal-form-actions">
                    <button class="btn btn-secondary" onclick="Journal.hideEntryForm()">
                        ${l.cancel}
                    </button>
                    <button class="btn btn-primary" onclick="Journal.saveEntry()">
                        ${l.save}
                    </button>
                </div>
            </div>
            
            <!-- Filtres par tag -->
            <div class="journal-filters">
                <span class="filter-label">${l.filterBy}</span>
                <div class="filter-chips">
                    <button class="chip ${!activeTagFilter ? 'active' : ''}" onclick="Journal.filterByTag(null)">
                        ${l.all}
                    </button>
                    ${Object.entries(JOURNAL_TAGS).map(([key, tag]) => `
                        <button class="chip ${activeTagFilter === key ? 'active' : ''}" onclick="Journal.filterByTag('${key}')">
                            ${tag.icon} ${tag[lang] || tag.fr}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <!-- Liste des entrées -->
            <div class="journal-entries">
                ${entries.length === 0 ? `
                    <div class="empty-state">
                        <p>${l.noEntries}</p>
                    </div>
                ` : entries.map(entry => renderJournalEntry(entry, lang, l)).join('')}
            </div>
            
            <!-- Export -->
            <button class="btn btn-secondary btn-block mt-md" onclick="Journal.exportJournal()">
                📤 ${l.export}
            </button>
        </div>
    `;
}

/**
 * Rend une entrée du journal
 */
function renderJournalEntry(entry, lang, l) {
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString(lang, { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const tagsHtml = (entry.tags || []).map(tagKey => {
        const tag = JOURNAL_TAGS[tagKey];
        if (!tag) return '';
        return `<span class="entry-tag">${tag.icon} ${tag[lang] || tag.fr}</span>`;
    }).join('');
    
    return `
        <div class="journal-entry card" data-id="${entry.id}">
            <div class="entry-header">
                <span class="entry-date">${formattedDate}</span>
                <div class="entry-actions">
                    <button class="btn-icon" onclick="Journal.editEntry('${entry.id}')" title="${l.edit}">✏️</button>
                    <button class="btn-icon btn-danger" onclick="Journal.deleteEntry('${entry.id}')" title="${l.delete}">🗑️</button>
                </div>
            </div>
            <div class="entry-content">
                <p>${escapeHtml(entry.text)}</p>
            </div>
            <div class="entry-tags">
                ${tagsHtml}
            </div>
        </div>
    `;
}

/**
 * Échappe le HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Affiche le formulaire d'entrée
 */
function showEntryForm() {
    const form = document.getElementById('journalEntryForm');
    if (form) {
        form.classList.remove('hidden');
    }
}

/**
 * Cache le formulaire d'entrée
 */
function hideEntryForm() {
    const form = document.getElementById('journalEntryForm');
    if (form) {
        form.classList.add('hidden');
    }
    editingEntryId = null;
    
    // Reset le formulaire
    const textarea = document.getElementById('journalEntryText');
    if (textarea) textarea.value = '';
    
    document.querySelectorAll('.tag-chip').forEach(chip => {
        chip.classList.remove('active');
    });
}

/**
 * Toggle un tag pour l'entrée en cours d'édition
 */
function toggleEntryTag(tagKey) {
    const chip = document.querySelector(`.tag-chip[data-tag="${tagKey}"]`);
    if (chip) {
        chip.classList.toggle('active');
    }
}

/**
 * Sauvegarde une entrée
 */
function saveEntry() {
    const textarea = document.getElementById('journalEntryText');
    const text = textarea?.value.trim();
    
    if (!text) return;
    
    // Récupérer les tags sélectionnés
    const selectedTags = [];
    document.querySelectorAll('.tag-chip.active').forEach(chip => {
        selectedTags.push(chip.dataset.tag);
    });
    
    const entry = {
        id: editingEntryId || 'journal_' + Date.now(),
        date: editingEntryId ? 
            (state.journal.entries.find(e => e.id === editingEntryId)?.date || new Date().toISOString()) :
            new Date().toISOString(),
        text: text,
        tags: selectedTags
    };
    
    if (!state.journal) {
        state.journal = { entries: [] };
    }
    
    if (editingEntryId) {
        const index = state.journal.entries.findIndex(e => e.id === editingEntryId);
        if (index >= 0) {
            state.journal.entries[index] = entry;
        }
    } else {
        state.journal.entries.push(entry);
    }
    
    Storage.saveState(state);
    hideEntryForm();
    renderJournalContent(state);
    
    if (typeof showToast === 'function') {
        const lang = state.profile.lang;
        const messages = {
            fr: 'Entrée enregistrée',
            en: 'Entry saved',
            ar: 'تم حفظ الإدخال'
        };
        showToast(messages[lang] || messages.fr, 'success');
    }
}

/**
 * Édite une entrée existante
 */
function editEntry(entryId) {
    const entry = state.journal?.entries.find(e => e.id === entryId);
    if (!entry) return;
    
    editingEntryId = entryId;
    showEntryForm();
    
    // Remplir le formulaire
    const textarea = document.getElementById('journalEntryText');
    if (textarea) textarea.value = entry.text;
    
    // Sélectionner les tags
    document.querySelectorAll('.tag-chip').forEach(chip => {
        chip.classList.remove('active');
        if (entry.tags && entry.tags.includes(chip.dataset.tag)) {
            chip.classList.add('active');
        }
    });
}

/**
 * Supprime une entrée
 */
function deleteEntry(entryId) {
    if (!state.journal?.entries) return;
    
    state.journal.entries = state.journal.entries.filter(e => e.id !== entryId);
    Storage.saveState(state);
    renderJournalContent(state);
    
    if (typeof showToast === 'function') {
        const lang = state.profile.lang;
        const messages = {
            fr: 'Entrée supprimée',
            en: 'Entry deleted',
            ar: 'تم حذف الإدخال'
        };
        showToast(messages[lang] || messages.fr);
    }
}

/**
 * Filtre par tag
 */
function filterByTag(tagKey) {
    activeTagFilter = tagKey;
    renderJournalContent(state);
}

/**
 * Exporte le journal en JSON
 */
function exportJournal() {
    const data = {
        exportDate: new Date().toISOString(),
        entries: state.journal?.entries || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-${Utils.todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof showToast === 'function') {
        const lang = state.profile.lang;
        const messages = {
            fr: 'Journal exporté',
            en: 'Journal exported',
            ar: 'تم تصدير اليوميات'
        };
        showToast(messages[lang] || messages.fr, 'success');
    }
}

// ============================================
// EXPORTS
// ============================================

window.Journal = {
    // Tags
    JOURNAL_TAGS,
    
    // Modal
    openJournalModal,
    closeJournalModal,
    
    // Form
    showEntryForm,
    hideEntryForm,
    toggleEntryTag,
    saveEntry,
    
    // Entries
    editEntry,
    deleteEntry,
    filterByTag,
    
    // Export
    exportJournal
};
