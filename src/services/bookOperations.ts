
// This file re-exports functionality from the refactored modules
// to maintain backward compatibility with existing code

import { createBook, createBookFromTemplate } from './book/bookCreation';
import { updateBook, deleteBook } from './book/bookOperations';
import { duplicatePage, createNewPage } from './page/pageCreation';
import { updatePage, deletePage, reorderPage } from './page/pageModification';
import { Book, BookPage, PageLayout } from '@/types/book';

// Add the missing addPage function to match what's expected by other modules
export const addPage = async (book: Book, allBooks: Book[]): Promise<[Book[], string]> => {
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
  const updatedBooks = allBooks.map((b: Book) => 
    b.id === book.id ? updatedBook : b
  );
  
  // Return the updated books and new page ID
  return [updatedBooks, newPage.id];
};

// Add the mock loadBook function to match what's expected
export const loadBook = (books: Book[], bookId: string): Book | null => {
  return books.find(book => book.id === bookId) || null;
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

// Add the mock createNewBook function since it's used in useBookOperations
export const createNewBook = (userId: string, title = 'Untitled Book'): Book => {
  const now = new Date().toISOString();
  return {
    id: `book-${Date.now()}`,
    title,
    author: '',
    description: '',
    userId,
    coverImage: '',
    dimensions: {
      width: 8.5,
      height: 11
    },
    orientation: 'portrait',
    pages: [],
    createdAt: now,
    updatedAt: now
  };
};

// Add the createMockBooks function since it's used
export const createMockBooks = (userId: string): Book[] => {
  return [createNewBook(userId, 'Sample Book')];
};
