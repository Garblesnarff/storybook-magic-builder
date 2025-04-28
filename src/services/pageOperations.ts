
// This file re-exports functionality from the refactored modules
// to maintain backward compatibility with existing code

import { createBook, createBookFromTemplate } from './book/bookCreation';
import { updateBook, deleteBook } from './book/bookOperations';
import { duplicatePage, createNewPage } from './page/pageCreation';
import { updatePage, deletePage, reorderPage } from './page/pageModification';

// Add the missing addPage function to match what's expected by other modules
export const addPage = async (book, allBooks) => {
  if (!book) {
    throw new Error('No book selected');
  }
  
  // Create a new page for the book
  const newPage = createNewPage(book.id, book.pages.length + 1);
  
  // Update the book with the new page
  const updatedBook = {
    ...book,
    pages: [...book.pages, newPage]
  };
  
  // Update the books collection with the updated book
  const updatedBooks = allBooks.map(b => 
    b.id === book.id ? updatedBook : b
  );
  
  // Return the updated books and new page ID
  return [updatedBooks, newPage.id];
};

// Re-export all functions to maintain the same API
export {
  createBook,
  createBookFromTemplate,
  updateBook,
  deleteBook,
  updatePage,
  deletePage,
  reorderPage,
  duplicatePage
};
