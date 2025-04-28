
// src/hooks/usePageOperations.ts
import { useState, useCallback } from 'react';
import { Book, BookPage } from '../types/book';
import { toast } from 'sonner';
import {
  updatePage as updatePageService,
  deletePage as deletePageService,
  reorderPage as reorderPageService,
  duplicatePage as duplicatePageService
} from '../services/pageOperations';
// Import the function to fetch the book again
import { loadBookById } from '../services/bookOperations';
import { createNewPage } from '../services/page/pageCreation';

export function usePageOperations(
  books: Book[],
  currentBook: Book | null,
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>,
  setCurrentBook: React.Dispatch<React.SetStateAction<Book | null>>
) {
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Modify addPage to return the new page ID
  const addPage = useCallback(async (): Promise<string | undefined> => {
    if (!currentBook) return undefined;
    setPageLoading(true);
    setPageError(null);
    try {
      // Create a new page
      const newPageNumber = currentBook.pages.length + 1;
      const newPage = createNewPage(currentBook.id, newPageNumber);
      
      // Update the book with the new page
      const updatedBook = {
        ...currentBook,
        pages: [...currentBook.pages, newPage]
      };
      
      // Update local state
      const updatedBooks = books.map(book => 
        book.id === updatedBook.id ? updatedBook : book
      );
      
      setBooks(updatedBooks);
      setCurrentBook(updatedBook);
      
      // Return the new page ID
      return newPage.id;
    } catch (error) {
      console.error('Error adding page:', error);
      setPageError('Failed to add page');
      toast.error('Failed to add page');
      return undefined;
    } finally {
      setPageLoading(false);
    }
  }, [currentBook, books, setBooks, setCurrentBook]);

  // Updated updatePage function
  const updatePage = async (pageToUpdate: BookPage): Promise<void> => {
    if (!currentBook) return;
    console.log(`updatePage: Received request to update page ${pageToUpdate.id}`);

    // Don't do optimistic updates here for simplicity and to avoid src changes
    setPageLoading(true); // Indicate processing
    setPageError(null);

    try {
      // Call the service function which handles DB update and image upload (if needed)
      await updatePageService(pageToUpdate);

      console.log(`updatePage: updatePageService completed for page ${pageToUpdate.id}. Fetching updated book state...`);

      // Force a refresh of the book data from the source of truth (database)
      const refreshedBook = await loadBookById(currentBook.id);

      if (refreshedBook) {
         console.log(`updatePage: Refreshed book data loaded. Updating context state.`);
         // Update the context with the completely refreshed book data
         setCurrentBook(refreshedBook);
         setBooks(prevBooks => prevBooks.map(b => b.id === refreshedBook.id ? refreshedBook : b));
      } else {
         console.error(`updatePage: Failed to reload book ${currentBook.id} after update.`);
         toast.error("Failed to refresh book data after saving.");
      }

    } catch (error) {
      console.error('Error during updatePage process:', error);
      setPageError('Failed to update page');
      toast.error('Failed to save page changes.');
    } finally {
      setPageLoading(false);
    }
  };

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
  }, [currentBook, books, setBooks, setCurrentBook]);

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
  }, [currentBook, books, setBooks, setCurrentBook]);

  // Fix the duplicatePage function to properly handle Book type
  const duplicatePage = useCallback(async (id: string): Promise<string | undefined> => {
    if (!currentBook) return undefined;
    setPageLoading(true);
    setPageError(null);
    try {
      // Find the page to duplicate
      const pageToDuplicate = currentBook.pages.find(page => page.id === id);
      if (!pageToDuplicate) {
        throw new Error('Page not found');
      }
      
      // Get all books from the existing state
      const allBooks = [...books];
      
      // Call the duplicatePageService with proper arguments
      const [updatedBooks, newPageId] = await duplicatePageService(id, currentBook, allBooks);
      
      setBooks(updatedBooks);
      const updatedBook = updatedBooks.find(book => book.id === currentBook.id);
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
  }, [currentBook, books, setBooks, setCurrentBook]);

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
