import { Book, BookPage, PageLayout, ImageSettings } from '@/types/book';
import { supabase } from '@/integrations/supabase/client';
import { databasePageToBookPage } from './utils';
// Remove BookTemplate import or define it if needed

// Function to save a book to Supabase
export const saveBookToSupabase = async (book: Book): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .upsert({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        user_id: book.userId,
        cover_image_url: book.coverImage,
        width: book.width,
        height: book.height,
        orientation: book.orientation,
        updated_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Error saving book:', error);
      return false;
    }
    
    // Save pages
    for (const page of book.pages) {
      await updatePageInSupabase(page, book.id);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save book to Supabase:', error);
    return false;
  }
};

// Function to load a book from Supabase by ID
export const loadBookFromSupabase = async (bookId: string): Promise<Book | null> => {
  try {
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (bookError) {
      console.error('Error loading book:', bookError);
      return null;
    }
    
    if (!bookData) {
      console.log('Book not found');
      return null;
    }
    
    const { data: pagesData, error: pagesError } = await supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', bookId)
      .order('page_number', { ascending: true });
    
    if (pagesError) {
      console.error('Error loading pages:', pagesError);
      return null;
    }
    
    const pages: BookPage[] = pagesData.map(databasePageToBookPage);
    
    // Convert null to empty string where needed
    const coverImage = bookData.cover_image_url || ''; // Ensure coverImage is string, not null
    
    const book: Book = {
      id: bookData.id,
      title: bookData.title,
      author: bookData.author,
      description: bookData.description || '',
      userId: bookData.user_id || '',
      coverImage: coverImage,
      pages: pages,
      width: bookData.width,
      height: bookData.height,
      orientation: bookData.orientation,
    };
    
    return book;
  } catch (error) {
    console.error('Failed to load book from Supabase:', error);
    return null;
  }
};

// Function to load all books for a user from Supabase
export const loadBooksFromSupabase = async (userId: string): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading books:', error);
      return [];
    }
    
    const books: Book[] = data.map(bookData => {
      // Convert null to empty string where needed
      const coverImage = bookData.cover_image_url || ''; // Ensure coverImage is string, not null
      
      return {
        id: bookData.id,
        title: bookData.title,
        author: bookData.author,
        description: bookData.description || '',
        userId: bookData.user_id || '',
        coverImage: coverImage,
        pages: [], // Pages are loaded separately
        width: bookData.width,
        height: bookData.height,
        orientation: bookData.orientation,
      };
    });
    
    return books;
  } catch (error) {
    console.error('Failed to load books from Supabase:', error);
    return [];
  }
};

// Function to create a new book in Supabase
export const createBookInSupabase = async (book: Book): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .insert([
        {
          id: book.id,
          title: book.title,
          author: book.author,
          description: book.description,
          user_id: book.userId,
          cover_image_url: book.coverImage,
          width: book.width,
          height: book.height,
          orientation: book.orientation,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating book:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Failed to create book in Supabase:', error);
    return null;
  }
};

// Function to delete a book from Supabase
export const deleteBookFromSupabase = async (bookId: string): Promise<boolean> => {
  try {
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
    console.error('Failed to delete book from Supabase:', error);
    return false;
  }
};

// Function to update a page in Supabase
const updatePageInSupabase = async (page: BookPage, bookId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('book_pages')
      .upsert({
        id: page.id,
        book_id: bookId,
        page_number: page.pageNumber,
        text: page.text,
        image: page.image || null,
        layout: page.layout,
        background_color: page.backgroundColor || null,
        narration_url: page.narrationUrl || null,
        text_formatting: page.textFormatting ? JSON.stringify(page.textFormatting) : null,
        image_settings: page.imageSettings ? JSON.stringify(page.imageSettings) : null,
      });
    
    if (error) {
      console.error('Error updating page:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update page in Supabase:', error);
    return false;
  }
};
