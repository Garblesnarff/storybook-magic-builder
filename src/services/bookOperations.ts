
// src/services/bookOperations.ts

import { Book, BookPage } from '@/types/book';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import {
  saveBookToSupabase,
  loadBookFromSupabase,
  loadBooksFromSupabase,
  createBookInSupabase,
  deleteBookFromSupabase
} from './supabase/bookService';

// Re-export functions from bookService
export const saveBook = saveBookToSupabase;
export const loadBookById = loadBookFromSupabase;
export const loadBooks = loadBooksFromSupabase;
export const createBook = createBookInSupabase;
export const deleteBook = deleteBookFromSupabase;

// Add the missing updateBook export
export const updateBook = saveBookToSupabase; // This maps updateBook to saveBookToSupabase

// Add the missing createNewBook function
export const createNewBook = async (userId: string): Promise<Book> => {
  const newBookId = uuidv4();
  const newPageId = uuidv4();
  
  const newBook: Book = {
    id: newBookId,
    title: 'Untitled Book',
    pages: [{
      id: newPageId,
      bookId: newBookId,
      pageNumber: 1,
      text: 'This is the first page of your new book! Click here to edit the text.',
      image: '',
      layout: 'text-left-image-right',
      textFormatting: {
        fontFamily: 'Arial',
        fontSize: 16,
        fontColor: '#000000'
      },
      imageSettings: {
        scale: 1,
        position: { x: 0, y: 0 },
        fitMethod: 'contain'
      }
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Anonymous',
    description: '',
    orientation: 'portrait',
    dimensions: {
      width: 8.5,
      height: 11
    },
    userId
  };

  try {
    // Save the new book to Supabase
    return await createBookInSupabase(newBook);
  } catch (error) {
    console.error('Error creating new book:', error);
    toast.error('Failed to create new book');
    throw error;
  }
};

// Functions related to book operations can be added here
export const generateBookCover = async (book: Book): Promise<string | null> => {
  try {
    // This is a placeholder for actual cover generation logic
    toast.success('Book cover generated');
    return 'https://example.com/cover.jpg';
  } catch (error) {
    console.error('Error generating book cover:', error);
    toast.error('Failed to generate book cover');
    return null;
  }
};
