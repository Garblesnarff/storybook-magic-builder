
import { Book } from '@/types/book';
import { createBook as createBookImpl, createBookFromTemplate as createBookFromTemplateImpl } from './book/bookCreation';
import { updateBook, deleteBook } from './book/bookOperations';
import { duplicatePage, createNewPage } from './page/pageCreation';
import { updatePage, deletePage, reorderPage } from './page/pageModification';

export const addPage = async (book: Book, allBooks: Book[]): Promise<[Book[], string]> => {
  if (!book) {
    throw new Error('No book selected');
  }
  
  const newPage = createNewPage(book.id, book.pages.length + 1);
  
  const updatedBook = {
    ...book,
    pages: [...book.pages, newPage]
  };
  
  const updatedBooks = allBooks.map((b: Book) => 
    b.id === book.id ? updatedBook : b
  );
  
  return [updatedBooks, newPage.id];
};

export const loadBook = (books: Book[], bookId: string): Book | null => {
  return books.find(book => book.id === bookId) || null;
};

export {
  createBookImpl as createBook,
  createBookFromTemplateImpl as createBookFromTemplate,
  updateBook,
  deleteBook,
  updatePage,
  deletePage,
  reorderPage,
  duplicatePage
};

export const createNewBook = (userId: string, title = 'Untitled Book'): Book => {
  const now = new Date().toISOString();
  return {
    id: `book-${Date.now()}`,
    title,
    author: '',
    description: '',
    userId,
    coverImage: '',
    dimensions: {
      width: 8.5,
      height: 11
    },
    orientation: 'portrait',
    pages: [],
    createdAt: now,
    updatedAt: now
  };
};

export const createMockBooks = (userId: string): Book[] => {
  return [createNewBook(userId, 'Sample Book')];
};
