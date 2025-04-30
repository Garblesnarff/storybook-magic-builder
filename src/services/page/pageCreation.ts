
import { Book, BookPage } from '../../types/book';
import { v4 as uuidv4 } from 'uuid';

/**
 * Adds a new page to a book
 * @param book The book to add the page to
 * @param allBooks The current collection of books
 * @returns Tuple of [updated books array, new page ID]
 */
export const addPage = async (book: Book, allBooks: Book[]): Promise<[Book[], string]> => {
  const newPageId = uuidv4();
  
  const newPage: BookPage = {
    id: newPageId,
    bookId: book.id,
    pageNumber: book.pages.length + 1,
    text: 'New page content. Click here to edit the text.',
    image: '',
    layout: 'text-left-image-right',
    textFormatting: {
      fontFamily: 'Arial',
      fontSize: 16,
      fontColor: '#000000'
    },
    imageSettings: {
      scale: 1,
      position: { x: 0, y: 0 },
      fitMethod: 'contain'
    }
  };

  const updatedBook: Book = {
    ...book,
    pages: [...book.pages, newPage],
    updatedAt: new Date().toISOString(),
  };

  const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);
  return [updatedBooks, newPage.id];
};

/**
 * Duplicates a page in a book
 * @param id The ID of the page to duplicate
 * @param book The book containing the page
 * @param allBooks The current collection of books
 * @returns Tuple of [updated books array, new page ID]
 */
export const duplicatePage = async (id: string, book: Book, allBooks: Book[]): Promise<[Book[], string]> => {
  const pageToDuplicate = book.pages.find(page => page.id === id);

  if (!pageToDuplicate) {
    console.error('Page not found in book');
    return [allBooks, undefined];
  }

  const newPageId = uuidv4();
  
  const newPage: BookPage = {
    ...pageToDuplicate,
    id: newPageId,
    bookId: book.id,
  };

  const updatedBook: Book = {
    ...book,
    pages: [...book.pages, newPage],
    updatedAt: new Date().toISOString(),
  };

  const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);
  return [updatedBooks, newPage.id];
};
