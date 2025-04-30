
import React, { createContext, useContext, ReactNode } from 'react';
import { Book, BookPage } from '../types/book';
import { useBookManager } from '../hooks/useBookManager';
import { BookTemplate } from '@/data/bookTemplates';

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
  error: null
});

// Custom hook to use the book context
export const useBook = () => {
  const context = useContext(BookContext);
  // We still want to throw an error if useBook is used outside of a provider
  if (context === undefined) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
};

// Enhanced wrapper functions for the Provider
const safeBookManagerWrapper = (bookManager: any) => {
  // Add defensive wrapper functions for all book operations
  return {
    books: Array.isArray(bookManager.books) ? bookManager.books : [],
    currentBook: bookManager.currentBook || null,
    loading: Boolean(bookManager.loading),
    error: bookManager.error || null,
    
    // Wrapper for createBook that ensures it returns a valid ID or null
    createBook: async () => {
      try {
        return await bookManager.createBook() || null;
      } catch (error) {
        console.error('Error in createBook:', error);
        return null;
      }
    },
    
    // Wrapper for createBookFromTemplate
    createBookFromTemplate: async (template: BookTemplate) => {
      if (!template) {
        console.error('Invalid template provided');
        return null;
      }
      
      try {
        return await bookManager.createBookFromTemplate(template) || null;
      } catch (error) {
        console.error('Error in createBookFromTemplate:', error);
        return null;
      }
    },
    
    // Wrappers for other methods with proper error handling
    updateBook: async (book: Book) => {
      if (!book || !book.id) {
        console.error('Invalid book provided to updateBook');
        return;
      }
      
      try {
        await bookManager.updateBook(book);
      } catch (error) {
        console.error('Error in updateBook:', error);
      }
    },
    
    deleteBook: async (id: string) => {
      if (!id) {
        console.error('Invalid ID provided to deleteBook');
        return;
      }
      
      try {
        await bookManager.deleteBook(id);
      } catch (error) {
        console.error('Error in deleteBook:', error);
      }
    },
    
    loadBook: async (id: string) => {
      if (!id) {
        console.error('Invalid ID provided to loadBook');
        return null;
      }
      
      try {
        return await bookManager.loadBook(id) || null;
      } catch (error) {
        console.error('Error in loadBook:', error);
        return null;
      }
    },
    
    addPage: async () => {
      try {
        return await bookManager.addPage();
      } catch (error) {
        console.error('Error in addPage:', error);
        return undefined;
      }
    },
    
    updatePage: async (page: BookPage) => {
      if (!page || !page.id) {
        console.error('Invalid page provided to updatePage');
        return;
      }
      
      try {
        await bookManager.updatePage(page);
      } catch (error) {
        console.error('Error in updatePage:', error);
      }
    },
    
    deletePage: async (id: string) => {
      if (!id) {
        console.error('Invalid ID provided to deletePage');
        return;
      }
      
      try {
        await bookManager.deletePage(id);
      } catch (error) {
        console.error('Error in deletePage:', error);
      }
    },
    
    reorderPage: async (id: string, newPosition: number) => {
      if (!id) {
        console.error('Invalid ID provided to reorderPage');
        return;
      }
      
      try {
        await bookManager.reorderPage(id, newPosition);
      } catch (error) {
        console.error('Error in reorderPage:', error);
      }
    },
    
    duplicatePage: async (id: string) => {
      if (!id) {
        console.error('Invalid ID provided to duplicatePage');
        return undefined;
      }
      
      try {
        return await bookManager.duplicatePage(id) || undefined;
      } catch (error) {
        console.error('Error in duplicatePage:', error);
        return undefined;
      }
    },
  };
};

// Provider component that wraps the parts of our app that need the context
export const BookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const bookManager = useBookManager();
  
  if (!bookManager) {
    // Provide default empty implementation if bookManager is undefined
    return (
      <BookContext.Provider value={{
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
        error: null
      }}>
        {children}
      </BookContext.Provider>
    );
  }
  
  // Use the enhanced wrapper
  const safeBookManager = safeBookManagerWrapper(bookManager);
  
  return (
    <BookContext.Provider value={safeBookManager}>
      {children}
    </BookContext.Provider>
  );
};
