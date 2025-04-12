import { Book, BookPage } from '../types/book';
import { v4 as uuidv4 } from 'uuid';
import { 
  deleteBookImages, 
  deletePageImages,
  uploadImage,
  cleanupOrphanedImages 
} from './supabase/storageService';

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

export const updateBook = async (bookToUpdate: Book, books: Book[]): Promise<Book[]> => {
  const validPageIds = bookToUpdate.pages.map(page => page.id);
  await cleanupOrphanedImages(bookToUpdate.id, validPageIds);
  
  return books.map(book => book.id === bookToUpdate.id ? bookToUpdate : book);
};

export const deleteBook = async (id: string, books: Book[]): Promise<Book[]> => {
  try {
    await deleteBookImages(id);
  } catch (storageError) {
    console.error('Error deleting book images:', storageError);
    // Continue with book deletion even if image deletion fails
  }

  return books.filter(book => book.id !== id);
};

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

export const updatePage = async (page: BookPage): Promise<void> => {
  try {
    if (page.image && page.image.startsWith('data:image')) {
      console.log(`Uploading base64 image for page ${page.id} in book ${page.bookId}`);
      
      const imageUrl = await uploadImage(page.image, page.bookId, page.id);
      
      if (imageUrl) {
        console.log(`Image uploaded successfully with consistent filename. Public URL: ${imageUrl}`);
        page.image = imageUrl;
      } else {
        console.error('Failed to upload image to storage');
        console.log('Continuing with base64 image data');
      }
    }
    
    const updatedPage = {
      ...page,
      updatedAt: new Date().toISOString(),
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Page updated successfully:', updatedPage);
  } catch (error) {
    console.error('Error in updatePage:', error);
    throw error;
  }
};

export const deletePage = async (pageId: string, book: Book, allBooks: Book[]): Promise<Book[]> => {
  try {
    console.log(`Deleting page ${pageId} from book ${book.id}`);
    
    try {
      await deletePageImages(book.id, pageId);
      console.log(`Deleted storage image for page ${pageId}`);
    } catch (storageError) {
      console.error('Error deleting page images:', storageError);
      // Continue with page deletion even if image deletion fails
    }
    
    const updatedBook: Book = {
      ...book,
      pages: book.pages.filter(page => page.id !== pageId),
      updatedAt: new Date().toISOString(),
    };

    const validPageIds = updatedBook.pages.map(page => page.id);
    await cleanupOrphanedImages(book.id, validPageIds);

    const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);
    return updatedBooks;
  } catch (error) {
    console.error('Error in deletePage:', error);
    throw error;
  }
};

export const reorderPage = async (id: string, newPosition: number, book: Book, allBooks: Book[]): Promise<Book[]> => {
  const pageToReorderIndex = book.pages.findIndex(page => page.id === id);

  if (pageToReorderIndex === -1) {
    console.error('Page not found in book');
    return allBooks;
  }

  const pageToReorder = book.pages[pageToReorderIndex];
  const updatedPages = [...book.pages];
  updatedPages.splice(pageToReorderIndex, 1);
  updatedPages.splice(newPosition, 0, pageToReorder);

  const updatedBook: Book = {
    ...book,
    pages: updatedPages,
    updatedAt: new Date().toISOString(),
  };

  return allBooks.map(b => b.id === book.id ? updatedBook : b);
};

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
