
import { supabase } from '@/integrations/supabase/client';
import { Book, BookPage, PageLayout, ImageSettings } from '@/types/book';

/**
 * Function to fetch a book from the database
 */
export const fetchBookFromDatabase = async (bookId: string): Promise<Book | null> => {
  try {
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (bookError || !bookData) {
      console.error('Error fetching book:', bookError);
      return null;
    }

    // Now fetch the pages for this book
    const { data: pagesData, error: pagesError } = await supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', bookId)
      .order('page_number', { ascending: true });

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
      return null;
    }

    // Transform database pages to BookPage objects
    const pages: BookPage[] = (pagesData || []).map(dbPage => {
      // Parse the JSON imageSettings if it exists
      let imageSettings: ImageSettings | undefined = undefined;
      if (dbPage.image_settings) {
        try {
          imageSettings = typeof dbPage.image_settings === 'string' 
            ? JSON.parse(dbPage.image_settings) 
            : dbPage.image_settings;
        } catch (e) {
          console.error('Error parsing image settings:', e);
          imageSettings = { scale: 1, position: { x: 0, y: 0 }, fitMethod: 'contain' };
        }
      }

      return {
        id: dbPage.id,
        bookId: bookId, // Ensure bookId is set correctly
        pageNumber: dbPage.page_number,
        text: dbPage.text || '',
        image: dbPage.image_url,
        layout: dbPage.layout as PageLayout,
        backgroundColor: dbPage.background_color,
        narrationUrl: dbPage.narration_url,
        textFormatting: {
          fontFamily: dbPage.font_family,
          fontSize: dbPage.font_size,
          fontColor: dbPage.font_color,
          isBold: dbPage.is_bold,
          isItalic: dbPage.is_italic,
          imageStyle: dbPage.image_style
        },
        imageSettings: imageSettings || { scale: 1, position: { x: 0, y: 0 }, fitMethod: 'contain' }
      };
    });

    // Return the complete book with pages and required userId field
    return {
      id: bookData.id,
      title: bookData.title,
      author: bookData.author,
      description: bookData.description || '',
      coverImage: bookData.cover_image_url,
      orientation: bookData.orientation as 'portrait' | 'landscape',
      dimensions: {
        width: Number(bookData.width),
        height: Number(bookData.height)
      },
      pages,
      createdAt: bookData.created_at,
      updatedAt: bookData.updated_at,
      userId: bookData.user_id || '' // Make sure we include userId
    };
  } catch (error) {
    console.error('Error fetching book data:', error);
    return null;
  }
};
