import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { BookPage } from '@/types/book';
import { createPage, updatePage, deletePage } from '@/services/pageOperations';
import { Book } from '@/types/book';

export function usePageOperations() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Add a page to the current book
  const addPage = useCallback(async (bookId: string): Promise<string | undefined> => {
    setLoading(true);
    setError(null);
    
    try {
      const newPageId = await createPage(bookId);
      return newPageId;
    } catch (err) {
      console.error('Error adding page:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to add page');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a page in the current book
  const updateBookPage = useCallback(async (page: BookPage): Promise<Book> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedBook = await updatePage(page);
      
      // Update local state with the updated book
      setBooks(prev => prev.map(book => 
        book.id === page.bookId ? updatedBook : book
      ));
      
      // Update current book if it matches
      if (currentBook?.id === page.bookId) {
        setCurrentBook(updatedBook);
      }
      
      return updatedBook;
    } catch (err) {
      console.error('Error updating page:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to update page');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBook]);

  // Delete a page from the current book
  const deleteBookPage = useCallback(async (pageId: string) => {
    if (!currentBook) {
      toast.error('No book selected');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await deletePage(pageId);
      
      // Update local state by removing the page
      const updatedPages = currentBook.pages.filter(p => p.id !== pageId);
      const updatedBook = { ...currentBook, pages: updatedPages };
      
      setBooks(prev => prev.map(book => 
        book.id === currentBook.id ? updatedBook : book
      ));
      
      setCurrentBook(updatedBook);
      
      toast.success('Page deleted');
    } catch (err) {
      console.error('Error deleting page:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to delete page');
    } finally {
      setLoading(false);
    }
  }, [currentBook]);

  // Reorder a page in the current book
  const reorderPage = useCallback(async (pageId: string, newPosition: number) => {
    if (!currentBook) {
      toast.error('No book selected');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Find the current position of the page
      const currentIndex = currentBook.pages.findIndex(p => p.id === pageId);
      if (currentIndex === -1) {
        toast.error('Page not found');
        return;
      }
      
      // Create a copy of the pages array
      const updatedPages = [...currentBook.pages];
      
      // Remove the page from its current position
      const [movedPage] = updatedPages.splice(currentIndex, 1);
      
      // Insert it at the new position
      updatedPages.splice(newPosition, 0, movedPage);
      
      // Update page numbers to match new order
      const pagesWithUpdatedNumbers = updatedPages.map((page, index) => ({
        ...page,
        pageNumber: index + 1
      }));
      
      // Create updated book
      const updatedBook = { ...currentBook, pages: pagesWithUpdatedNumbers };
      
      // Save changes to the database by updating affected pages
      // This should be a single database operation in a real implementation
      // but we'll update each page individually for now
      for (const page of pagesWithUpdatedNumbers) {
        if (page.pageNumber !== currentBook.pages.find(p => p.id === page.id)?.pageNumber) {
          await updatePage(page);
        }
      }
      
      // Update local state
      setBooks(prev => prev.map(book => 
        book.id === currentBook.id ? updatedBook : book
      ));
      
      setCurrentBook(updatedBook);
      
      toast.success('Page reordered');
    } catch (err) {
      console.error('Error reordering page:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to reorder page');
    } finally {
      setLoading(false);
    }
  }, [currentBook, updatePage]);

  // Duplicate a page in the current book
  const duplicatePage = useCallback(async (pageId: string) => {
    if (!currentBook) {
      toast.error('No book selected');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Find the page to duplicate
      const pageToDuplicate = currentBook.pages.find(p => p.id === pageId);
      if (!pageToDuplicate) {
        toast.error('Page not found');
        return;
      }
      
      // Create a new page based on the existing one
      const newPageId = await createPage(currentBook.id);
      
      if (typeof newPageId === 'string') {
        // Get the updated book to find the new page
        // This is a simplification; in a real app, you'd likely already have the new page data
        const updatedBook = books.find(book => book.id === currentBook.id);
        
        if (!updatedBook) {
          throw new Error('Book not found after adding page');
        }
        
        // Find the newly created page
        const newPage = updatedBook.pages.find(p => p.id === newPageId);
        
        if (!newPage) {
          throw new Error('New page not found after creation');
        }
        
        // Copy properties from the original page
        const updatedNewPage: BookPage = {
          ...newPage,
          text: pageToDuplicate.text,
          image: pageToDuplicate.image,
          layout: pageToDuplicate.layout,
          textFormatting: pageToDuplicate.textFormatting,
          imageSettings: pageToDuplicate.imageSettings,
          backgroundColor: pageToDuplicate.backgroundColor
        };
        
        // Update the new page with the duplicated content
        await updatePage(updatedNewPage);
        
        toast.success('Page duplicated');
        
        return newPageId;
      }
      
      return undefined;
    } catch (err) {
      console.error('Error duplicating page:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to duplicate page');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [books, currentBook]);

  return {
    books,
    setBooks,
    currentBook,
    setCurrentBook,
    loading,
    error,
    addPage,
    updatePage: updateBookPage,
    deletePage: deleteBookPage,
    reorderPage,
    duplicatePage
  };
}
