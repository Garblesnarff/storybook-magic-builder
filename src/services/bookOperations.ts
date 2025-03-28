
import { Book, BookPage, DEFAULT_BOOK, DEFAULT_PAGE } from '../types/book';
import { v4 as uuidv4 } from 'uuid';
import { 
  saveBookToSupabase, 
  loadBookFromSupabase,
  loadBooksFromSupabase,
  createBookInSupabase,
  deleteBookFromSupabase
} from './supabaseStorage';

/**
 * Core book creation and management functions
 */
export const createNewBook = async (): Promise<Book> => {
  const newBook: Book = {
    ...DEFAULT_BOOK,
    id: uuidv4(),
    pages: [createNewPage(0)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Create in Supabase and return the result
  const savedBook = await createBookInSupabase(newBook);
  return savedBook || newBook; // Fallback to the local book if save fails
};

export const createNewPage = (pageNumber: number): BookPage => {
  return {
    ...DEFAULT_PAGE,
    id: uuidv4(),
    pageNumber
  };
};

export const updateBook = async (book: Book, books: Book[]): Promise<Book[]> => {
  const updatedBook = { 
    ...book, 
    updatedAt: new Date().toISOString() 
  };
  
  const updatedBooks = books.map(b => 
    b.id === updatedBook.id ? updatedBook : b
  );
  
  // Save to Supabase
  await saveBookToSupabase(updatedBook);
  
  return updatedBooks;
};

export const deleteBook = async (id: string, books: Book[]): Promise<Book[]> => {
  // Delete from Supabase
  await deleteBookFromSupabase(id);
  
  // Update local state
  const filteredBooks = books.filter(book => book.id !== id);
  return filteredBooks;
};

// Load all books from Supabase
export const loadAllBooks = async (): Promise<Book[]> => {
  return await loadBooksFromSupabase();
};

// Load a specific book from Supabase
export const loadBookById = async (bookId: string): Promise<Book | null> => {
  return await loadBookFromSupabase(bookId);
};
