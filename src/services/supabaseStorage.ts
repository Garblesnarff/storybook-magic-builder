
/**
 * @deprecated This file is kept for backwards compatibility.
 * Please use the new modular services in the supabase directory instead.
 */

import { Book, BookPage } from '../types/book';
import * as bookService from './supabase/bookService';
import * as pageService from './supabase/pageService';
import * as storageService from './supabase/storage';
import {
  bookPageToDatabasePage,
  databasePageToBookPage
} from './supabase/utils';

// Re-export book-related functions
export const saveBookToSupabase = bookService.saveBookToSupabase;
export const loadBookFromSupabase = bookService.loadBookFromSupabase;
export const loadBooksFromSupabase = bookService.loadBooksFromSupabase;
export const createBookInSupabase = bookService.createBookInSupabase;
export const deleteBookFromSupabase = bookService.deleteBookFromSupabase;
export const fetchBookFromDatabase = bookService.fetchBookFromDatabase;

// Re-export page-related functions
export const addPageToSupabase = pageService.addPageToSupabase;
export const updatePageInSupabase = pageService.updatePageInSupabase;
export const deletePageFromSupabase = pageService.deletePageFromSupabase;
export const reorderPagesInSupabase = pageService.reorderPagesInSupabase;

// Re-export storage-related functions
export const uploadImage = storageService.uploadImage;

// Re-export utility functions
export { bookPageToDatabasePage, databasePageToBookPage };
