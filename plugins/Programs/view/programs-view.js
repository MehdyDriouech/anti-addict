/**
 * Programs View - Rendu HTML
 */

import { LABELS } from '../data/programs-data.js';

export class ProgramsView {
    constructor() { this.programModalEl = null; this.selectModalEl = null; }

    createProgramModal() {
        if (!this.programModalEl) {
            this.programModalEl = document.createElement('div');
            this.programModalEl.className = 'modal-overlay';
            this.programModalEl.id = 'programModal';
            document.body.appendChild(this.programModalEl);
        }
        return this.programModalEl;
    }

    createSelectModal() {
        if (!this.selectModalEl) {
            this.selectModalEl = document.createElement('div');
            this.selectModalEl.className = 'modal-overlay';
            this.selectModalEl.id = 'programSelectModal';
            document.body.appendChild(this.selectModalEl);
        }
        return this.selectModalEl;
    }

    showProgram() { if (this.programModalEl) this.programModalEl.classList.add('active'); }
    hideProgram() { if (this.programModalEl) this.programModalEl.classList.remove('active'); }
    showSelect() { if (this.selectModalEl) this.selectModalEl.classList.add('active'); }
    hideSelect() { if (this.selectModalEl) this.selectModalEl.classList.remove('active'); }

    renderExercise(exercise, savedData, lang) {
        if (!exercise) return '';
        const l = LABELS[lang] || LABELS.fr;
        const sv = savedData || {};
        
        if (exercise.type === 'if_then') {
            return `<p class="exercise-prompt">${exercise.prompt}</p>${exercise.example ? `<p class="exercise-example"><em>${l.example}: ${exercise.example}</em></p>` : ''}
                <div class="if-then-form"><div class="form-group"><label>${l.if}</label><input type="text" class="input" data-field="if_condition" value="${sv.if_condition || ''}" placeholder="${l.if}"></div>
                <div class="form-group"><label>${l.then}</label><input type="text" class="input" data-field="then_action" value="${sv.then_action || ''}" placeholder="${l.then}"></div></div>`;
        }
        if (exercise.type === 'cognitive') {
            return `<p class="exercise-prompt">${exercise.prompt}</p><div class="cognitive-form"><div class="form-group"><label>❌ ${l.thought}</label><textarea class="input" data-field="automatic_thought" rows="2" placeholder="${l.thought}">${sv.automatic_thought || ''}</textarea></div>
                <div class="arrow">↓</div><div class="form-group"><label>✓ ${l.realistic}</label><textarea class="input" data-field="realistic_thought" rows="2" placeholder="${l.realistic}">${sv.realistic_thought || ''}</textarea></div></div>`;
        }
        if (exercise.type === 'gratitude') {
            const fields = exercise.fields || ['gratitude1', 'gratitude2', 'gratitude3'];
            return `<p class="exercise-prompt">${exercise.prompt}</p><div class="gratitude-list">${fields.map((f, i) => `<div class="gratitude-item"><span class="gratitude-number">${i + 1}.</span><input type="text" class="input" data-field="${f}" value="${sv[f] || ''}" placeholder="..."></div>`).join('')}</div>`;
        }
        if (exercise.type === 'urge_surfing') {
            const timer = exercise.timer || 90;
            return `<p class="exercise-prompt">${exercise.prompt}</p><div class="urge-surfing-container"><div class="timer-display" id="urgeSurfingTimer">${timer}</div><p class="timer-label">${l.seconds}</p><button class="btn btn-primary" onclick="Programs.startUrgeSurfing(${timer})" id="urgeSurfingBtn">▶ ${l.startExercise}</button></div>`;
        }
        const fields = exercise.fields || ['response'];
        return `<p class="exercise-prompt">${exercise.prompt}</p>${fields.map(f => `<textarea class="input exercise-textarea" data-field="${f}" placeholder="${f}" rows="3">${sv[f] || ''}</textarea>`).join('')}`;
    }

    renderDayContent(lang, dayData, day, totalDays, isCompleted, progress) {
        const l = LABELS[lang] || LABELS.fr;
        this.programModalEl.innerHTML = `
            <div class="modal-content program-modal"><button class="modal-close" onclick="Programs.close()">×</button>
                <div class="program-header"><div class="program-progress"><span class="progress-text">${l.day} ${day} ${l.of} ${totalDays}</span><div class="progress-bar"><div class="progress-fill" style="width: ${(day / totalDays) * 100}%"></div></div></div>
                    <h2 class="day-title">${dayData.title}</h2>${isCompleted ? '<span class="completed-badge">✓</span>' : ''}</div>
                <div class="program-section lesson-section"><h3>📚 ${l.lesson}</h3><p class="lesson-text">${dayData.lesson}</p></div>
                <div class="program-section exercise-section"><h3>✏️ ${l.exercise}</h3>${this.renderExercise(dayData.exercise, progress?.exerciseData, lang)}</div>
                <div class="program-actions">${day > 1 ? `<button class="btn btn-ghost" onclick="Programs.goToDay(${day - 1})">← ${l.prev}</button>` : '<div></div>'}
                    ${!isCompleted ? `<button class="btn btn-primary" onclick="Programs.completeDay(${day})">✓ ${l.complete}</button>` : day < totalDays ? `<button class="btn btn-primary" onclick="Programs.goToDay(${day + 1})">${l.next} →</button>` : `<button class="btn btn-primary" onclick="Programs.finish()">🎉 ${l.finished}</button>`}</div>
            </div>`;
    }

    renderSelectModal(lang, hasActive, activeProgram) {
        const l = LABELS[lang] || LABELS.fr;
        const activeId = hasActive ? activeProgram.id : null;
        this.selectModalEl.innerHTML = `
            <div class="modal-content program-select-modal"><button class="modal-close" onclick="Programs.closeSelect()">×</button>
                <h2>${l.title}</h2><p>${l.subtitle}</p>
                ${hasActive ? `<div class="active-program-card"><span class="badge">${l.activeProgram}</span><h4>${activeId === 'program_14' ? l.program14 : l.program30}</h4><p>${l.day} ${activeProgram.currentDay}</p><button class="btn btn-primary" onclick="Programs.closeSelect(); Programs.resume();">${l.resume} →</button></div><p class="change-program-hint">${l.changeProgram} :</p>` : ''}
                <div class="program-cards">
                    <div class="program-card ${activeId === 'program_14' ? 'current' : ''}" onclick="Programs.switchProgram('program_14')"><div class="program-icon">📖</div><h3>${l.program14}</h3><p>${l.program14Desc}</p><span class="program-duration">14 ${lang === 'ar' ? 'يوم' : 'days'}</span>${activeId === 'program_14' ? `<span class="current-badge">${l.activeProgram}</span>` : ''}</div>
                    <div class="program-card ${activeId === 'program_30' ? 'current' : ''}" onclick="Programs.switchProgram('program_30')"><div class="program-icon">📚</div><h3>${l.program30}</h3><p>${l.program30Desc}</p><span class="program-duration">30 ${lang === 'ar' ? 'يوم' : 'days'}</span>${activeId === 'program_30' ? `<span class="current-badge">${l.activeProgram}</span>` : ''}</div>
                </div>
            </div>`;
    }

    renderWidget(lang, hasActive, activeProgram) {
        const l = LABELS[lang] || LABELS.fr;
        if (hasActive) return `<div class="program-widget active" onclick="Programs.resume()"><span class="widget-icon">📖</span><span class="widget-text">${l.day} ${activeProgram.currentDay}</span><span class="widget-action">${l.continue} →</span></div>`;
        return `<button class="btn btn-secondary program-widget-btn" onclick="Programs.openSelect()">📚 ${l.programs}</button>`;
    }
}
