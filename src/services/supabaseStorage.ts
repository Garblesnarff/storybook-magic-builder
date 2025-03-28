/**
 * @deprecated This file is kept for backwards compatibility.
 * Please use the new modular services in the supabase directory instead.
 */

import { Book, BookPage } from '../types/book';
import {
  saveBookToSupabase as saveBook,
  loadBookFromSupabase as loadBook,
  loadBooksFromSupabase as loadBooks,
  createBookInSupabase as createBook,
  deleteBookFromSupabase as deleteBook
} from './supabase/bookService';

import {
  addPageToSupabase as addPage,
  updatePageInSupabase as updatePage,
  deletePageFromSupabase as deletePage,
  reorderPagesInSupabase as reorderPages
} from './supabase/pageService';

import {
  uploadImage
} from './supabase/storageService';

import {
  bookPageToDatabasePage,
  databasePageToBookPage
} from './supabase/utils';

// Re-export all functions for backwards compatibility
export const saveBookToSupabase = saveBook;
export const loadBookFromSupabase = loadBook;
export const loadBooksFromSupabase = loadBooks;
export const createBookInSupabase = createBook;
export const deleteBookFromSupabase = deleteBook;

export const addPageToSupabase = addPage;
export const updatePageInSupabase = updatePage;
export const deletePageFromSupabase = deletePage;
export const reorderPagesInSupabase = reorderPages;

// Keep original functions for backwards compatibility
export { uploadImage, bookPageToDatabasePage, databasePageToBookPage };
