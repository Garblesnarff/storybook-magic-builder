import { Book, BookPage, ImageSettings, PageLayout } from '@/types/book';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { bookPageToDatabasePage, databasePageToBookPage } from './supabase/utils';

// Convert ImageSettings to a plain object that can be stored as JSON
function convertImageSettingsToJson(settings: ImageSettings | undefined): Record<string, any> | undefined {
  if (!settings) return undefined;
  
  return {
    scale: settings.scale || 1,
    position: settings.position || { x: 0, y: 0 },
    fitMethod: settings.fitMethod || 'contain'
  };
}

export async function createPageForBook(bookId: string, pageNumber: number, text: string): Promise<BookPage> {
  const pageId = `page-${Date.now()}-${uuidv4()}`;
  
  const newPage: BookPage = {
    id: pageId,
    bookId,
    pageNumber,
    text: text || '',
    image: '',
    layout: 'text-left-image-right',
    backgroundColor: null,
    textFormatting: {
      fontFamily: 'Arial',
      fontSize: 16,
      fontColor: '#000000',
      isBold: false,
      isItalic: false,
    },
    imageSettings: {
      scale: 1,
      position: { x: 0, y: 0 },
      fitMethod: 'contain'
    }
  };
  
  // Save to database
  try {
    const dbPage = bookPageToDatabasePage(newPage, bookId);
    
    // Convert ImageSettings to JSON format
    dbPage.image_settings = convertImageSettingsToJson(newPage.imageSettings);
    
    const { error } = await supabase.from('pages').insert(dbPage);
    
    if (error) {
      console.error('Error creating page:', error);
      throw new Error(`Failed to save page: ${error.message}`);
    }
    
    return newPage;
  } catch (err) {
    console.error('Error in createPageForBook:', err);
    throw err;
  }
}

export async function updatePageInDatabase(page: BookPage): Promise<BookPage> {
  try {
    const dbPage = bookPageToDatabasePage(page, page.bookId);
    
    // Convert ImageSettings to JSON format
    dbPage.image_settings = convertImageSettingsToJson(page.imageSettings);
    
    const { error } = await supabase
      .from('pages')
      .update(dbPage)
      .eq('id', page.id);
    
    if (error) {
      console.error('Error updating page:', error);
      throw new Error(`Failed to update page: ${error.message}`);
    }
    
    return page;
  } catch (err) {
    console.error('Error in updatePageInDatabase:', err);
    throw err;
  }
}

export async function deletePageFromDatabase(pageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', pageId);
    
    if (error) {
      console.error('Error deleting page:', error);
      throw new Error(`Failed to delete page: ${error.message}`);
    }
  } catch (err) {
    console.error('Error in deletePageFromDatabase:', err);
    throw err;
  }
}
