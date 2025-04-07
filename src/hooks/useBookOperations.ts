import { useState, useEffect, useCallback } from 'react';
import { Book } from '../types/book';
import { 
  createNewBook, 
  updateBook as updateBookService, 
  deleteBook as deleteBookService,
  loadBookById,
  loadAllBooks
} from '../services/bookOperations';
import { BookTemplate } from '@/data/bookTemplates';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useBookOperations(refreshCounter = 0) {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const initializeBooks = useCallback(async () => {
    try {
      if (!user) {
        console.log('No user, skipping book initialization');
        setBooks([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      console.log('Loading books from Supabase...');
      
      const fetchedBooks = await loadAllBooks();
      
      const userBooks = fetchedBooks.filter(book => book.userId === user.id);
      setBooks(userBooks);
      
      if (userBooks.length) {
        console.log(`Found ${userBooks.length} existing books for the user`);
      } else {
        console.log('No books found for the user');
      }
      
    } catch (e) {
      console.error('Error initializing books', e);
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // This effect runs when the user changes or when refreshCounter is incremented
  useEffect(() => {
    console.log('Initializing books, refreshCounter:', refreshCounter);
    initializeBooks();
  }, [initializeBooks, refreshCounter]);

  // Function to force a re-initialization
  const forceRefresh = useCallback(() => {
    console.log('Force refresh requested in useBookOperations');
    initializeBooks();
  }, [initializeBooks]);

  const createBook = useCallback(async (): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to create a book');
      return null;
    }
    
    try {
      const newBook = await createNewBook(user.id);
      setBooks(prevBooks => [...prevBooks, newBook]);
      setCurrentBook(newBook);
      return newBook.id;
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Failed to create new book');
      return null;
    }
  }, [user]);

  const createBookFromTemplate = useCallback(async (template: BookTemplate): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to create a book');
      return null;
    }
    
    try {
      const newBook = template.createBook();
      const savedBook = await createNewBook(user.id);
      const mergedBook = { ...savedBook, ...newBook, id: savedBook.id, userId: user.id };
      await updateBookService(mergedBook, books);
      
      setBooks(prevBooks => [...prevBooks, mergedBook]);
      setCurrentBook(mergedBook);
      return mergedBook.id;
    } catch (error) {
      console.error('Error creating book from template:', error);
      toast.error('Failed to create book from template');
      return null;
    }
  }, [books, user]);

  const loadBook = useCallback(async (id: string): Promise<Book | null> => {
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
  }, []);

  const updateBookState = useCallback(async (updatedBook: Book): Promise<void> => {
    try {
      const updatedBooksResult = await updateBookService(updatedBook, books); 
      setBooks(updatedBooksResult);
      
      if (currentBook?.id === updatedBook.id) { 
        setCurrentBook({ ...updatedBook });
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    }
  }, [books, currentBook]);

  const deleteBook = useCallback(async (id: string): Promise<void> => {
    try {
      const updatedBooksResult = await deleteBookService(id, books); 
      setBooks(updatedBooksResult);
      
      if (currentBook?.id === id) { 
        setCurrentBook(updatedBooksResult.length ? updatedBooksResult[0] : null);
      }
      
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  }, [books, currentBook]);

  return {
    books,
    currentBook,
    createBook,
    createBookFromTemplate,
    updateBook: updateBookState,
    deleteBook,
    loadBook,
    loading,
    error,
    setBooks,
    setCurrentBook,
    initializeBooks,
    forceRefresh
  };
}
