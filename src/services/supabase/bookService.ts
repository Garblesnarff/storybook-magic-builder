
import { supabase } from '@/integrations/supabase/client';
import { Book, BookPage } from '@/types/book';
import { databaseBookToBook, databasePageToBookPage } from './utils';

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
    
    // Convert database books to our Book type
    const books = data.map(databaseBookToBook);
    
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
