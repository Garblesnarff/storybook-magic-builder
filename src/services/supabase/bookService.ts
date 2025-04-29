
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/book';
// Remove unused imports

// Create the missing utility functions that were imported
const databaseBookToBook = (dbBook: any): Book => {
  // Convert database book format to our Book type
  const pages = dbBook.book_pages ? dbBook.book_pages.map(databasePageToBookPage) : [];
  
  return {
    id: dbBook.id,
    title: dbBook.title,
    author: dbBook.author,
    description: dbBook.description || '',
    userId: dbBook.user_id || '',
    coverImage: dbBook.cover_image_url || '',
    dimensions: {
      width: dbBook.width,
      height: dbBook.height
    },
    orientation: dbBook.orientation as "portrait" | "landscape",
    pages,
    createdAt: dbBook.created_at,
    updatedAt: dbBook.updated_at
  };
};

const databasePageToBookPage = (dbPage: any) => {
  // Convert database page format to our BookPage type
  return {
    id: dbPage.id,
    bookId: dbPage.book_id,
    pageNumber: dbPage.page_number,
    text: dbPage.text || '',
    image: dbPage.image_url || '',
    layout: dbPage.layout || 'text-left-image-right',
    textFormatting: {
      fontFamily: dbPage.font_family || 'Arial',
      fontSize: dbPage.font_size || 16,
      fontColor: dbPage.font_color || '#000000'
    },
    imageSettings: dbPage.image_settings ? JSON.parse(dbPage.image_settings) : undefined,
    backgroundColor: dbPage.background_color
  };
};

// Function to fetch all books for a user
export const fetchUserBooks = async (userId: string): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*, book_pages(*)')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
    
    if (!data) {
      return [];
    }
    
    // Convert database books to our Book type with explicit typing
    const books: Book[] = data.map(databaseBookToBook);
    
    return books;
  } catch (error) {
    console.error('Failed to fetch books', error);
    throw error;
  }
};

// Function to create a new book in Supabase
export const createBookInSupabase = async (book: Book): Promise<Book> => {
  try {
    // Insert the book record
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .insert({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        user_id: book.userId,
        cover_image_url: book.coverImage,
        width: book.dimensions.width,
        height: book.dimensions.height,
        orientation: book.orientation
      })
      .select()
      .single();
    
    if (bookError || !bookData) {
      console.error('Error creating book:', bookError);
      throw bookError;
    }
    
    // If the book has pages, insert them
    if (book.pages && book.pages.length > 0) {
      const dbPages = book.pages.map(page => ({
        id: page.id,
        book_id: book.id,
        page_number: page.pageNumber,
        text: page.text,
        image_url: page.image,
        layout: page.layout,
        font_family: page.textFormatting?.fontFamily,
        font_size: page.textFormatting?.fontSize,
        font_color: page.textFormatting?.fontColor,
        image_settings: page.imageSettings ? JSON.stringify(page.imageSettings) : null
      }));
      
      const { error: pagesError } = await supabase
        .from('book_pages')
        .insert(dbPages);
      
      if (pagesError) {
        console.error('Error creating book pages:', pagesError);
        throw pagesError;
      }
    }
    
    // Return the created book
    return databaseBookToBook(bookData);
  } catch (error) {
    console.error('Failed to create book in Supabase', error);
    throw error;
  }
};

// Function to fetch a single book from Supabase
export const fetchBookFromSupabase = async (bookId: string): Promise<Book | null> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*, book_pages(*)')
      .eq('id', bookId)
      .single();
    
    if (error) {
      console.error('Error fetching book:', error);
      return null; // Return null instead of throwing to handle "no rows returned" elegantly
    }
    
    if (!data) {
      return null;
    }
    
    // Convert database book to our Book type
    return databaseBookToBook(data);
  } catch (error) {
    console.error('Failed to fetch book', error);
    throw error;
  }
};

// Function to update a book in Supabase
export const updateBookInSupabase = async (book: Book): Promise<Book> => {
  try {
    // Update the book record
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .update({
        title: book.title,
        author: book.author,
        description: book.description,
        cover_image_url: book.coverImage,
        width: book.dimensions.width,
        height: book.dimensions.height,
        orientation: book.orientation,
        updated_at: new Date().toISOString()
      })
      .eq('id', book.id)
      .select()
      .single();
    
    if (bookError || !bookData) {
      console.error('Error updating book:', bookError);
      throw bookError;
    }
    
    // Return the updated book
    return databaseBookToBook(bookData);
  } catch (error) {
    console.error('Failed to update book in Supabase', error);
    throw error;
  }
};

// Function to delete a book from Supabase
export const deleteBookFromSupabase = async (bookId: string): Promise<boolean> => {
  try {
    // Delete the book record (cascade will delete pages)
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);
    
    if (error) {
      console.error('Error deleting book:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete book from Supabase', error);
    throw error;
  }
};
