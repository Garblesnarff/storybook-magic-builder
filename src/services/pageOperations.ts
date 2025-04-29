
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Book, BookPage } from '@/types/book';

export async function createPage(bookId: string): Promise<string | Book[]> {
  try {
    const pageId = uuidv4();
    
    // Insert the new page into the database
    const { error } = await supabase
      .from('book_pages')
      .insert([
        {
          id: pageId,
          book_id: bookId,
          page_number: 1, // Initial page number, will be updated later
          text: 'Once upon a time...', // Default text
          layout: 'text-left-image-right' // Default layout
        }
      ]);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Fetch the updated book with all pages
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select(`id, title, author, description, user_id, cover_image_url, width, height, orientation, created_at, updated_at`)
      .eq('id', bookId)
      .single();
    
    if (bookError) {
      throw new Error(bookError.message);
    }
    
    // Fetch pages separately
    const { data: pagesData, error: pagesError } = await supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', bookId)
      .order('page_number', { ascending: true });
      
    if (pagesError) {
      throw new Error(pagesError.message);
    }
    
    // Create a properly formatted Book object
    const book: Book = {
      id: bookData.id,
      title: bookData.title || 'Untitled Book',
      author: bookData.author || '',
      description: bookData.description || '',
      userId: bookData.user_id || '',
      coverImage: bookData.cover_image_url || '',
      dimensions: {
        width: bookData.width || 8.5,
        height: bookData.height || 11
      },
      orientation: (bookData.orientation as "portrait" | "landscape") || 'portrait',
      pages: (pagesData || []).map((page: any) => ({
        id: page.id,
        bookId: page.book_id,
        pageNumber: page.page_number,
        text: page.text || '',
        image: page.image_url || '',
        layout: page.layout || 'text-left-image-right',
        textFormatting: {
          fontFamily: page.font_family || 'Arial',
          fontSize: page.font_size || 16,
          fontColor: page.font_color || '#000000',
          isBold: page.is_bold || false,
          isItalic: page.is_italic || false
        },
        imageSettings: page.image_settings || {
          scale: 1,
          position: { x: 0, y: 0 },
          fitMethod: 'contain'
        }
      })),
      createdAt: bookData.created_at || new Date().toISOString(),
      updatedAt: bookData.updated_at || new Date().toISOString()
    };
    
    return [book];
  } catch (err) {
    console.error('Error creating page:', err);
    return Promise.reject(err);
  }
}

export async function updatePage(page: BookPage): Promise<Book> {
  try {
    // Update the page in the database
    const { error } = await supabase
      .from('book_pages')
      .update({
        text: page.text,
        layout: page.layout,
        font_family: page.textFormatting?.fontFamily,
        font_size: page.textFormatting?.fontSize,
        font_color: page.textFormatting?.fontColor,
        image_url: page.image,
        image_settings: page.imageSettings,
        background_color: page.backgroundColor
      })
      .eq('id', page.id);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Fetch the updated book with all pages
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select(`id, title, author, description, user_id, cover_image_url, width, height, orientation, created_at, updated_at`)
      .eq('id', page.bookId)
      .single();
    
    if (bookError) {
      throw new Error(bookError.message);
    }
    
    // Fetch pages separately
    const { data: pagesData, error: pagesError } = await supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', page.bookId)
      .order('page_number', { ascending: true });
      
    if (pagesError) {
      throw new Error(pagesError.message);
    }
    
    // Create a properly formatted Book object
    const book: Book = {
      id: bookData.id,
      title: bookData.title || 'Untitled Book',
      author: bookData.author || '',
      description: bookData.description || '',
      userId: bookData.user_id || '',
      coverImage: bookData.cover_image_url || '',
      dimensions: {
        width: bookData.width || 8.5,
        height: bookData.height || 11
      },
      orientation: (bookData.orientation as "portrait" | "landscape") || 'portrait',
      pages: (pagesData || []).map((page: any) => ({
        id: page.id,
        bookId: page.book_id,
        pageNumber: page.page_number,
        text: page.text || '',
        image: page.image_url || '',
        layout: page.layout || 'text-left-image-right',
        textFormatting: {
          fontFamily: page.font_family || 'Arial',
          fontSize: page.font_size || 16,
          fontColor: page.font_color || '#000000',
          isBold: page.is_bold || false,
          isItalic: page.is_italic || false
        },
        imageSettings: page.image_settings || {
          scale: 1,
          position: { x: 0, y: 0 },
          fitMethod: 'contain'
        }
      })),
      createdAt: bookData.created_at || new Date().toISOString(),
      updatedAt: bookData.updated_at || new Date().toISOString()
    };
    
    return book;
  } catch (err) {
    console.error('Error updating page:', err);
    return Promise.reject(err);
  }
}

export async function deletePage(pageId: string): Promise<void> {
  try {
    // Delete the page from the database
    const { error } = await supabase
      .from('book_pages')
      .delete()
      .eq('id', pageId);
    
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    console.error('Error deleting page:', err);
    return Promise.reject(err);
  }
}
