
import { useState, useEffect, useCallback } from 'react';
import { Book } from '../types/book';
import { 
  createNewBook as createNewBookService, 
  updateBook as updateBookService, 
  deleteBook as deleteBookService,
  loadBookById,
  loadBooks as loadAllBooks
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
        console.log('Loading books from Supabase...');
        // Pass the user ID to loadAllBooks
        const fetchedBooks = await loadAllBooks(user?.id || '');
        
        const userBooks = user ? fetchedBooks.filter(book => book.userId === user.id) : fetchedBooks;
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
      const newBook = await createNewBookService(user.id);
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
      const savedBook = await createNewBookService(user.id);
      const mergedBook = { ...savedBook, ...newBook, id: savedBook.id, userId: user.id };
      await updateBookService(mergedBook);
      
      setBooks(prevBooks => [...prevBooks, mergedBook]);
      setCurrentBook(mergedBook);
      return mergedBook.id;
    } catch (error) {
      console.error('Error creating book from template:', error);
      toast.error('Failed to create book from template');
      return null;
    }
  }, [user]);

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
      await updateBookService(updatedBook);
      
      setBooks(prevBooks => 
        prevBooks.map(book => book.id === updatedBook.id ? updatedBook : book)
      );
      
      if (currentBook?.id === updatedBook.id) { 
        setCurrentBook({ ...updatedBook });
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    }
  }, [currentBook]);

  const deleteBook = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteBookService(id);
      
      setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
      
      if (currentBook?.id === id) { 
        // Set the first available book as current, or null if none left
        const firstBook = books.find(book => book.id !== id);
        setCurrentBook(firstBook || null);
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
