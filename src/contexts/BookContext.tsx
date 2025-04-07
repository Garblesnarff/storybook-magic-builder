
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Book, BookPage } from '../types/book';
import { useBookManager } from '../hooks/useBookManager';
import { BookTemplate } from '@/data/bookTemplates';
import { toast } from 'sonner';

interface BookContextProps {
  books: Book[];
  currentBook: Book | null;
  createBook: () => Promise<string | null>;
  createBookFromTemplate: (template: BookTemplate) => Promise<string | null>;
  updateBook: (book: Book) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  loadBook: (id: string) => Promise<Book | null>;
  addPage: () => Promise<string | undefined>; 
  updatePage: (page: BookPage) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  reorderPage: (id: string, newPosition: number) => Promise<void>;
  duplicatePage: (id: string) => Promise<string | undefined>;
  loading: boolean;
  error: string | null;
  retryLoading: () => void;
}

// Create the context with a default empty implementation to avoid undefined errors
const BookContext = createContext<BookContextProps>({
  books: [],
  currentBook: null,
  createBook: async () => null,
  createBookFromTemplate: async () => null,
  updateBook: async () => {},
  deleteBook: async () => {},
  loadBook: async () => null,
  addPage: async () => undefined,
  updatePage: async () => {},
  deletePage: async () => {},
  reorderPage: async () => {},
  duplicatePage: async () => undefined,
  loading: false,
  error: null,
  retryLoading: () => {}
});

// Custom hook to use the book context
export const useBook = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
};

// Provider component that wraps the parts of our app that need the context
export const BookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Create a local state for retry count
  const [retryCount, setRetryCount] = useState(0);
  
  // Use bookManager outside of the useEffect to avoid re-creating it on every render
  const bookManager = useBookManager();
  
  // Simplified retry function that doesn't depend on bookManager directly
  const retryLoading = () => {
    console.log('Retrying book loading...');
    setRetryCount(prev => prev + 1);
  };
  
  // Only call forceRefresh when retryCount changes, not on every render
  useEffect(() => {
    if (retryCount > 0 && bookManager.forceRefresh) {
      console.log(`Triggering forceRefresh due to retry #${retryCount}`);
      bookManager.forceRefresh();
    }
  }, [retryCount, bookManager]);
  
  // Combine the book manager with our retry function
  const contextValue = {
    ...bookManager,
    retryLoading
  };
  
  return (
    <BookContext.Provider value={contextValue}>
      {children}
    </BookContext.Provider>
  );
};
