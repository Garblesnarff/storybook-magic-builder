
import { Book, BookPage, DEFAULT_PAGE_TEXT } from '../types/book';
import { v4 as uuidv4 } from 'uuid';
import { createNewPage, updateBook } from './bookOperations';
import { 
  addPageToSupabase,
  updatePageInSupabase,
  deletePageFromSupabase,
  reorderPagesInSupabase
} from './supabaseStorage';

/**
 * Page-specific operations
 */
// Modify return type to include the new page ID
export const addPage = async (currentBook: Book, books: Book[]): Promise<[Book[], string | undefined]> => {
  if (!currentBook) return [books, undefined];

  const newPageNumber = currentBook.pages.length;
  const newPageFromDb = await addPageToSupabase(currentBook.id, newPageNumber); // Capture the result
  let newPageId: string | undefined = undefined;
  let pageToAdd: BookPage;
  
  if (!newPageFromDb) {
    // Fallback to local creation if Supabase fails
    console.warn("Supabase failed to add page, creating locally.");
    pageToAdd = createNewPage(newPageNumber);
    // newPageId remains undefined in fallback
  } else {
    // Use the page returned from Supabase
    pageToAdd = newPageFromDb;
    newPageId = newPageFromDb.id; // Capture the ID
  }
  
  // Update with the page (either from Supabase or local fallback)
  const updatedBook = {
    ...currentBook,
    pages: [...currentBook.pages, pageToAdd],
    updatedAt: new Date().toISOString()
  };

  // Assume updateBook returns the updated books array, and await it
  const updatedBooksArray = await updateBook(updatedBook, books); 
  
  // Return the updated books array and the new page ID
  return [updatedBooksArray, newPageId]; 
};

export const updatePage = async (updatedPage: BookPage, currentBook: Book, books: Book[]): Promise<Book[]> => {
  // Removed erroneous pasted block from addPage fallback
  if (!currentBook) return books;

  // Update page in Supabase
  await updatePageInSupabase(currentBook.id, updatedPage);
  
  // Update local state
  const updatedPages = currentBook.pages.map(page => 
    page.id === updatedPage.id ? updatedPage : page
  );

  const updatedBook = {
    ...currentBook,
    pages: updatedPages,
    updatedAt: new Date().toISOString()
  };

  return books.map(book => book.id === updatedBook.id ? updatedBook : book);
};

export const deletePage = async (id: string, currentBook: Book, books: Book[]): Promise<Book[]> => {
  if (!currentBook) return books;

  // Delete page from Supabase
  await deletePageFromSupabase(currentBook.id, id);

  // Update local state
  const filteredPages = currentBook.pages.filter(page => page.id !== id);
  
  // Reorder page numbers
  const reorderedPages = filteredPages.map((page, index) => ({
    ...page,
    pageNumber: index
  }));
  
  // Update page numbering in Supabase
  const pageOrderingData = reorderedPages.map((page, index) => ({
    id: page.id,
    pageNumber: index
  }));
  await reorderPagesInSupabase(currentBook.id, pageOrderingData);

  const updatedBook = {
    ...currentBook,
    pages: reorderedPages,
    updatedAt: new Date().toISOString()
  };

  return books.map(book => book.id === updatedBook.id ? updatedBook : book);
};

export const reorderPage = async (id: string, newPosition: number, currentBook: Book, books: Book[]): Promise<Book[]> => {
  if (!currentBook) return books;
  
  const pageIndex = currentBook.pages.findIndex(page => page.id === id);
  if (pageIndex === -1) return books;
  
  const reorderedPages = [...currentBook.pages];
  const [movedPage] = reorderedPages.splice(pageIndex, 1);
  reorderedPages.splice(newPosition, 0, movedPage);
  
  // Update page numbers
  const updatedPages = reorderedPages.map((page, index) => ({
    ...page,
    pageNumber: index
  }));
  
  // Update in Supabase
  const pageOrderingData = updatedPages.map((page, index) => ({
    id: page.id,
    pageNumber: index
  }));
  await reorderPagesInSupabase(currentBook.id, pageOrderingData);
  
  const updatedBook = {
    ...currentBook,
    pages: updatedPages,
    updatedAt: new Date().toISOString()
  };
  
  return books.map(book => book.id === updatedBook.id ? updatedBook : book);
};

export const duplicatePage = async (id: string, currentBook: Book, books: Book[]): Promise<[Book[], string?]> => {
  if (!currentBook) return [books, undefined];

  const pageToDuplicate = currentBook.pages.find(page => page.id === id);
  if (!pageToDuplicate) return [books, undefined];

  // Create a new page with the same content but a new ID
  const duplicatedPage: BookPage = {
    ...pageToDuplicate,
    id: uuidv4(),
    pageNumber: currentBook.pages.length,
  };

  // Add page to Supabase
  const newPageFromSupabase = await addPageToSupabase(currentBook.id, duplicatedPage.pageNumber);
  
  // Use the duplicated page data but with the Supabase ID if available
  const finalDuplicatedPage = newPageFromSupabase ? 
    { ...duplicatedPage, id: newPageFromSupabase.id } : 
    duplicatedPage;
  
  // Update the page content in Supabase
  if (finalDuplicatedPage) {
    await updatePageInSupabase(currentBook.id, finalDuplicatedPage);
  }

  const updatedBook = {
    ...currentBook,
    pages: [...currentBook.pages, finalDuplicatedPage],
    updatedAt: new Date().toISOString()
  };

  return [books.map(book => book.id === updatedBook.id ? updatedBook : book), finalDuplicatedPage.id];
};
