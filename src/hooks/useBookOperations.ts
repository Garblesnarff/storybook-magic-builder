
import { useState, useCallback } from 'react';
import { Book, DEFAULT_BOOK } from '@/types/book';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { BookTemplate } from '@/data/bookTemplates';
import { createBookFromTemplate, createEmptyBook } from '@/services/book/bookCreation';
import { toast } from 'sonner';

export function useBookOperations() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const auth = useAuth();
  const userId = auth.user?.id || 'anonymous';
  
  // Load all books for the current user
  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would fetch from an API or database
      // For now, we just return the books in state
      return books;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error loading books');
      setError(errorObj);
      return null;
    } finally {
      setLoading(false);
    }
  }, [books]);
  
  // Load a specific book by ID
  const loadBook = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Find the book in our local state
      const book = books.find(book => book.id === id);
      
      if (book) {
        setCurrentBook(book);
        return book;
      }
      
      throw new Error(`Book with ID ${id} not found`);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(`Unknown error loading book ${id}`);
      setError(errorObj);
      return null;
    } finally {
      setLoading(false);
    }
  }, [books]);
  
  // Create a new book
  const createBook = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newBook = createEmptyBook(userId);
      
      // Add the new book to our list of books
      setBooks(prev => [...prev, newBook]);
      
      // Set it as the current book
      setCurrentBook(newBook);
      
      // Return the ID so we can navigate to it
      return newBook.id;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to create book');
      setError(errorObj);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  // Create a book from a template
  const createBookFromTemplateCallback = useCallback(async (template: BookTemplate) => {
    setLoading(true);
    setError(null);
    
    try {
      const newBook = createBookFromTemplate(template, userId);
      
      // Add the new book to our list of books
      setBooks(prev => [...prev, newBook]);
      
      // Set it as the current book
      setCurrentBook(newBook);
      
      // Return the ID so we can navigate to it
      return newBook.id;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to create book from template');
      setError(errorObj);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  // Update a book
  const updateBook = useCallback(async (book: Book) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update the book in our list of books
      setBooks(prev => 
        prev.map(b => b.id === book.id ? book : b)
      );
      
      // If this is the current book, update that too
      if (currentBook && currentBook.id === book.id) {
        setCurrentBook(book);
      }
      
      return book;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(`Failed to update book ${book.id}`);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [currentBook]);
  
  // Delete a book
  const deleteBook = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Remove the book from our list
      setBooks(prev => prev.filter(book => book.id !== id));
      
      // If this was the current book, clear it
      if (currentBook && currentBook.id === id) {
        setCurrentBook(null);
      }
      
      toast.success('Book deleted successfully');
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(`Failed to delete book ${id}`);
      setError(errorObj);
      toast.error('Failed to delete book');
    } finally {
      setLoading(false);
    }
  }, [currentBook]);
  
  return {
    books,
    setBooks,
    currentBook,
    setCurrentBook,
    loading,
    error,
    loadBooks,
    loadBook,
    createBook,
    createBookFromTemplate: createBookFromTemplateCallback,
    updateBook,
    deleteBook
  };
}
