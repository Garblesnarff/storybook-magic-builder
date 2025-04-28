import { Book, BookPage, BookTemplate, PageLayout, ImageSettings } from '@/types/book';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { databasePageToBookPage } from './utils';

// Function to create a new book in Supabase
export const createBookInSupabase = async (bookTemplate: BookTemplate, userId: string): Promise<Book | null> => {
  try {
    const bookId = uuidv4();
    
    // Insert the new book
    const { error: insertError } = await supabase
      .from('books')
      .insert({
        id: bookId,
        user_id: userId,
        title: bookTemplate.title,
        cover_image: bookTemplate.coverImage,
        description: bookTemplate.description,
        dimensions: JSON.stringify(bookTemplate.dimensions),
        orientation: bookTemplate.orientation,
      });
    
    if (insertError) {
      console.error('Error creating book:', insertError);
      toast.error('Failed to create new book.');
      return null;
    }
    
    // Create initial pages based on template
    const initialPages = [];
    for (let i = 0; i < bookTemplate.initialPageCount; i++) {
      initialPages.push({
        id: uuidv4(),
        book_id: bookId,
        page_number: i + 1,
        text: '',
        image: null,
        layout: 'text-left-image-right',
        background_color: null,
        narration_url: null,
        textFormatting: {
          fontFamily: 'Arial',
          fontSize: 16,
          lineHeight: 1.5,
          isBold: false,
          isItalic: false,
          fontColor: '#000000',
          align: 'left',
          imageStyle: 'REALISTIC',
        },
        imageSettings: {
          scale: 1,
          position: { x: 0, y: 0 },
          fitMethod: 'contain'
        }
      });
    }
    
    // Insert initial pages
    const { error: pagesError } = await supabase
      .from('book_pages')
      .insert(initialPages);
    
    if (pagesError) {
      console.error('Error creating initial pages:', pagesError);
      toast.error('Failed to create initial pages.');
      return null;
    }
    
    // Fetch the newly created book
    const book = await getBookFromSupabase(bookId);
    return book;
  } catch (e) {
    console.error('Failed to create book in Supabase', e);
    toast.error('Failed to create new book.');
    return null;
  }
};

// Function to get a book from Supabase by ID
export const getBookFromSupabase = async (bookId: string): Promise<Book | null> => {
  try {
    // Fetch the book
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (bookError || !bookData) {
      console.error('Error fetching book:', bookError);
      return null;
    }
    
    // Fetch the pages for the book
    const { data: pagesData, error: pagesError } = await supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', bookId)
      .order('page_number', { ascending: true });
    
    if (pagesError) {
      console.error('Error fetching book pages:', pagesError);
      return null;
    }
    
    // Convert database page format to BookPage format
    const pages: BookPage[] = pagesData.map(databasePageToBookPage);
    
    // Construct the book object
    const book: Book = {
      id: bookData.id,
      userId: bookData.user_id,
      title: bookData.title,
      coverImage: bookData.cover_image || undefined,
      description: bookData.description || undefined,
      dimensions: bookData.dimensions ? JSON.parse(bookData.dimensions) : undefined,
      orientation: bookData.orientation,
      pages: pages,
    };
    
    return book;
  } catch (e) {
    console.error('Failed to get book from Supabase', e);
    return null;
  }
};

// Function to update a book's title in Supabase
export const updateBookTitleInSupabase = async (bookId: string, newTitle: string): Promise<boolean> => {
  try {
    // Update the book's title
    const { error: updateError } = await supabase
      .from('books')
      .update({ title: newTitle })
      .eq('id', bookId);
    
    if (updateError) {
      console.error('Error updating book title:', updateError);
      toast.error('Failed to update book title.');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Failed to update book title in Supabase', e);
    toast.error('Failed to update book title.');
    return false;
  }
};

// Function to delete a book from Supabase
export const deleteBookFromSupabase = async (bookId: string): Promise<boolean> => {
  try {
    // Delete the book
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);
    
    if (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book.');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Failed to delete book from Supabase', e);
    toast.error('Failed to delete book.');
    return false;
  }
};
