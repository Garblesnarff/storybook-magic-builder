
import { Book, BookPage } from '../types/book';
import { v4 as uuidv4 } from 'uuid';
import { createNewPage, updateBook } from './bookOperations';

/**
 * Page-specific operations
 */
export const addPage = (currentBook: Book, books: Book[]): Book[] => {
  if (!currentBook) return books;

  const newPage = createNewPage(currentBook.pages.length);
  const updatedBook = {
    ...currentBook,
    pages: [...currentBook.pages, newPage],
    updatedAt: new Date().toISOString()
  };

  return updateBook(updatedBook, books);
};

export const updatePage = (updatedPage: BookPage, currentBook: Book, books: Book[]): Book[] => {
  if (!currentBook) return books;

  const updatedPages = currentBook.pages.map(page => 
    page.id === updatedPage.id ? updatedPage : page
  );

  const updatedBook = {
    ...currentBook,
    pages: updatedPages,
    updatedAt: new Date().toISOString()
  };

  return updateBook(updatedBook, books);
};

export const deletePage = (id: string, currentBook: Book, books: Book[]): Book[] => {
  if (!currentBook) return books;

  const filteredPages = currentBook.pages.filter(page => page.id !== id);
  
  // Reorder page numbers
  const reorderedPages = filteredPages.map((page, index) => ({
    ...page,
    pageNumber: index
  }));

  const updatedBook = {
    ...currentBook,
    pages: reorderedPages,
    updatedAt: new Date().toISOString()
  };

  return updateBook(updatedBook, books);
};

export const reorderPage = (id: string, newPosition: number, currentBook: Book, books: Book[]): Book[] => {
  if (!currentBook) return books;
  
  const pageIndex = currentBook.pages.findIndex(page => page.id === id);
  if (pageIndex === -1) return books;
  
  const reorderedPages = [...currentBook.pages];
  const [movedPage] = reorderedPages.splice(pageIndex, 1);
  reorderedPages.splice(newPosition, 0, movedPage);
  
  // Update page numbers
  const updatedPages = reorderedPages.map((page, index) => ({
    ...page,
    pageNumber: index
  }));
  
  const updatedBook = {
    ...currentBook,
    pages: updatedPages,
    updatedAt: new Date().toISOString()
  };
  
  return updateBook(updatedBook, books);
};

export const duplicatePage = (id: string, currentBook: Book, books: Book[]): [Book[], string?] => {
  if (!currentBook) return [books, undefined];

  const pageToDuplicate = currentBook.pages.find(page => page.id === id);
  if (!pageToDuplicate) return [books, undefined];

  // Create a new page with the same content but a new ID
  const duplicatedPage: BookPage = {
    ...pageToDuplicate,
    id: uuidv4(),
    pageNumber: currentBook.pages.length,
  };

  const updatedBook = {
    ...currentBook,
    pages: [...currentBook.pages, duplicatedPage],
    updatedAt: new Date().toISOString()
  };

  return [updateBook(updatedBook, books), duplicatedPage.id];
};
