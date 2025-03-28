
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

  const addPage = async (): Promise<void> => {
    if (!currentBook) return;
    
    try {
      setPageLoading(true);
      const updatedBooksResult = await addPageService(currentBook, books);
      
      setBooks(updatedBooksResult);
      
      // Update current book
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      
      toast.success('New page added');
    } catch (error) {
      console.error('Error adding page:', error);
      setPageError('Failed to add page');
      toast.error('Failed to add page');
    } finally {
      setPageLoading(false);
    }
  };

  const updatePage = async (updatedPage: BookPage): Promise<void> => {
    if (!currentBook) return;
    
    try {
      setPageLoading(true);
      const updatedBooksResult = await updatePageService(updatedPage, currentBook, books);
      
      setBooks(updatedBooksResult);
      
      // Update current book
      const updatedBook = updatedBooksResult.find(book => book.id === currentBook.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
    } catch (error) {
      console.error('Error updating page:', error);
      setPageError('Failed to update page');
      toast.error('Failed to update page');
    } finally {
      setPageLoading(false);
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
