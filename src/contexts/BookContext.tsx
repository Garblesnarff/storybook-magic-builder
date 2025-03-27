
import React, { createContext, useContext } from 'react';
import { Book, BookPage } from '../types/book';
import { useBookManager } from '../hooks/useBookManager';

interface BookContextProps {
  books: Book[];
  currentBook: Book | null;
  createBook: () => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  loadBook: (id: string) => void;
  addPage: () => void;
  updatePage: (page: BookPage) => void;
  deletePage: (id: string) => void;
  reorderPage: (id: string, newPosition: number) => void;
  duplicatePage: (id: string) => string | undefined;
}

const BookContext = createContext<BookContextProps | undefined>(undefined);

export const useBook = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
};

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const bookManager = useBookManager();
  
  return (
    <BookContext.Provider value={bookManager}>
      {children}
    </BookContext.Provider>
  );
};
