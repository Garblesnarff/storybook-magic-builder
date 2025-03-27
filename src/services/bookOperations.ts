
import { Book, BookPage, DEFAULT_BOOK, DEFAULT_PAGE } from '../types/book';
import { v4 as uuidv4 } from 'uuid';
import { saveBooks } from './bookStorage';

/**
 * Core book creation and management functions
 */
export const createNewBook = (): Book => {
  const newBook: Book = {
    ...DEFAULT_BOOK,
    id: uuidv4(),
    pages: [createNewPage(0)]
  };
  return newBook;
};

export const createNewPage = (pageNumber: number): BookPage => {
  return {
    ...DEFAULT_PAGE,
    id: uuidv4(),
    pageNumber
  };
};

export const updateBook = (book: Book, books: Book[]): Book[] => {
  const updatedBook = { 
    ...book, 
    updatedAt: new Date().toISOString() 
  };
  
  const updatedBooks = books.map(b => 
    b.id === updatedBook.id ? updatedBook : b
  );
  
  // Schedule save to storage
  setTimeout(() => saveBooks(updatedBooks), 0);
  
  return updatedBooks;
};

export const deleteBook = (id: string, books: Book[]): Book[] => {
  const filteredBooks = books.filter(book => book.id !== id);
  
  // Schedule save to storage
  setTimeout(() => saveBooks(filteredBooks), 0);
  
  return filteredBooks;
};
