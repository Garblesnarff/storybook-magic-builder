import { v4 as uuidv4 } from 'uuid';
import { Book } from '@/types/book';
import { DEFAULT_BOOK, DEFAULT_PAGE } from '@/types/book';

/**
 * Creates a new book with a default first page
 * @param title The title of the new book
 * @param books The current collection of books
 * @returns Updated array of books including the new book
 */
export const createBook = async (title: string, books: Book[]): Promise<Book[]> => {
  const newBookId = uuidv4();
  const newPageId = uuidv4();
  
  const newBook: Book = {
    id: newBookId,
    title: title,
    pages: [{
      id: newPageId,
      bookId: newBookId,
      pageNumber: 1,
      text: 'This is the first page of your new book! Click here to edit the text.',
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
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Anonymous',
    description: '',
    orientation: 'portrait',
    dimensions: {
      width: 8.5,
      height: 11
    },
    userId: ''
  };

  return [...books, newBook];
};

/**
 * Creates a new book based on a template
 * @param template The template to use for the book
 * @param books The current collection of books
 * @returns Updated array of books including the new templated book
 */
export const createBookFromTemplate = async (template: any, books: Book[]): Promise<Book[]> => {
  const newBookId = uuidv4();
  
  const newBook: Book = {
    id: newBookId,
    title: template.title,
    pages: template.pages.map((page: any) => ({
      ...page,
      id: uuidv4(),
      bookId: newBookId,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Anonymous',
    description: '',
    orientation: 'portrait',
    dimensions: {
      width: 8.5,
      height: 11
    },
    userId: ''
  };

  return [...books, newBook];
};
