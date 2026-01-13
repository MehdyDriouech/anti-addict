/**
 * Journal Model - Logique métier
 */

export class JournalModel {
    constructor() {
        this.editingEntryId = null;
        this.activeTagFilter = null;
        this.selectedTags = [];
    }

    reset() {
        this.editingEntryId = null;
        this.selectedTags = [];
    }

    setFilter(tagKey) {
        this.activeTagFilter = tagKey;
    }

    getFilter() {
        return this.activeTagFilter;
    }

    setEditingEntry(entryId) {
        this.editingEntryId = entryId;
    }

    getEditingEntryId() {
        return this.editingEntryId;
    }

    toggleTag(tagKey) {
        const index = this.selectedTags.indexOf(tagKey);
        if (index >= 0) {
            this.selectedTags.splice(index, 1);
        } else {
            this.selectedTags.push(tagKey);
        }
    }

    setSelectedTags(tags) {
        this.selectedTags = [...tags];
    }

    getSelectedTags() {
        return [...this.selectedTags];
    }

    getEntries(state) {
        let entries = state.journal?.entries || [];
        if (this.activeTagFilter) {
            entries = entries.filter(e => e.tags && e.tags.includes(this.activeTagFilter));
        }
        return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    saveEntry(state, text) {
        if (!text.trim()) return null;
        
        const entry = {
            id: this.editingEntryId || 'journal_' + Date.now(),
            date: this.editingEntryId 
                ? (state.journal?.entries.find(e => e.id === this.editingEntryId)?.date || new Date().toISOString())
                : new Date().toISOString(),
            text: text.trim(),
            tags: this.getSelectedTags()
        };
        
        if (!state.journal) state.journal = { entries: [] };
        
        if (this.editingEntryId) {
            const index = state.journal.entries.findIndex(e => e.id === this.editingEntryId);
            if (index >= 0) state.journal.entries[index] = entry;
        } else {
            state.journal.entries.push(entry);
        }
        
        Storage.saveState(state);
        this.reset();
        return entry;
    }

    deleteEntry(state, entryId) {
        if (!state.journal?.entries) return;
        state.journal.entries = state.journal.entries.filter(e => e.id !== entryId);
        Storage.saveState(state);
    }

    getEntryById(state, entryId) {
        return state.journal?.entries?.find(e => e.id === entryId) || null;
    }

    exportData(state) {
        return {
            exportDate: new Date().toISOString(),
            entries: state.journal?.entries || []
        };
    }
}
