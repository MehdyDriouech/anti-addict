/**
 * Journal View - Rendu HTML
 */

import { JOURNAL_TAGS, LABELS } from '../data/journal-data.js';

export class JournalView {
    constructor() {
        this.modalEl = null;
    }

    createModalElement() {
        if (!this.modalEl) {
            this.modalEl = document.createElement('div');
            this.modalEl.className = 'modal-overlay';
            this.modalEl.id = 'journalModal';
            document.body.appendChild(this.modalEl);
        }
        return this.modalEl;
    }

    getModalElement() { return this.modalEl; }
    show() { if (this.modalEl) this.modalEl.classList.add('active'); }
    hide() { if (this.modalEl) this.modalEl.classList.remove('active'); }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderEntry(entry, lang, l) {
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString(lang, { 
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
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
                    <p>${this.escapeHtml(entry.text)}</p>
                </div>
                <div class="entry-tags">${tagsHtml}</div>
            </div>
        `;
    }

    renderContent(lang, entries, activeTagFilter) {
        const l = LABELS[lang] || LABELS.fr;
        
        this.modalEl.innerHTML = `
            <div class="modal-content journal-modal">
                <button class="modal-close" onclick="Journal.closeJournalModal()">×</button>
                
                <div class="journal-header">
                    <h2>${l.title}</h2>
                    <p>${l.subtitle}</p>
                </div>
                
                <button class="btn btn-primary btn-block mb-md" onclick="Journal.showEntryForm()">
                    + ${l.newEntry}
                </button>
                
                <div id="journalEntryForm" class="journal-form hidden">
                    <textarea id="journalEntryText" class="input journal-textarea" placeholder="${l.placeholder}"></textarea>
                    
                    <div class="journal-tags-select">
                        ${Object.entries(JOURNAL_TAGS).map(([key, tag]) => `
                            <button class="chip tag-chip" data-tag="${key}" onclick="Journal.toggleEntryTag('${key}')">
                                ${tag.icon} ${tag[lang] || tag.fr}
                            </button>
                        `).join('')}
                    </div>
                    
                    <div class="journal-form-actions">
                        <button class="btn btn-secondary" onclick="Journal.hideEntryForm()">${l.cancel}</button>
                        <button class="btn btn-primary" onclick="Journal.saveEntry()">${l.save}</button>
                    </div>
                </div>
                
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
                
                <div class="journal-entries">
                    ${entries.length === 0 ? `<div class="empty-state"><p>${l.noEntries}</p></div>` 
                        : entries.map(entry => this.renderEntry(entry, lang, l)).join('')}
                </div>
                
                <button class="btn btn-secondary btn-block mt-md" onclick="Journal.exportJournal()">
                    📤 ${l.export}
                </button>
            </div>
        `;
    }

    showForm() {
        const form = document.getElementById('journalEntryForm');
        if (form) form.classList.remove('hidden');
    }

    hideForm() {
        const form = document.getElementById('journalEntryForm');
        if (form) form.classList.add('hidden');
        const textarea = document.getElementById('journalEntryText');
        if (textarea) textarea.value = '';
        document.querySelectorAll('.tag-chip').forEach(chip => chip.classList.remove('active'));
    }

    fillForm(text, tags) {
        const textarea = document.getElementById('journalEntryText');
        if (textarea) textarea.value = text;
        document.querySelectorAll('.tag-chip').forEach(chip => {
            chip.classList.remove('active');
            if (tags && tags.includes(chip.dataset.tag)) chip.classList.add('active');
        });
    }

    toggleTagChip(tagKey) {
        const chip = document.querySelector(`.tag-chip[data-tag="${tagKey}"]`);
        if (chip) chip.classList.toggle('active');
    }

    getTextareaValue() {
        return document.getElementById('journalEntryText')?.value || '';
    }
}
