
// This file re-exports functionality from the refactored modules
// to maintain backward compatibility with existing code

import { createBook, createBookFromTemplate } from './book/bookCreation';
import { updateBook, deleteBook } from './book/bookOperations';
import { addPage, duplicatePage } from './page/pageCreation';
import { updatePage, deletePage, reorderPage } from './page/pageModification';

// Add additional safety checks to ensure valid objects
const safeCreateBook = (userId, books = []) => {
  try {
    return createBook(userId, books);
  } catch (error) {
    console.error('Error in safeCreateBook:', error);
    return null;
  }
};

const safeCreateBookFromTemplate = (userId, template) => {
  try {
    return createBookFromTemplate(userId, template);
  } catch (error) {
    console.error('Error in safeCreateBookFromTemplate:', error);
    return null;
  }
};

// Re-export all functions to maintain the same API
export {
  safeCreateBook as createBook,
  safeCreateBookFromTemplate as createBookFromTemplate,
  updateBook,
  deleteBook,
  addPage,
  updatePage,
  deletePage,
  reorderPage,
  duplicatePage
};
