
// src/hooks/usePageOperations.ts
import { useState, useCallback } from 'react'; // Added useCallback
import { Book, BookPage } from '../types/book';
import { toast } from 'sonner';
import {
  addPage as addPageService,
  updatePage as updatePageService,
  deletePage as deletePageService,
  reorderPage as reorderPageService,
  duplicatePage as duplicatePageService
} from '../services/pageOperations'; // Assuming these names
// Import the function to fetch the book again
import { loadBookById } from '../services/bookOperations';


export function usePageOperations(
  books: Book[],
  currentBook: Book | null,
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>,
  setCurrentBook: React.Dispatch<React.SetStateAction<Book | null>>
) {
  const [pageLoading, setPageLoading] = useState(false); // Maybe rename to isProcessing
  const [pageError, setPageError] = useState<string | null>(null);

  // Modify addPage to return the new page ID
  // (Assuming addPageService returns [updatedBooks, newPageId])
  const addPage = useCallback(async (): Promise<string | undefined> => {
    if (!currentBook) return undefined;
    setPageLoading(true);
    setPageError(null);
    try {
      const [updatedBooksResult, newPageId] = await addPageService(currentBook, books);
      setBooks(updatedBooksResult);
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      return newPageId;
    } catch (error) {
      console.error('Error adding page:', error);
      setPageError('Failed to add page');
      toast.error('Failed to add page');
      return undefined;
    } finally {
      setPageLoading(false);
    }
  }, [currentBook, books, setBooks, setCurrentBook]); // Added dependencies

  // --- Replace the ENTIRE updatePage function ---
  const updatePage = async (pageToUpdate: BookPage): Promise<void> => {
    if (!currentBook) return;
    console.log(`updatePage: Received request to update page ${pageToUpdate.id}`);

    // Don't do optimistic updates here for simplicity and to avoid src changes
    setPageLoading(true); // Indicate processing
    setPageError(null);

    try {
      // Call the service function which handles DB update and image upload (if needed)
      // This service MUST ensure the database row has the final public URL if an image was uploaded.
      await updatePageService(pageToUpdate, currentBook, books); // Pass the potentially base64 image

      console.log(`updatePage: updatePageService completed for page ${pageToUpdate.id}. Fetching updated book state...`);

      // *** Force a refresh of the book data from the source of truth (database) ***
      // This ensures we get the final state, including the public image URL
      const refreshedBook = await loadBookById(currentBook.id);

      if (refreshedBook) {
         console.log(`updatePage: Refreshed book data loaded. Updating context state.`);
         // Update the context with the completely refreshed book data
         setCurrentBook(refreshedBook);
         setBooks(prevBooks => prevBooks.map(b => b.id === refreshedBook.id ? refreshedBook : b));
      } else {
         console.error(`updatePage: Failed to reload book ${currentBook.id} after update.`);
         // Handle error - maybe revert? For now, just log.
         toast.error("Failed to refresh book data after saving.");
      }

    } catch (error) {
      console.error('Error during updatePage process:', error);
      setPageError('Failed to update page');
      toast.error('Failed to save page changes.');
      // No explicit rollback needed as we didn't do optimistic UI updates here
    } finally {
      setPageLoading(false);
    }
  };
  // --- End of replaced updatePage function ---

  const deletePage = useCallback(async (id: string): Promise<void> => {
    if (!currentBook) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const updatedBooksResult = await deletePageService(id, currentBook, books);
      setBooks(updatedBooksResult);
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      } else if (currentBook.pages.length === 1) { // If last page was deleted
        setCurrentBook(null); // Or handle as appropriate
      }
      toast.success('Page deleted');
    } catch (error) {
      console.error('Error deleting page:', error);
      setPageError('Failed to delete page');
      toast.error('Failed to delete page');
    } finally {
      setPageLoading(false);
    }
  }, [currentBook, books, setBooks, setCurrentBook]); // Added dependencies

  const reorderPage = useCallback(async (id: string, newPosition: number): Promise<void> => {
    if (!currentBook) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const updatedBooksResult = await reorderPageService(id, newPosition, currentBook, books);
      setBooks(updatedBooksResult);
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
    } catch (error) {
      console.error('Error reordering page:', error);
      setPageError('Failed to reorder page');
      toast.error('Failed to reorder page');
    } finally {
      setPageLoading(false);
    }
  }, [currentBook, books, setBooks, setCurrentBook]); // Added dependencies

  // (Assuming duplicatePageService returns [updatedBooks, newPageId])
  const duplicatePage = useCallback(async (id: string): Promise<string | undefined> => {
    if (!currentBook) return undefined;
    setPageLoading(true);
    setPageError(null);
    try {
      const [updatedBooksResult, newPageId] = await duplicatePageService(id, currentBook, books);
      setBooks(updatedBooksResult);
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      return newPageId;
    } catch (error) {
      console.error('Error duplicating page:', error);
      setPageError('Failed to duplicate page');
      toast.error('Failed to duplicate page');
      return undefined;
    } finally {
      setPageLoading(false);
    }
  }, [currentBook, books, setBooks, setCurrentBook]); // Added dependencies


  return {
    addPage,
    updatePage,
    deletePage,
    reorderPage,
    duplicatePage,
    pageLoading,
    pageError
  };
}
