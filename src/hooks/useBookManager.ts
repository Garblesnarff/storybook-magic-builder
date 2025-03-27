
import { useState, useEffect } from 'react';
import { Book, BookPage, DEFAULT_BOOK, DEFAULT_PAGE } from '../types/book';
import { v4 as uuidv4 } from 'uuid';
import { saveBooks, loadBooks } from '../services/bookStorage';

export function useBookManager() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  // Load books from storage on initial mount
  useEffect(() => {
    try {
      const savedBooks = loadBooks();
      if (savedBooks.length) {
        setBooks(savedBooks);
      } else {
        // Create a sample book if no books exist
        const sampleBook = createNewBook();
        setBooks([sampleBook]);
        saveBooks([sampleBook]);
      }
    } catch (e) {
      console.error('Error initializing books', e);
      // Fallback to a new book
      const sampleBook = createNewBook();
      setBooks([sampleBook]);
    }
  }, []);

  // Save books whenever they change, but not more often than every 2 seconds
  useEffect(() => {
    if (books.length) {
      const timeoutId = setTimeout(() => {
        saveBooks(books);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [books]);

  const createNewBook = (): Book => {
    const newBook: Book = {
      ...DEFAULT_BOOK,
      id: uuidv4(),
      pages: [createNewPage(0)]
    };
    return newBook;
  };

  const createNewPage = (pageNumber: number): BookPage => {
    return {
      ...DEFAULT_PAGE,
      id: uuidv4(),
      pageNumber
    };
  };

  const createBook = () => {
    const newBook = createNewBook();
    setBooks([...books, newBook]);
    setCurrentBook(newBook);
  };

  const updateBook = (updatedBook: Book) => {
    const updatedBooks = books.map(book => 
      book.id === updatedBook.id ? 
        { ...updatedBook, updatedAt: new Date().toISOString() } : 
        book
    );
    setBooks(updatedBooks);
    
    if (currentBook?.id === updatedBook.id) {
      setCurrentBook({ ...updatedBook, updatedAt: new Date().toISOString() });
    }
  };

  const deleteBook = (id: string) => {
    const filteredBooks = books.filter(book => book.id !== id);
    setBooks(filteredBooks);
    
    if (currentBook?.id === id) {
      setCurrentBook(filteredBooks.length ? filteredBooks[0] : null);
    }
  };

  const loadBook = (id: string) => {
    const book = books.find(book => book.id === id);
    if (book) {
      setCurrentBook(book);
    }
  };

  const addPage = () => {
    if (!currentBook) return;

    const newPage = createNewPage(currentBook.pages.length);
    const updatedBook = {
      ...currentBook,
      pages: [...currentBook.pages, newPage],
      updatedAt: new Date().toISOString()
    };

    updateBook(updatedBook);
  };

  const updatePage = (updatedPage: BookPage) => {
    if (!currentBook) return;

    const updatedPages = currentBook.pages.map(page => 
      page.id === updatedPage.id ? updatedPage : page
    );

    const updatedBook = {
      ...currentBook,
      pages: updatedPages,
      updatedAt: new Date().toISOString()
    };

    updateBook(updatedBook);
  };

  const deletePage = (id: string) => {
    if (!currentBook) return;

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

    updateBook(updatedBook);
  };

  const reorderPage = (id: string, newPosition: number) => {
    if (!currentBook) return;
    
    const pageIndex = currentBook.pages.findIndex(page => page.id === id);
    if (pageIndex === -1) return;
    
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
    
    updateBook(updatedBook);
  };

  return {
    books,
    currentBook,
    createBook,
    updateBook,
    deleteBook,
    loadBook,
    addPage,
    updatePage,
    deletePage,
    reorderPage
  };
}
