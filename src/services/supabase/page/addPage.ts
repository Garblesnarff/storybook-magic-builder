
import { BookPage, DEFAULT_PAGE_TEXT } from '@/types/book';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { databasePageToBookPage } from '../utils';

/**
 * Function to add a new page to a book in Supabase
 */
export const addPageToSupabase = async (bookId: string, pageNumber: number): Promise<BookPage | null> => {
  try {
    const pageId = uuidv4();
    
    // Initial imageSettings with default values
    const defaultImageSettings = {
      scale: 1,
      position: { x: 0, y: 0 },
      fitMethod: 'contain'
    };
    
    // Insert the new page (use empty text by default)
    const { data, error } = await supabase
      .from('book_pages')
      .insert({
        id: pageId,
        book_id: bookId,
        page_number: pageNumber,
        text: DEFAULT_PAGE_TEXT, // Use empty text by default
        layout: 'text-left-image-right',
        image_settings: JSON.stringify(defaultImageSettings) // Store default image settings
      })
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error adding page:', error);
      toast.error('Failed to add new page.');
      return null;
    }
    
    return databasePageToBookPage(data);
  } catch (e) {
    console.error('Failed to add page to Supabase', e);
    toast.error('Failed to add new page.');
    return null;
  }
};
