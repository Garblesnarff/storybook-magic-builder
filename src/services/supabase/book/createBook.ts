
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/book';

/**
 * Function to create a new book in Supabase
 */
export const createBookInSupabase = async (book: Book): Promise<Book | null> => {
  try {
    // Ensure book has valid dimensions before insertion
    const bookWithValidDimensions = {
      ...book,
      dimensions: {
        width: book.dimensions?.width || 8.5,
        height: book.dimensions?.height || 11
      }
    };
    
    const { data, error } = await supabase
      .from('books')
      .insert({
        id: book.id,
        title: book.title || 'Untitled Book',
        author: book.author || 'Anonymous',
        description: book.description || '',
        cover_image_url: book.coverImage,
        width: bookWithValidDimensions.dimensions.width,
        height: bookWithValidDimensions.dimensions.height,
        orientation: book.orientation || 'portrait',
        created_at: book.createdAt,
        updated_at: book.updatedAt,
        user_id: book.userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating book in Supabase:', error);
      return null;
    }

    // Add the first page
    if (book.pages && book.pages.length > 0) {
      const firstPage = book.pages[0];
      
      // Only proceed if we have a valid first page object
      if (firstPage && firstPage.id) {
        const { error: pageError } = await supabase
          .from('book_pages')
          .insert({
            id: firstPage.id,
            book_id: book.id,
            page_number: 0,
            text: firstPage.text || '',
            layout: firstPage.layout || 'text-left-image-right',
            font_family: firstPage.textFormatting?.fontFamily || 'Inter',
            font_size: firstPage.textFormatting?.fontSize || 16,
            font_color: firstPage.textFormatting?.fontColor || '#000000',
            is_bold: firstPage.textFormatting?.isBold || false,
            is_italic: firstPage.textFormatting?.isItalic || false,
            image_settings: JSON.stringify(firstPage.imageSettings || {
              scale: 1,
              position: { x: 0, y: 0 },
              fitMethod: 'contain'
            })
          });

        if (pageError) {
          console.error('Error creating first page in Supabase:', pageError);
        }
      }
    }

    return book;
  } catch (e) {
    console.error('Failed to create book in Supabase:', e);
    return null;
  }
};
