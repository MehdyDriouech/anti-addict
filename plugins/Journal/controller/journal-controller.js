/**
 * Journal Controller - Orchestration
 */

import { JournalModel } from '../model/journal-model.js';
import { JournalView } from '../view/journal-view.js';
import { LABELS } from '../data/journal-data.js';

export class JournalController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    open(state) {
        this.model.reset();
        this.model.setFilter(null);
        
        const modalEl = this.view.createModalElement();
        if (!modalEl._hasClickListener) {
            modalEl.addEventListener('click', (e) => {
                if (e.target === modalEl) this.close();
            });
            modalEl._hasClickListener = true;
        }
        
        this.renderContent(state);
        this.view.show();
    }

    close() {
        this.view.hide();
    }

    renderContent(state) {
        const lang = state.profile.lang;
        const entries = this.model.getEntries(state);
        this.view.renderContent(lang, entries, this.model.getFilter());
    }

    showEntryForm() {
        this.view.showForm();
    }

    hideEntryForm() {
        this.view.hideForm();
        this.model.reset();
    }

    toggleEntryTag(tagKey) {
        this.model.toggleTag(tagKey);
        this.view.toggleTagChip(tagKey);
    }

    saveEntry() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const text = this.view.getTextareaValue();
        // Sync selected tags from DOM
        const selectedTags = [];
        document.querySelectorAll('.tag-chip.active').forEach(chip => {
            selectedTags.push(chip.dataset.tag);
        });
        this.model.setSelectedTags(selectedTags);
        
        const entry = this.model.saveEntry(state, text);
        if (entry) {
            this.view.hideForm();
            this.renderContent(state);
            
            const lang = state.profile.lang;
            const l = LABELS[lang] || LABELS.fr;
            if (typeof showToast === 'function') showToast(l.entrySaved, 'success');
        }
    }

    editEntry(entryId) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const entry = this.model.getEntryById(state, entryId);
        if (!entry) return;
        
        this.model.setEditingEntry(entryId);
        this.model.setSelectedTags(entry.tags || []);
        this.view.showForm();
        this.view.fillForm(entry.text, entry.tags);
    }

    deleteEntry(entryId) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        this.model.deleteEntry(state, entryId);
        this.renderContent(state);
        
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        if (typeof showToast === 'function') showToast(l.entryDeleted);
    }

    filterByTag(tagKey) {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        this.model.setFilter(tagKey);
        this.renderContent(state);
    }

    exportJournal() {
        const state = typeof window !== 'undefined' ? window.state : null;
        if (!state) return;
        
        const data = this.model.exportData(state);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal-${Utils.todayISO()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const lang = state.profile.lang;
        const l = LABELS[lang] || LABELS.fr;
        if (typeof showToast === 'function') showToast(l.journalExported, 'success');
    }
}
