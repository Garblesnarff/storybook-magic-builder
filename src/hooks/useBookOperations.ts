
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const { user, loading: authLoading } = useAuth();
  
  const initializeBooks = useCallback(async () => {
    // Don't fetch books if auth is still loading - wait for it to complete
    if (authLoading) {
      console.log('Auth still loading, deferring book initialization');
      return;
    }
    
    // Skip if already initialized and no refresh requested
    if (hasInitialized && books.length > 0 && refreshCounter === 0) {
      console.log('Books already loaded, skipping initialization');
      return;
    }
    
    // If no user, clear books
    if (!user) {
      console.log('No user, clearing books');
      setBooks([]);
      setCurrentBook(null);
      setLoading(false);
      setHasInitialized(true);
      return;
    }
    
    // Fetch books
    try {
      setLoading(true);
      setError(null);
      console.log(`Loading books from Supabase for user: ${user.id} (refresh: ${refreshCounter})`);
      
      const fetchedBooks = await loadAllBooks();
      console.log('Total books fetched:', fetchedBooks.length);
      
      const userBooks = fetchedBooks.filter(book => book.userId === user.id);
      console.log(`Found ${userBooks.length} books for user ${user.id}`);
      
      setBooks(userBooks);
      
      if (userBooks.length) {
        console.log(`Loaded ${userBooks.length} existing books for the user`);
      } else {
        console.log('No books found for the user');
      }
      
      setHasInitialized(true);
    } catch (e) {
      console.error('Error initializing books', e);
      setError('Failed to load books');
      toast.error('Failed to load your books. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, books.length, hasInitialized, refreshCounter, authLoading]);

  // Separate effect for auth loading changes
  useEffect(() => {
    if (!authLoading && user) {
      console.log('Auth loading completed with user, initializing books');
      initializeBooks();
    }
  }, [authLoading, user, initializeBooks]);

  // Effect for refresh counter changes
  useEffect(() => {
    if (refreshCounter > 0) {
      console.log('Refresh requested, initializing books');
      setHasInitialized(false); // Force refresh
      initializeBooks();
    }
  }, [refreshCounter, initializeBooks]);

  const forceRefresh = useCallback(() => {
    console.log('Force refresh requested in useBookOperations');
    setHasInitialized(false);
    initializeBooks();
  }, [initializeBooks]);

  const createBook = useCallback(async (): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to create a book');
      return null;
    }
    
    try {
      const newBook = await createNewBook(user.id);
      console.log('New book created:', newBook.id);
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
      
      console.log('New book created from template:', mergedBook.id);
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
      console.log('Loading book with ID:', id);
      const book = await loadBookById(id);
      if (book) {
        console.log('Book loaded successfully:', book.id);
        setCurrentBook(book);
        return book;
      }
      console.log('Book not found with ID:', id);
      return null;
    } catch (error) {
      console.error('Error loading book:', error);
      toast.error('Failed to load book');
      return null;
    }
  }, []);

  const updateBookState = useCallback(async (updatedBook: Book): Promise<void> => {
    try {
      console.log('Updating book:', updatedBook.id);
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
      console.log('Deleting book:', id);
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
