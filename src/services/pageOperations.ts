import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/book';

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
    const { data: updatedBook, error: bookError } = await supabase
      .from('books')
      .select(`*, pages(*)`)
      .eq('id', bookId)
      .single();
    
    if (bookError) {
      throw new Error(bookError.message);
    }
    
    return [updatedBook];
  } catch (err) {
    console.error('Error creating page:', err);
    return Promise.reject(err);
  }
}

export async function updatePage(page: any): Promise<Book> {
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
    const { data: updatedBook, error: bookError } = await supabase
      .from('books')
      .select(`*, pages(*)`)
      .eq('id', page.bookId)
      .single();
    
    if (bookError) {
      throw new Error(bookError.message);
    }
    
    return updatedBook;
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
