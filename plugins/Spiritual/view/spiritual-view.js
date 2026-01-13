/**
 * Spiritual View - Rendu HTML
 */

import { PLAYLIST_CONTEXTS, PRESET_GOALS, LABELS } from '../data/spiritual-data.js';

export class SpiritualView {
    constructor() { this.modalEl = null; this.playlistModalEl = null; }

    createModalElement() {
        if (!this.modalEl) {
            this.modalEl = document.createElement('div');
            this.modalEl.className = 'modal-overlay';
            this.modalEl.id = 'spiritualModal';
            document.body.appendChild(this.modalEl);
        }
        return this.modalEl;
    }

    createPlaylistModal() {
        if (!this.playlistModalEl) {
            this.playlistModalEl = document.createElement('div');
            this.playlistModalEl.className = 'modal-overlay';
            this.playlistModalEl.id = 'playlistModal';
            document.body.appendChild(this.playlistModalEl);
        }
        return this.playlistModalEl;
    }

    show() { if (this.modalEl) this.modalEl.classList.add('active'); }
    hide() { if (this.modalEl) this.modalEl.classList.remove('active'); }
    showPlaylist() { if (this.playlistModalEl) this.playlistModalEl.classList.add('active'); }
    hidePlaylist() { if (this.playlistModalEl) this.playlistModalEl.classList.remove('active'); }

    renderModal(lang, dhikrCount, todayGoals) {
        const l = LABELS[lang] || LABELS.fr;
        const presets = PRESET_GOALS[lang] || PRESET_GOALS.fr;
        
        this.modalEl.innerHTML = `
            <div class="modal-content spiritual-modal">
                <button class="modal-close" onclick="Spiritual.close()">×</button>
                <h2>${l.title}</h2>
                <div class="spiritual-section dhikr-section"><h3>🧿 ${l.dhikr}</h3>
                    <div class="dhikr-counter">
                        <button class="dhikr-btn" onclick="Spiritual.decrementDhikr()">−</button>
                        <span class="dhikr-value" id="dhikrValue">${dhikrCount}</span>
                        <button class="dhikr-btn primary" onclick="Spiritual.incrementDhikr()">+</button>
                    </div>
                    <button class="btn btn-ghost btn-small" onclick="Spiritual.resetDhikr()">${l.reset}</button>
                </div>
                <div class="spiritual-section goals-section"><h3>🎯 ${l.goals}</h3>
                    <div class="goals-list">
                        ${todayGoals.length === 0 ? `<p class="empty-message">${l.noGoals}</p>` : todayGoals.map((goal, idx) => `
                            <div class="goal-item ${goal.completed ? 'completed' : ''}" onclick="Spiritual.toggleGoal(${idx})">
                                <span class="goal-check">${goal.completed ? '✓' : '○'}</span>
                                <span class="goal-text">${goal.text}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="add-goal-form">
                        <select id="presetGoal" class="input"><option value="">${l.addGoal}...</option>${presets.map((g, i) => `<option value="${i}">${g}</option>`).join('')}</select>
                        <button class="btn btn-small btn-primary" onclick="Spiritual.addPresetGoal()">+</button>
                    </div>
                </div>
                <div class="spiritual-section playlists-section"><h3>🃏 ${l.playlists}</h3>
                    <div class="playlist-buttons">${Object.entries(PLAYLIST_CONTEXTS).map(([ctx, info]) => `
                        <button class="btn btn-secondary playlist-btn" onclick="Spiritual.showPlaylist('${ctx}')">${info.emoji} ${info[lang] || info.fr}</button>
                    `).join('')}</div>
                </div>
            </div>
        `;
    }

    renderPlaylistModal(lang, context, cards) {
        const l = LABELS[lang] || LABELS.fr;
        const contextInfo = PLAYLIST_CONTEXTS[context];
        
        this.playlistModalEl.innerHTML = `
            <div class="modal-content playlist-modal">
                <button class="modal-close" onclick="Spiritual.closePlaylist()">×</button>
                <h2>${contextInfo.emoji} ${contextInfo[lang] || contextInfo.fr}</h2>
                <div class="spiritual-cards-carousel">
                    ${cards.length === 0 ? `<p class="empty-message">${l.noCards}</p>` : cards.map((card, idx) => `
                        <div class="spiritual-card ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                            <p class="card-text">"${card.text}"</p><cite class="card-ref">— ${card.ref}</cite>
                        </div>
                    `).join('')}
                </div>
                ${cards.length > 1 ? `<button class="btn btn-secondary" onclick="Spiritual.nextCard()">${l.next} →</button>` : ''}
                <button class="btn btn-ghost" onclick="Spiritual.closePlaylist(); Spiritual.open(state);">← ${l.back}</button>
            </div>
        `;
    }

    updateDhikrDisplay(count) {
        const el = document.getElementById('dhikrValue');
        if (el) el.textContent = count;
    }

    nextCard() {
        const cards = document.querySelectorAll('.spiritual-cards-carousel .spiritual-card');
        if (cards.length <= 1) return;
        let activeIndex = 0;
        cards.forEach((card, idx) => { if (card.classList.contains('active')) { activeIndex = idx; card.classList.remove('active'); } });
        cards[(activeIndex + 1) % cards.length].classList.add('active');
    }

    renderWidget(lang, dhikrCount) {
        const l = LABELS[lang] || LABELS.fr;
        return `<button class="btn btn-secondary spiritual-widget-btn" onclick="Spiritual.open(state)">📿 ${l.spiritual} ${dhikrCount > 0 ? `(${dhikrCount})` : ''}</button>`;
    }
}
