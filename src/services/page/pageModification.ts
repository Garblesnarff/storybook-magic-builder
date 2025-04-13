
import { Book, BookPage } from '../../types/book';
import { deletePageImages, uploadImage } from '../supabase/storage';

/**
 * Updates a page in a book
 * @param page The page to update
 * @returns Promise that resolves when the update is complete
 */
export const updatePage = async (page: BookPage): Promise<void> => {
  // If the image is a base64 string, upload it to storage
  if (page.image && page.image.startsWith('data:image')) {
    const imageUrl = await uploadImage(page.image, page.bookId, page.id);
    if (imageUrl) {
      page.image = imageUrl;
    }
  }
};

/**
 * Deletes a page from a book
 * @param pageId The ID of the page to delete
 * @param book The book containing the page
 * @param allBooks The current collection of books
 * @returns Updated array of books
 */
export const deletePage = async (pageId: string, book: Book, allBooks: Book[]): Promise<Book[]> => {
  // Get the page to delete
  const pageToDelete = book.pages.find(p => p.id === pageId);
  
  if (pageToDelete) {
    try {
      // Delete the page's image from storage
      await deletePageImages(book.id, pageId);
    } catch (storageError) {
      console.error('Error deleting page images:', storageError);
      // Continue with page deletion even if image deletion fails
    }
  }

  // Filter out the deleted page and update page numbers
  const updatedPages = book.pages
    .filter(page => page.id !== pageId)
    .map((page, index) => ({
      ...page,
      pageNumber: index + 1
    }));

  // Create updated book object
  const updatedBook: Book = {
    ...book,
    pages: updatedPages,
    updatedAt: new Date().toISOString(),
  };

  // Update the books array
  const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);
  return updatedBooks;
};

/**
 * Reorders a page within a book
 * @param id The ID of the page to reorder
 * @param newPosition The new position for the page
 * @param book The book containing the page
 * @param allBooks The current collection of books
 * @returns Updated array of books
 */
export const reorderPage = async (id: string, newPosition: number, book: Book, allBooks: Book[]): Promise<Book[]> => {
  // Find the page to reorder
  const pageIndex = book.pages.findIndex(page => page.id === id);
  if (pageIndex === -1) return allBooks;

  // Create a copy of the pages array
  const pages = [...book.pages];
  const [removed] = pages.splice(pageIndex, 1);
  
  // Insert the page at the new position
  pages.splice(newPosition, 0, removed);

  // Update page numbers
  const updatedPages = pages.map((page, index) => ({
    ...page,
    pageNumber: index + 1
  }));

  // Create updated book object
  const updatedBook: Book = {
    ...book,
    pages: updatedPages,
    updatedAt: new Date().toISOString(),
  };

  // Update the books array
  const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);
  return updatedBooks;
};
