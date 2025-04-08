import { supabase } from '@/integrations/supabase/client';
import { Book, BookPage, PageLayout, ImageSettings } from '@/types/book';

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

// All the book operations that were previously missing
export const saveBookToSupabase = async (book: Book): Promise<boolean> => {
  try {
    const { error } = await supabase
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

    if (error) {
      console.error('Error saving book to Supabase:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Failed to save book to Supabase:', e);
    return false;
  }
};

export const loadBookFromSupabase = async (bookId: string): Promise<Book | null> => {
  return await fetchBookFromDatabase(bookId);
};

export const loadBooksFromSupabase = async (): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading books from Supabase:', error);
      return [];
    }

    const books: Book[] = [];
    
    for (const bookData of data || []) {
      const book = await loadBookFromSupabase(bookData.id);
      if (book) books.push(book);
    }

    return books;
  } catch (e) {
    console.error('Failed to load books from Supabase:', e);
    return [];
  }
};

export const createBookInSupabase = async (book: Book): Promise<Book | null> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .insert({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        cover_image_url: book.coverImage,
        width: book.dimensions.width,
        height: book.dimensions.height,
        orientation: book.orientation,
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
      const { error: pageError } = await supabase
        .from('book_pages')
        .insert({
          id: firstPage.id,
          book_id: book.id,
          page_number: 0,
          text: firstPage.text || '',
          layout: firstPage.layout,
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

    return book;
  } catch (e) {
    console.error('Failed to create book in Supabase:', e);
    return null;
  }
};

export const deleteBookFromSupabase = async (bookId: string): Promise<boolean> => {
  try {
    // First delete all pages associated with this book
    const { error: pagesError } = await supabase
      .from('book_pages')
      .delete()
      .eq('book_id', bookId);

    if (pagesError) {
      console.error('Error deleting book pages from Supabase:', pagesError);
      return false;
    }

    // Then delete the book itself
    const { error: bookError } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);

    if (bookError) {
      console.error('Error deleting book from Supabase:', bookError);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Failed to delete book from Supabase:', e);
    return false;
  }
};
