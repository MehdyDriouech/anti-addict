/**
 * Commitments Model - Logique métier pour les engagements
 */

import { PROGRAM_LABELS } from '../data/commitments-data.js';

export class CommitmentsModel {
    /**
     * Récupère tous les engagements depuis les programmes
     * @param {Object} state - State de l'application
     * @returns {Array} Liste des engagements formatés
     */
    getAllCommitments(state) {
        const commitments = [];
        const lang = state?.profile?.lang || 'fr';
        
        // Parcourir tous les programmes
        const programs = ['program_14', 'program_30'];
        
        programs.forEach(programId => {
            const dayProgress = state.programs?.dayProgress?.[programId] || {};
            
            Object.entries(dayProgress).forEach(([day, progress]) => {
                if (progress.exerciseData) {
                    // Vérifier si c'est un exercice de type commitment
                    // Les jours 14 et 30 ont des exercices commitment
                    const isCommitmentDay = (programId === 'program_14' && day === '14') || 
                                           (programId === 'program_30' && day === '30');
                    
                    if (isCommitmentDay && progress.exerciseData.commitment) {
                        const programLabel = PROGRAM_LABELS[programId]?.[lang] || PROGRAM_LABELS[programId]?.fr;
                        
                        commitments.push({
                            programId,
                            programLabel,
                            day: parseInt(day),
                            date: progress.completedAt || null,
                            commitment: progress.exerciseData.commitment,
                            keyLesson: progress.exerciseData.key_lesson || null,
                            celebration: progress.exerciseData.celebration || null
                        });
                    }
                }
            });
        });
        
        // Récupérer les engagements depuis les intentions
        const intentionsHistory = state.intentions?.history || [];
        intentionsHistory.forEach(intention => {
            if (intention.engaged === true && intention.text) {
                const programLabel = PROGRAM_LABELS.intentions?.[lang] || PROGRAM_LABELS.intentions?.fr;
                
                commitments.push({
                    programId: 'intentions',
                    programLabel,
                    day: null,
                    date: intention.date || null,
                    commitment: intention.text,
                    keyLesson: null,
                    celebration: null
                });
            }
        });
        
        // Trier par date (plus récent en premier)
        return commitments.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date) - new Date(a.date);
        });
    }
    
}
