
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
  addPage: () => Promise<string | undefined>; // Update return type
  updatePage: (page: BookPage) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  reorderPage: (id: string, newPosition: number) => Promise<void>;
  duplicatePage: (id: string) => Promise<string | undefined>;
  loading: boolean;
  error: string | null;
}

// Create the context with a default undefined value
const BookContext = createContext<BookContextProps | undefined>(undefined);

// Custom hook to use the book context
export const useBook = () => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
};

// Provider component that wraps the parts of our app that need the context
export const BookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const bookManager = useBookManager();
  
  return (
    <BookContext.Provider value={bookManager}>
      {children}
    </BookContext.Provider>
  );
};
