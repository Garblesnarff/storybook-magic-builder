import { Book, BookPage } from '../types/book';
import { v4 as uuidv4 } from 'uuid';
import { deleteBookImages } from './supabase/storageService';

// Import the storage service functions
import { uploadImage, deletePageImages } from './supabase/storageService';

export const createBook = async (title: string, books: Book[]): Promise<Book[]> => {
  const newBook: Book = {
    id: uuidv4(),
    title: title,
    pages: [{
      id: uuidv4(),
      bookId: uuidv4(),
      text: 'This is the first page of your new book! Click here to edit the text.',
      image: '',
      layout: 'text-left-image-right',
      textFormatting: {
        fontFamily: 'Arial',
        fontSize: 16,
        fontColor: '#000000',
        alignment: 'left',
      },
      imageSettings: {
        scale: 1,
        position: { x: 0, y: 0 },
        fitMethod: 'contain'
      }
    }],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return [...books, newBook];
};

export const createBookFromTemplate = async (template: any, books: Book[]): Promise<Book[]> => {
  const newBook: Book = {
    id: uuidv4(),
    title: template.title,
    pages: template.pages.map((page: any) => ({
      ...page,
      id: uuidv4(),
      bookId: uuidv4(),
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return [...books, newBook];
};

export const updateBook = async (bookToUpdate: Book, books: Book[]): Promise<Book[]> => {
  return books.map(book => book.id === bookToUpdate.id ? bookToUpdate : book);
};

export const deleteBook = async (id: string, books: Book[]): Promise<Book[]> => {
  // Before deleting the book, delete all associated images from storage
  try {
    await deleteBookImages(id);
  } catch (storageError) {
    console.error('Error deleting book images:', storageError);
    // Continue with book deletion even if image deletion fails
  }

  return books.filter(book => book.id !== id);
};

export const addPage = async (book: Book, allBooks: Book[]): Promise<[Book[], string]> => {
  const newPage: BookPage = {
    id: uuidv4(),
    bookId: book.id,
    text: 'New page content. Click here to edit the text.',
    image: '',
    layout: 'text-left-image-right',
    textFormatting: {
      fontFamily: 'Arial',
      fontSize: 16,
      fontColor: '#000000',
      alignment: 'left',
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
    updatedAt: new Date(),
  };

  const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);
  return [updatedBooks, newPage.id];
};

// Update the updatePage function to handle base64 images and upload them to storage
export const updatePage = async (page: BookPage): Promise<void> => {
  try {
    // Check if the page image is a base64 string that needs to be uploaded
    if (page.image && page.image.startsWith('data:image')) {
      console.log(`Uploading base64 image for page ${page.id} in book ${page.bookId}`);
      
      // Upload the image to storage and get the public URL
      const imageUrl = await uploadImage(page.image, page.bookId, page.id);
      
      if (imageUrl) {
        console.log(`Image uploaded successfully. Public URL: ${imageUrl}`);
        // Update the page object with the new image URL
        page.image = imageUrl;
      } else {
        console.error('Failed to upload image to storage');
        // If upload fails, continue with the original base64 image
        console.log('Continuing with base64 image data');
      }
    }
    
    // Update the page in the database
    const updatedPage = {
      ...page,
      updatedAt: new Date(),
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Page updated successfully:', updatedPage);
  } catch (error) {
    console.error('Error in updatePage:', error);
    throw error;
  }
};

// Update the deletePage function to also delete associated images
export const deletePage = async (pageId: string, book: Book, allBooks: Book[]): Promise<Book[]> => {
  try {
    console.log(`Deleting page ${pageId} from book ${book.id}`);
    
    // Attempt to delete any stored images associated with this page
    try {
      await deletePageImages(book.id, pageId);
      console.log(`Deleted storage images for page ${pageId}`);
    } catch (storageError) {
      console.error('Error deleting page images:', storageError);
      // Continue with page deletion even if image deletion fails
    }
    
    const updatedBook: Book = {
      ...book,
      pages: book.pages.filter(page => page.id !== pageId),
      updatedAt: new Date(),
    };

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
    updatedAt: new Date(),
  };

  return allBooks.map(b => b.id === book.id ? updatedBook : b);
};

export const duplicatePage = async (id: string, book: Book, allBooks: Book[]): Promise<[Book[], string]> => {
  const pageToDuplicate = book.pages.find(page => page.id === id);

  if (!pageToDuplicate) {
    console.error('Page not found in book');
    return [allBooks, undefined];
  }

  const newPage: BookPage = {
    ...pageToDuplicate,
    id: uuidv4(),
    bookId: book.id,
  };

  const updatedBook: Book = {
    ...book,
    pages: [...book.pages, newPage],
    updatedAt: new Date(),
  };

  const updatedBooks = allBooks.map(b => b.id === book.id ? updatedBook : b);
  return [updatedBooks, newPage.id];
};
