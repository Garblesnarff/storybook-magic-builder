
import { Book, BookPage } from '@/types/book';
import { supabase } from '../../integrations/supabase/client';
import { databasePageToBookPage, bookPageToDatabasePage } from './utils';

// Fetch all books for a user
export const fetchBooks = async (userId: string): Promise<Book[]> => {
  try {
    const { data: booksData, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Transform the database books into our Book type
    const books: Book[] = await Promise.all(booksData.map(async (bookData: any) => {
      const { data: pagesData, error: pagesError } = await supabase
        .from('book_pages')
        .select('*')
        .eq('book_id', bookData.id)
        .order('page_number', { ascending: true });
      
      if (pagesError) throw pagesError;
      
      // Convert database pages to application BookPage format
      const bookPages: BookPage[] = (pagesData || []).map((dbPage: any) => 
        databasePageToBookPage(dbPage)
      );
      
      // Convert DB format to application format
      return {
        id: bookData.id,
        title: bookData.title || 'Untitled Book',
        author: bookData.author || '',
        description: bookData.description || '',
        userId: bookData.user_id,
        coverImage: bookData.cover_image_url || '',
        dimensions: {
          width: bookData.width || 8.5,
          height: bookData.height || 11
        },
        orientation: (bookData.orientation as "portrait" | "landscape") || 'portrait',
        pages: bookPages,
        createdAt: bookData.created_at || new Date().toISOString(),
        updatedAt: bookData.updated_at || new Date().toISOString()
      };
    }));
    
    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Create a new book
export const createBook = async (book: Book): Promise<Book> => {
  try {
    // Insert the book
    const { error: bookError } = await supabase
      .from('books')
      .insert([
        {
          id: book.id,
          title: book.title,
          author: book.author,
          description: book.description,
          user_id: book.userId,
          cover_image_url: book.coverImage,
          width: book.dimensions.width,
          height: book.dimensions.height,
          orientation: book.orientation,
          created_at: book.createdAt,
          updated_at: book.updatedAt
        }
      ]);
    
    if (bookError) throw bookError;
    
    // Insert all pages
    if (book.pages.length > 0) {
      // Convert each page to database format
      const dbPages = book.pages.map(page => 
        bookPageToDatabasePage(page, book.id)
      );
      
      // Insert all pages
      for (const dbPage of dbPages) {
        const { error } = await supabase
          .from('book_pages')
          .insert(dbPage);
          
        if (error) throw error;
      }
    }
    
    return book;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

// Fetch a specific book by ID
export const fetchBook = async (bookId: string): Promise<Book | null> => {
  try {
    const { data: bookData, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      throw error;
    }
    
    const { data: pagesData, error: pagesError } = await supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', bookId)
      .order('page_number', { ascending: true });
    
    if (pagesError) throw pagesError;
    
    // Map database page to app BookPage format
    const mappedPages = pagesData ? pagesData.map((dbPage: any) => ({
      id: dbPage.id,
      bookId: dbPage.book_id,
      pageNumber: dbPage.page_number,
      text: dbPage.text || '',
      image: dbPage.image_url || '',
      layout: dbPage.layout || 'text-left-image-right',
      textFormatting: {
        fontFamily: dbPage.font_family || 'Arial',
        fontSize: dbPage.font_size || 16,
        fontColor: dbPage.font_color || '#000000',
        isBold: dbPage.is_bold || false,
        isItalic: dbPage.is_italic || false
      },
      imageSettings: dbPage.image_settings || {
        scale: 1,
        position: { x: 0, y: 0 },
        fitMethod: 'contain'
      }
    })) : [];
    
    return {
      id: bookData.id,
      title: bookData.title || 'Untitled Book',
      author: bookData.author || '',
      description: bookData.description || '',
      userId: bookData.user_id,
      coverImage: bookData.cover_image_url || '',
      dimensions: {
        width: bookData.width || 8.5,
        height: bookData.height || 11
      },
      orientation: (bookData.orientation as "portrait" | "landscape") || 'portrait',
      pages: mappedPages,
      createdAt: bookData.created_at || new Date().toISOString(),
      updatedAt: bookData.updated_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

// Update a book
export const updateBook = async (book: Book): Promise<Book> => {
  try {
    // Update the book
    const { error: bookError } = await supabase
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
      .eq('id', book.id);
    
    if (bookError) throw bookError;
    
    return book;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

// Delete a book
export const deleteBook = async (bookId: string): Promise<void> => {
  try {
    // Delete the pages first (cascade delete doesn't always work reliably)
    const { error: pagesError } = await supabase
      .from('book_pages')
      .delete()
      .eq('book_id', bookId);
    
    if (pagesError) throw pagesError;
    
    // Delete the book
    const { error: bookError } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);
    
    if (bookError) throw bookError;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};
