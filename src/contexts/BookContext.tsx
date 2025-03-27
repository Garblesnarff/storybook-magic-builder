
import React, { createContext, useContext, ReactNode } from 'react';
import { Book, BookPage } from '../types/book';
import { useBookManager } from '../hooks/useBookManager';
import { BookTemplate } from '@/data/bookTemplates';

interface BookContextProps {
  books: Book[];
  currentBook: Book | null;
  createBook: () => void;
  createBookFromTemplate: (template: BookTemplate) => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  loadBook: (id: string) => void;
  addPage: () => void;
  updatePage: (page: BookPage) => void;
  deletePage: (id: string) => void;
  reorderPage: (id: string, newPosition: number) => void;
  duplicatePage: (id: string) => string | undefined;
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
