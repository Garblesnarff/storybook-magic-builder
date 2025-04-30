
// This file re-exports functionality from the refactored modules
// to maintain backward compatibility with existing code

import { createBook, createBookFromTemplate } from './book/bookCreation';
import { updateBook, deleteBook } from './book/bookOperations';
import { addPage, duplicatePage } from './page/pageCreation';
import { updatePage, deletePage, reorderPage } from './page/pageModification';

// Re-export all functions to maintain the same API
export {
  createBook,
  createBookFromTemplate,
  updateBook,
  deleteBook,
  addPage,
  updatePage,
  deletePage,
  reorderPage,
  duplicatePage
};
