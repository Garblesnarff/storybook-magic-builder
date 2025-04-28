
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Book } from '@/types/book';
import { BookTemplate } from '@/data/bookTemplates';
import {
  createBook,
  updateBook,
  deleteBook,
  createBookFromTemplate,
  loadBook
} from '@/services/bookOperations';
import { useAuth } from '@/contexts/AuthContext';

export function useBookOperations() {
  const { userId } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Load user's books
  const loadBooks = useCallback(async () => {
    if (!userId) {
      console.error('No user ID available to load books');
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const loadedBooks = await loadBook(userId);
      setBooks(loadedBooks);
      return loadedBooks;
    } catch (err) {
      console.error('Error loading books:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to load books');
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load a specific book by ID
  const loadBookById = useCallback(async (id: string) => {
    if (!userId) {
      console.error('No user ID available to load book');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const loadedBook = await loadBook(userId, id);
      
      // If loadedBook is an array, find the book with the matching ID
      if (Array.isArray(loadedBook)) {
        const book = loadedBook.find(b => b.id === id);
        if (book) {
          setCurrentBook(book);
          return book;
        }
        return null;
      }
      
      // If loadedBook is a single book
      setCurrentBook(loadedBook);
      return loadedBook;
    } catch (err) {
      console.error(`Error loading book ${id}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to load book');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create a new book
  const handleCreateBook = useCallback(async () => {
    if (!userId) {
      toast.error('Please log in to create a book');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newBook = await createBook(userId);
      
      // Update the local state with the new book
      setBooks(prev => [...prev, newBook]);
      
      toast.success('Book created');
      return newBook.id;
    } catch (err) {
      console.error('Error creating book:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to create book');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create a book from a template
  const handleCreateBookFromTemplate = useCallback(async (template: BookTemplate) => {
    if (!userId) {
      toast.error('Please log in to create a book');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newBook = await createBookFromTemplate(userId, template);
      
      // Update the local state with the new book
      setBooks(prev => [...prev, newBook]);
      
      toast.success('Book created from template');
      return newBook.id;
    } catch (err) {
      console.error('Error creating book from template:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to create book from template');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Update an existing book
  const handleUpdateBook = useCallback(async (book: Book) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedBook = await updateBook(book);
      
      // Update the local state
      setBooks(prev => prev.map(b => b.id === book.id ? updatedBook : b));
      
      // Update current book if it's the same one
      if (currentBook?.id === book.id) {
        setCurrentBook(updatedBook);
      }
      
      toast.success('Book updated');
      return updatedBook;
    } catch (err) {
      console.error('Error updating book:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to update book');
      return book;
    } finally {
      setLoading(false);
    }
  }, [currentBook]);

  // Delete a book
  const handleDeleteBook = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteBook(id);
      
      // Update local state
      setBooks(prev => prev.filter(book => book.id !== id));
      
      // Clear current book if it's the deleted one
      if (currentBook?.id === id) {
        setCurrentBook(null);
      }
      
      toast.success('Book deleted');
    } catch (err) {
      console.error('Error deleting book:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to delete book');
    } finally {
      setLoading(false);
    }
  }, [currentBook]);

  return {
    books,
    currentBook,
    loading,
    error,
    loadBooks,
    loadBook: loadBookById,
    createBook: handleCreateBook,
    createBookFromTemplate: handleCreateBookFromTemplate,
    updateBook: handleUpdateBook,
    deleteBook: handleDeleteBook,
    setCurrentBook
  };
}
