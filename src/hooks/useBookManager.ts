
import { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { 
  createNewBook, 
  updateBook, 
  deleteBook as deleteBookService,
  loadBookById,
  loadAllBooks
} from '../services/bookOperations';
import { BookTemplate } from '@/data/bookTemplates';
import {
  addPage as addPageService,
  updatePage as updatePageService,
  deletePage as deletePageService,
  reorderPage as reorderPageService,
  duplicatePage as duplicatePageService
} from '../services/pageOperations';
import { toast } from 'sonner';

export function useBookManager() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load books from Supabase on initial mount
  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        console.log('Loading books from Supabase...');
        const fetchedBooks = await loadAllBooks();
        setBooks(fetchedBooks);
        
        if (fetchedBooks.length) {
          console.log(`Found ${fetchedBooks.length} existing books`);
        } else {
          console.log('No books found');
        }
        
        setLoading(false);
      } catch (e) {
        console.error('Error initializing books', e);
        setError('Failed to load books');
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const createBook = async () => {
    try {
      const newBook = await createNewBook();
      setBooks(prevBooks => [...prevBooks, newBook]);
      setCurrentBook(newBook);
      return newBook.id;
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Failed to create new book');
      return null;
    }
  };

  const createBookFromTemplate = async (template: BookTemplate) => {
    try {
      const newBook = template.createBook();
      const savedBook = await createNewBook();
      // Merge template book data with saved book
      const mergedBook = { ...savedBook, ...newBook, id: savedBook.id };
      await updateBook(mergedBook, books);
      
      setBooks(prevBooks => [...prevBooks, mergedBook]);
      setCurrentBook(mergedBook);
      return mergedBook.id;
    } catch (error) {
      console.error('Error creating book from template:', error);
      toast.error('Failed to create book from template');
      return null;
    }
  };

  const loadBook = async (id: string) => {
    try {
      const book = await loadBookById(id);
      if (book) {
        setCurrentBook(book);
        return book;
      }
      return null;
    } catch (error) {
      console.error('Error loading book:', error);
      toast.error('Failed to load book');
      return null;
    }
  };

  // Book operations
  const updateBookState = async (updatedBook: Book) => {
    try {
      const updatedBooks = await updateBook(updatedBook, books);
      
      setBooks(updatedBooks);
      
      if (currentBook?.id === updatedBook.id) {
        setCurrentBook({ ...updatedBook });
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    }
  };

  const deleteBook = async (id: string) => {
    try {
      const updatedBooks = await deleteBookService(id, books);
      
      setBooks(updatedBooks);
      
      if (currentBook?.id === id) {
        setCurrentBook(updatedBooks.length ? updatedBooks[0] : null);
      }
      
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  // Page operations
  const addPage = async () => {
    if (!currentBook) return;
    
    try {
      const updatedBooksResult = await addPageService(currentBook, books);
      
      setBooks(updatedBooksResult);
      
      // Update current book
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      
      toast.success('New page added');
    } catch (error) {
      console.error('Error adding page:', error);
      toast.error('Failed to add page');
    }
  };

  const updatePage = async (updatedPage) => {
    if (!currentBook) return;
    
    try {
      const updatedBooksResult = await updatePageService(updatedPage, currentBook, books);
      
      setBooks(updatedBooksResult);
      
      // Update current book
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
    } catch (error) {
      console.error('Error updating page:', error);
      toast.error('Failed to update page');
    }
  };

  const deletePage = async (id) => {
    if (!currentBook) return;
    
    try {
      const updatedBooksResult = await deletePageService(id, currentBook, books);
      
      setBooks(updatedBooksResult);
      
      // Update current book
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      
      toast.success('Page deleted');
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const reorderPage = async (id, newPosition) => {
    if (!currentBook) return;
    
    try {
      const updatedBooksResult = await reorderPageService(id, newPosition, currentBook, books);
      
      setBooks(updatedBooksResult);
      
      // Update current book
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
    } catch (error) {
      console.error('Error reordering page:', error);
      toast.error('Failed to reorder page');
    }
  };

  const duplicatePage = async (id) => {
    if (!currentBook) return undefined;
    
    try {
      const [updatedBooksResult, newPageId] = await duplicatePageService(id, currentBook, books);
      
      setBooks(updatedBooksResult);
      
      // Update current book
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      
      return newPageId;
    } catch (error) {
      console.error('Error duplicating page:', error);
      toast.error('Failed to duplicate page');
      return undefined;
    }
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
    duplicatePage,
    loading,
    error
  };
}
