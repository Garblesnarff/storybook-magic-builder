
import { Book } from '../../types/book';
import { cleanupOrphanedImages, deleteBookImages } from '../supabase/storageService';

/**
 * Updates a book in the collection of books
 * @param bookToUpdate The book with updated data
 * @param books The current collection of books
 * @returns Updated array of books
 */
export const updateBook = async (bookToUpdate: Book, books: Book[]): Promise<Book[]> => {
  const validPageIds = bookToUpdate.pages.map(page => page.id);
  await cleanupOrphanedImages(bookToUpdate.id, validPageIds);
  
  return books.map(book => book.id === bookToUpdate.id ? bookToUpdate : book);
};

/**
 * Deletes a book and its associated images
 * @param id The ID of the book to delete
 * @param books The current collection of books
 * @returns Updated array of books without the deleted book
 */
export const deleteBook = async (id: string, books: Book[]): Promise<Book[]> => {
  try {
    await deleteBookImages(id);
  } catch (storageError) {
    console.error('Error deleting book images:', storageError);
    // Continue with book deletion even if image deletion fails
  }

  return books.filter(book => book.id !== id);
};
