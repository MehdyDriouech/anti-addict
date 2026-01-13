/**
 * Journal Plugin - Point d'entrée
 */

import { JournalModel } from './model/journal-model.js';
import { JournalView } from './view/journal-view.js';
import { JournalController } from './controller/journal-controller.js';
import { JOURNAL_TAGS } from './data/journal-data.js';

const journalModel = new JournalModel();
const journalView = new JournalView();
const journalController = new JournalController(journalModel, journalView);

const Journal = {
    JOURNAL_TAGS,
    
    openJournalModal: (state) => journalController.open(state),
    closeJournalModal: () => journalController.close(),
    
    showEntryForm: () => journalController.showEntryForm(),
    hideEntryForm: () => journalController.hideEntryForm(),
    toggleEntryTag: (tagKey) => journalController.toggleEntryTag(tagKey),
    saveEntry: () => journalController.saveEntry(),
    
    editEntry: (entryId) => journalController.editEntry(entryId),
    deleteEntry: (entryId) => journalController.deleteEntry(entryId),
    filterByTag: (tagKey) => journalController.filterByTag(tagKey),
    
    exportJournal: () => journalController.exportJournal()
};

window.Journal = Journal;

export default Journal;
