
import { useState } from 'react';
import { Book, BookPage } from '@/types/book';
import { toast } from 'sonner';
import * as bookService from '../services/pageOperations';

export function usePageOperations(
  books: Book[], 
  currentBook: Book | null, 
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>, 
  setCurrentBook: React.Dispatch<React.SetStateAction<Book | null>>
) {
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<Error | null>(null);

  // Function to add a new page to a book
  const addPage = async () => {
    try {
      setPageLoading(true);
      if (!currentBook) {
        toast.error("No book selected");
        throw new Error("No book selected");
      }

      const result = await bookService.addPage(currentBook, books);
      
      // Handle the result properly based on its type
      if (Array.isArray(result)) {
        const [updatedBooks, newPageId] = result as [Book[], string];
        
        // Find the updated book in the returned array
        const updatedBook = updatedBooks.find((b) => b.id === currentBook.id);
        
        // Update state with the new data
        setBooks(updatedBooks);
        if (updatedBook) setCurrentBook(updatedBook);
        
        toast.success("Page added successfully");
        return newPageId;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error adding page:', error);
      setPageError(error as Error);
      toast.error("Failed to add page");
      throw error;
    } finally {
      setPageLoading(false);
    }
  };

  // Function to update a page in a book
  const updatePage = async (page: BookPage) => {
    try {
      setPageLoading(true);
      if (!currentBook) {
        toast.error("No book selected");
        throw new Error("No book selected");
      }

      // Find the page index
      const pageIndex = currentBook.pages.findIndex(p => p.id === page.id);
      if (pageIndex === -1) {
        toast.error("Page not found");
        throw new Error("Page not found");
      }

      // Update the page in the book
      const updatedPages = [...currentBook.pages];
      updatedPages[pageIndex] = page;

      // Create an updated book
      const updatedBook = {
        ...currentBook,
        pages: updatedPages
      };

      // Update the book in the books array
      const updatedBooks = books.map((book: Book) => book.id === updatedBook.id ? updatedBook : book);
      
      setBooks(updatedBooks);
      setCurrentBook(updatedBook);
      
      return updatedBook;
    } catch (error) {
      console.error('Error updating page:', error);
      setPageError(error as Error);
      toast.error("Failed to update page");
      throw error;
    } finally {
      setPageLoading(false);
    }
  };

  // Function to delete a page from a book
  const deletePage = async (pageId: string) => {
    try {
      setPageLoading(true);
      if (!currentBook) {
        toast.error("No book selected");
        throw new Error("No book selected");
      }

      // Check if we have at least 2 pages (can't delete if only 1 page)
      if (currentBook.pages.length <= 1) {
        toast.error("Cannot delete the only page");
        throw new Error("Cannot delete the only page");
      }

      // Filter out the page to delete
      const updatedPages = currentBook.pages.filter(p => p.id !== pageId);
      
      // Recalculate page numbers
      updatedPages.forEach((page, index) => {
        page.pageNumber = index + 1;
      });

      // Create an updated book
      const updatedBook = {
        ...currentBook,
        pages: updatedPages
      };

      // Update the book in the books array
      const updatedBooks = books.map((book: Book) => book.id === updatedBook.id ? updatedBook : book);
      
      setBooks(updatedBooks);
      setCurrentBook(updatedBook);
      
      toast.success("Page deleted successfully");
    } catch (error) {
      console.error('Error deleting page:', error);
      setPageError(error as Error);
      toast.error("Failed to delete page");
      throw error;
    } finally {
      setPageLoading(false);
    }
  };

  // Function to reorder pages in a book
  const reorderPage = async (pageId: string, newIndex: number) => {
    try {
      setPageLoading(true);
      if (!currentBook) {
        toast.error("No book selected");
        throw new Error("No book selected");
      }

      // Find the page and its current index
      const pageIndex = currentBook.pages.findIndex(p => p.id === pageId);
      if (pageIndex === -1) {
        toast.error("Page not found");
        throw new Error("Page not found");
      }

      // Make a copy of the pages array
      const updatedPages = [...currentBook.pages];
      
      // Remove the page from its current position
      const [movedPage] = updatedPages.splice(pageIndex, 1);
      
      // Insert the page at the new position
      updatedPages.splice(newIndex, 0, movedPage);
      
      // Recalculate page numbers
      updatedPages.forEach((page, index) => {
        page.pageNumber = index + 1;
      });

      // Create an updated book
      const updatedBook = {
        ...currentBook,
        pages: updatedPages
      };

      // Update the book in the books array
      const updatedBooks = books.map((book: Book) => book.id === updatedBook.id ? updatedBook : book);
      
      setBooks(updatedBooks);
      setCurrentBook(updatedBook);
      
      toast.success("Pages reordered successfully");
    } catch (error) {
      console.error('Error reordering pages:', error);
      setPageError(error as Error);
      toast.error("Failed to reorder pages");
      throw error;
    } finally {
      setPageLoading(false);
    }
  };

  // Function to duplicate a page in a book
  const duplicatePage = async (pageId: string) => {
    try {
      setPageLoading(true);
      if (!currentBook) {
        toast.error("No book selected");
        throw new Error("No book selected");
      }

      // Find the page to duplicate
      const pageToDuplicate = currentBook.pages.find(p => p.id === pageId);
      if (!pageToDuplicate) {
        toast.error("Page not found");
        throw new Error("Page not found");
      }

      // Use the bookService to duplicate the page
      const result = await bookService.duplicatePage(currentBook, books, pageId);
      
      if (Array.isArray(result)) {
        const [updatedBooks, newPageId] = result as [Book[], string];
        
        const updatedBook = updatedBooks.find((b) => b.id === currentBook.id);
        
        setBooks(updatedBooks);
        if (updatedBook) setCurrentBook(updatedBook);
        
        toast.success("Page duplicated successfully");
        
        return newPageId;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error duplicating page:', error);
      setPageError(error as Error);
      toast.error("Failed to duplicate page");
      throw error;
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
