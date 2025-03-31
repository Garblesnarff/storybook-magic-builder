import { supabase } from '@/integrations/supabase/client';
import { Book, BookPage, PageLayout } from '@/types/book';

// Function to upload an image to Supabase storage
export const uploadImageToSupabase = async (file: File, userId: string, bookId: string, pageId: string): Promise<string | null> => {
  try {
    const filePath = `images/${userId}/${bookId}/${pageId}/${file.name}`;
    const { data, error } = await supabase.storage
      .from('book-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Construct public URL
    const publicUrl = `https://your-supabase-url/storage/v1/object/public/book-images/${filePath}`; // Replace with your Supabase URL
    return publicUrl;
  } catch (error) {
    console.error('Error during image upload:', error);
    return null;
  }
};

// Function to fetch a book from the database
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
    const pages: BookPage[] = (pagesData || []).map(dbPage => ({
      id: dbPage.id,
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
      imageSettings: dbPage.image_settings
    }));

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
