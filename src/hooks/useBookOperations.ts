
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

export function useBookOperations() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading books from Supabase...');
        
        if (!user || !user.id) {
          console.log('No authenticated user found, skipping book load');
          setBooks([]);
          setLoading(false);
          return;
        }
        
        // Add null check for loadAllBooks result
        const fetchedBooks = await loadAllBooks() || [];
        
        // Ensure we have valid books before filtering
        const validFetchedBooks = Array.isArray(fetchedBooks) 
          ? fetchedBooks.filter(book => book && typeof book === 'object')
          : [];
        
        // Filter books by current user's ID
        const userBooks = validFetchedBooks.filter(book => book.userId === user.id);
        
        setBooks(userBooks);
        
        if (userBooks.length) {
          console.log(`Found ${userBooks.length} existing books for the user`);
        } else {
          console.log('No books found for the user');
        }
        
        setLoading(false);
      } catch (e) {
        console.error('Error initializing books', e);
        setError('Failed to load books');
        setLoading(false);
        // Set empty array to prevent null reference issues
        setBooks([]);
      }
    }

    if (user) {
      fetchBooks();
    } else {
      setBooks([]);
      setLoading(false);
    }
    
  }, [user]);

  const createBook = useCallback(async (): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to create a book');
      return null;
    }
    
    try {
      console.log('Creating new book for user:', user.id);
      const newBook = await createNewBook(user.id);
      
      // Add null/undefined check for the newBook
      if (!newBook || typeof newBook !== 'object' || !newBook.id) {
        console.error('Failed to create book: Invalid book data returned');
        toast.error('Failed to create new book: Invalid data');
        return null;
      }
      
      console.log('Book created successfully:', newBook.id);
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
      // Create base book object from template
      const newBook = template.createBook();
      
      // Save to database
      const savedBook = await createNewBook(user.id);
      
      // Add null/undefined check
      if (!savedBook || !savedBook.id) {
        toast.error('Failed to create book from template');
        return null;
      }
      
      // Merge template with saved book
      const mergedBook = { 
        ...savedBook, 
        ...newBook, 
        id: savedBook.id, 
        userId: user.id 
      };
      
      // Update the merged book in the database
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
    if (!id) {
      console.error('Invalid book ID provided to loadBook');
      toast.error('Invalid book ID');
      return null;
    }
    
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
    if (!updatedBook || !updatedBook.id) {
      console.error('Invalid book data provided to updateBook');
      toast.error('Failed to update book: Invalid data');
      return;
    }
    
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
    if (!id) {
      console.error('Invalid book ID provided to deleteBook');
      toast.error('Invalid book ID');
      return;
    }
    
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
    setCurrentBook
  };
}
