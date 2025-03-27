import { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { loadBooks } from '../services/bookStorage';
import { 
  createNewBook, 
  updateBook, 
  deleteBook as deleteBookService
} from '../services/bookOperations';
import { BookTemplate } from '@/data/bookTemplates';
import {
  addPage as addPageService,
  updatePage as updatePageService,
  deletePage as deletePageService,
  reorderPage as reorderPageService,
  duplicatePage as duplicatePageService
} from '../services/pageOperations';

export function useBookManager() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  // Load books from storage on initial mount
  useEffect(() => {
    try {
      console.log('Loading books from storage...');
      const savedBooks = loadBooks();
      if (savedBooks.length) {
        console.log(`Found ${savedBooks.length} existing books`);
        setBooks(savedBooks);
      } else {
        console.log('No books found, creating sample book');
        // Create a sample book if no books exist
        const sampleBook = createNewBook();
        setBooks([sampleBook]);
      }
    } catch (e) {
      console.error('Error initializing books', e);
      // Fallback to a new book
      const sampleBook = createNewBook();
      setBooks([sampleBook]);
    }
  }, []);

  const createBook = () => {
    const newBook = createNewBook();
    setBooks(prevBooks => [...prevBooks, newBook]);
    setCurrentBook(newBook);
    return newBook.id;
  };

  const createBookFromTemplate = (template: BookTemplate) => {
    const newBook = template.createBook();
    setBooks(prevBooks => [...prevBooks, newBook]);
    setCurrentBook(newBook);
    return newBook.id;
  };

  const loadBook = (id: string) => {
    const book = books.find(book => book.id === id);
    if (book) {
      setCurrentBook(book);
    }
  };

  // Book operations
  const updateBookState = (updatedBook: Book) => {
    const updatedBooks = updateBook(updatedBook, books);
    setBooks(updatedBooks);
    
    if (currentBook?.id === updatedBook.id) {
      setCurrentBook({ ...updatedBook });
    }
  };

  const deleteBook = (id: string) => {
    const filteredBooks = deleteBookService(id, books);
    setBooks(filteredBooks);
    
    if (currentBook?.id === id) {
      setCurrentBook(filteredBooks.length ? filteredBooks[0] : null);
    }
  };

  // Page operations
  const addPage = () => {
    if (!currentBook) return;
    
    const updatedBooks = addPageService(currentBook, books);
    setBooks(updatedBooks);
    
    // Update current book
    const updatedBook = updatedBooks.find(book => book.id === currentBook.id);
    if (updatedBook) {
      setCurrentBook(updatedBook);
    }
  };

  const updatePage = (updatedPage) => {
    if (!currentBook) return;
    
    const updatedBooks = updatePageService(updatedPage, currentBook, books);
    setBooks(updatedBooks);
    
    // Update current book
    const updatedBook = updatedBooks.find(book => book.id === currentBook.id);
    if (updatedBook) {
      setCurrentBook(updatedBook);
    }
  };

  const deletePage = (id) => {
    if (!currentBook) return;
    
    const updatedBooks = deletePageService(id, currentBook, books);
    setBooks(updatedBooks);
    
    // Update current book
    const updatedBook = updatedBooks.find(book => book.id === currentBook.id);
    if (updatedBook) {
      setCurrentBook(updatedBook);
    }
  };

  const reorderPage = (id, newPosition) => {
    if (!currentBook) return;
    
    const updatedBooks = reorderPageService(id, newPosition, currentBook, books);
    setBooks(updatedBooks);
    
    // Update current book
    const updatedBook = updatedBooks.find(book => book.id === currentBook.id);
    if (updatedBook) {
      setCurrentBook(updatedBook);
    }
  };

  const duplicatePage = (id) => {
    if (!currentBook) return;
    
    const [updatedBooks, newPageId] = duplicatePageService(id, currentBook, books);
    setBooks(updatedBooks);
    
    // Update current book
    const updatedBook = updatedBooks.find(book => book.id === currentBook.id);
    if (updatedBook) {
      setCurrentBook(updatedBook);
    }
    
    return newPageId;
  };

  return {
    books,
    currentBook,
    createBook,
    createBookFromTemplate,
    updateBook: updateBookState,
    deleteBook,
    loadBook,
    addPage,
    updatePage,
    deletePage,
    reorderPage,
    duplicatePage
  };
}
