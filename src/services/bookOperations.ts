
// src/services/bookOperations.ts

import { Book, BookPage } from '@/types/book';
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
