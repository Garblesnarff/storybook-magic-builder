
import { Book, BookPage, ImageSettings } from '@/types/book';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { bookPageToDatabasePage, databasePageToBookPage } from './supabase/utils';
import { addPageToSupabase, updatePageInSupabase, deletePageFromSupabase } from './supabase/pageService';

// Convert ImageSettings to a plain object that can be stored as JSON
function convertImageSettingsToJson(settings: ImageSettings | undefined): Record<string, any> | undefined {
  if (!settings) return undefined;
  
  return {
    scale: settings.scale || 1,
    position: settings.position || { x: 0, y: 0 },
    fitMethod: settings.fitMethod || 'contain'
  };
}

// Create a new page for a book
export async function createPage(bookId: string): Promise<string | undefined> {
  try {
    // Get the current book pages to determine new page number
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('*, book_pages(*)')
      .eq('id', bookId)
      .single();
    
    if (bookError || !bookData) {
      console.error('Error fetching book:', bookError);
      throw new Error(`Failed to fetch book: ${bookError?.message || 'Unknown error'}`);
    }
    
    // Calculate the next page number
    const pageNumber = bookData.book_pages ? bookData.book_pages.length + 1 : 1;
    
    // Create the new page
    const newPage = await addPageToSupabase(bookId, pageNumber);
    
    if (!newPage) {
      throw new Error('Failed to create page');
    }
    
    return newPage.id;
  } catch (err) {
    console.error('Error in createPage:', err);
    throw err;
  }
}

export async function updatePage(page: BookPage): Promise<Book> {
  try {
    // First, let's convert any image settings to a format that can be stored in the database
    if (page.imageSettings) {
      page = {
        ...page,
        imageSettings: page.imageSettings
      };
    }
    
    // Update the page in the database
    const success = await updatePageInSupabase(page.bookId, page);
    if (!success) {
      throw new Error('Failed to update page in database');
    }
    
    // Now fetch the updated book to return
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*, book_pages(*)')
      .eq('id', page.bookId)
      .single();
    
    if (bookError || !book) {
      console.error('Error fetching updated book:', bookError);
      throw new Error(`Failed to fetch updated book: ${bookError?.message || 'Unknown error'}`);
    }
    
    // Convert the database book to our Book type
    const bookPages = book.book_pages.map(databasePageToBookPage);
    
    // Construct and return the book with updated pages
    const updatedBook: Book = {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description || '',
      userId: book.user_id || '',
      coverImage: book.cover_image_url || '',
      dimensions: {
        width: book.width,
        height: book.height
      },
      orientation: book.orientation,
      pages: bookPages,
      createdAt: book.created_at,
      updatedAt: book.updated_at
    };
    
    return updatedBook;
  } catch (err) {
    console.error('Error in updatePage:', err);
    throw err;
  }
}

export async function deletePage(pageId: string): Promise<void> {
  try {
    // First get the page to find its book ID
    const { data: page, error: pageError } = await supabase
      .from('book_pages')
      .select('book_id')
      .eq('id', pageId)
      .single();
    
    if (pageError || !page) {
      console.error('Error fetching page:', pageError);
      throw new Error(`Failed to fetch page: ${pageError?.message || 'Unknown error'}`);
    }
    
    const bookId = page.book_id;
    
    // Delete the page
    const success = await deletePageFromSupabase(bookId, pageId);
    if (!success) {
      throw new Error('Failed to delete page');
    }
  } catch (err) {
    console.error('Error in deletePage:', err);
    throw err;
  }
}
