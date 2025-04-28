
import { Book, BookPage } from '@/types/book';
import { supabase } from '@/integrations/supabase/client';
import { databasePageToBookPage } from './utils';
// Remove BookTemplate import or define it if needed

// Function to save a book to Supabase
export const saveBookToSupabase = async (book: Book): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('books')
      .upsert({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        user_id: book.userId,
        cover_image_url: book.coverImage,
        width: book.dimensions?.width || 8.5,
        height: book.dimensions?.height || 11,
        orientation: book.orientation || 'portrait',
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
      dimensions: {
        width: bookData.width || 8.5,
        height: bookData.height || 11
      },
      orientation: bookData.orientation || 'portrait',
      createdAt: bookData.created_at,
      updatedAt: bookData.updated_at
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
    
    if (!data) {
      return [];
    }
    
    const books = await Promise.all(data.map(async (bookData) => {
      // Convert null to empty string where needed
      const coverImage = bookData.cover_image_url || ''; // Ensure coverImage is string, not null
      
      // Fetch pages for this book
      const { data: pagesData, error: pagesError } = await supabase
        .from('book_pages')
        .select('*')
        .eq('book_id', bookData.id)
        .order('page_number', { ascending: true });
        
      let pages: BookPage[] = [];
      if (!pagesError && pagesData) {
        pages = pagesData.map(databasePageToBookPage);
      }
      
      return {
        id: bookData.id,
        title: bookData.title,
        author: bookData.author,
        description: bookData.description || '',
        userId: bookData.user_id || '',
        coverImage: coverImage,
        pages: pages,
        dimensions: {
          width: bookData.width || 8.5,
          height: bookData.height || 11
        },
        orientation: bookData.orientation as 'portrait' | 'landscape',
        createdAt: bookData.created_at,
        updatedAt: bookData.updated_at
      };
    }));
    
    return books;
  } catch (error) {
    console.error('Failed to load books from Supabase:', error);
    return [];
  }
};

// Function to create a new book in Supabase
export const createBookInSupabase = async (book: Book): Promise<Book> => {
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
          width: book.dimensions?.width || 8.5,
          height: book.dimensions?.height || 11,
          orientation: book.orientation || 'portrait',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating book:', error);
      throw error;
    }
    
    // Save pages
    for (const page of book.pages) {
      await updatePageInSupabase(page, book.id);
    }
    
    return book;
  } catch (error) {
    console.error('Failed to create book in Supabase:', error);
    throw error;
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
