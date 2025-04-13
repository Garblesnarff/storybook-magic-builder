
import { Book, BookPage } from '../../types/book';
import { uploadImage, deletePageImages, cleanupOrphanedImages } from '../supabase/storageService';

/**
 * Updates a page with new content
 * @param page The page with updated data
 * @returns Promise that resolves when the page is updated
 */
export const updatePage = async (page: BookPage): Promise<void> => {
  try {
    if (page.image && page.image.startsWith('data:image')) {
      console.log(`Uploading base64 image for page ${page.id} in book ${page.bookId}`);
      
      const imageUrl = await uploadImage(page.image, page.bookId, page.id);
      
      if (imageUrl) {
        console.log(`Image uploaded successfully with consistent filename. Public URL: ${imageUrl}`);
        page.image = imageUrl;
      } else {
        console.error('Failed to upload image to storage');
        console.log('Continuing with base64 image data');
      }
    }
    
    const updatedPage = {
      ...page,
      updatedAt: new Date().toISOString(),
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Page updated successfully:', updatedPage);
  } catch (error) {
    console.error('Error in updatePage:', error);
    throw error;
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
  try {
    console.log(`Deleting page ${pageId} from book ${book.id}`);
    
    try {
      await deletePageImages(book.id, pageId);
      console.log(`Deleted storage image for page ${pageId}`);
    } catch (storageError) {
      console.error('Error deleting page images:', storageError);
      // Continue with page deletion even if image deletion fails
    }
    
    const updatedBook: Book = {
      ...book,
      pages: book.pages.filter(page => page.id !== pageId),
      updatedAt: new Date().toISOString(),
    };

    const validPageIds = updatedBook.pages.map(page => page.id);
    await cleanupOrphanedImages(book.id, validPageIds);

    const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);
    return updatedBooks;
  } catch (error) {
    console.error('Error in deletePage:', error);
    throw error;
  }
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
  const pageToReorderIndex = book.pages.findIndex(page => page.id === id);

  if (pageToReorderIndex === -1) {
    console.error('Page not found in book');
    return allBooks;
  }

  const pageToReorder = book.pages[pageToReorderIndex];
  const updatedPages = [...book.pages];
  updatedPages.splice(pageToReorderIndex, 1);
  updatedPages.splice(newPosition, 0, pageToReorder);

  const updatedBook: Book = {
    ...book,
    pages: updatedPages,
    updatedAt: new Date().toISOString(),
  };

  return allBooks.map(b => b.id === book.id ? updatedBook : b);
};
