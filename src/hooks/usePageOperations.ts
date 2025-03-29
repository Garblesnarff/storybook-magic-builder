
import { useState } from 'react';
import { Book, BookPage } from '../types/book';
import { toast } from 'sonner';
import {
  addPage as addPageService,
  updatePage as updatePageService,
  deletePage as deletePageService,
  reorderPage as reorderPageService,
  duplicatePage as duplicatePageService
} from '../services/pageOperations';

export function usePageOperations(
  books: Book[],
  currentBook: Book | null,
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>,
  setCurrentBook: React.Dispatch<React.SetStateAction<Book | null>>
) {
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Modify addPage to return the new page ID
  const addPage = async (): Promise<string | undefined> => {
    if (!currentBook) return undefined;
    
    try {
      setPageLoading(true);
      // Assume addPageService returns [updatedBooks, newPageId]
      const [updatedBooksResult, newPageId] = await addPageService(currentBook, books);
      
      setBooks(updatedBooksResult);
      
      // Update current book
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      
      // Don't show toast here, let the handler do it
      // toast.success('New page added'); 
      return newPageId; // Return the ID
    } catch (error) {
      console.error('Error adding page:', error);
      setPageError('Failed to add page');
      toast.error('Failed to add page');
      return undefined; // Return undefined on error
    } finally {
      setPageLoading(false);
    }
  };

  const updatePage = async (updatedPage: BookPage): Promise<void> => {
    if (!currentBook) return;

    // Store previous state for potential rollback
    const previousBooks = [...books];
    const previousCurrentBook = currentBook ? { ...currentBook } : null;

    // --- Optimistic Update ---
    // 1. Update the page within the current book optimistically
    const updatedPages = currentBook.pages.map(p => 
      p.id === updatedPage.id ? updatedPage : p
    );
    const optimisticallyUpdatedBook = { ...currentBook, pages: updatedPages };

    // 2. Update the list of books optimistically
    const optimisticallyUpdatedBooks = books.map(b => 
      b.id === currentBook.id ? optimisticallyUpdatedBook : b
    );

    // 3. Apply optimistic updates to the state
    setBooks(optimisticallyUpdatedBooks);
    setCurrentBook(optimisticallyUpdatedBook);
    // --- End Optimistic Update ---

    try {
      setPageLoading(true); // Indicate background activity
      // Call the service to persist the change (we don't need the result for state update now)
      await updatePageService(updatedPage, currentBook, books); 
      // If successful, the optimistic state is correct.
      console.log(`Page ${updatedPage.id} update persisted successfully.`);

    } catch (error) {
      console.error('Error updating page, rolling back optimistic update:', error);
      setPageError('Failed to update page');
      toast.error('Failed to save page changes. Reverting.');

      // --- Rollback on Error ---
      setBooks(previousBooks);
      setCurrentBook(previousCurrentBook);
      // --- End Rollback ---

    } finally {
      setPageLoading(false); // Stop indicating background activity
    }
  };

  const deletePage = async (id: string): Promise<void> => {
    if (!currentBook) return;
    
    try {
      setPageLoading(true);
      const updatedBooksResult = await deletePageService(id, currentBook, books);
      
      setBooks(updatedBooksResult);
      
      // Update current book
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      
      toast.success('Page deleted');
    } catch (error) {
      console.error('Error deleting page:', error);
      setPageError('Failed to delete page');
      toast.error('Failed to delete page');
    } finally {
      setPageLoading(false);
    }
  };

  const reorderPage = async (id: string, newPosition: number): Promise<void> => {
    if (!currentBook) return;
    
    try {
      setPageLoading(true);
      const updatedBooksResult = await reorderPageService(id, newPosition, currentBook, books);
      
      setBooks(updatedBooksResult);
      
      // Update current book
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
  };

  const duplicatePage = async (id: string): Promise<string | undefined> => {
    if (!currentBook) return undefined;
    
    try {
      setPageLoading(true);
      const [updatedBooksResult, newPageId] = await duplicatePageService(id, currentBook, books);
      
      setBooks(updatedBooksResult);
      
      // Update current book
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
  };

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
