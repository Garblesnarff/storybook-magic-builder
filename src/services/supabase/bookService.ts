
import { Book } from '../../types/book';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { databasePageToBookPage } from './utils';
import { uploadImage } from './storageService';
import { deleteBookImages } from './storageService';

// Save a book to Supabase
export const saveBookToSupabase = async (book: Book): Promise<void> => {
  try {
    // First save or update the book
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .upsert({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        cover_image_url: book.coverImage,
        orientation: book.orientation,
        width: book.dimensions.width,
        height: book.dimensions.height,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (bookError) {
      console.error('Error saving book:', bookError);
      toast.error('Failed to save book.');
      return;
    }
    
    // Process all pages for this book
    for (const page of book.pages) {
      // If page has an image that's a base64 string, upload it to storage
      if (page.image && page.image.startsWith('data:image')) {
        const imageUrl = await uploadImage(page.image, book.id, page.id);
        page.image = imageUrl || undefined;
      }
      
      // Save the page data
      const { error: pageError } = await supabase
        .from('book_pages')
        .upsert({
          id: page.id,
          book_id: book.id,
          page_number: page.pageNumber,
          text: page.text,
          image_url: page.image,
          layout: page.layout,
          background_color: page.backgroundColor,
          font_family: page.textFormatting?.fontFamily,
          font_size: page.textFormatting?.fontSize,
          font_color: page.textFormatting?.fontColor,
          is_bold: page.textFormatting?.isBold,
          is_italic: page.textFormatting?.isItalic,
          image_style: page.textFormatting?.imageStyle
        });
      
      if (pageError) {
        console.error('Error saving page:', pageError);
        toast.error(`Failed to save page ${page.pageNumber + 1}.`);
      }
    }
    
    toast.success('Book saved successfully!');
  } catch (e) {
    console.error('Failed to save book to Supabase', e);
    toast.error('Failed to save book data to the server.');
  }
};

// Function to load a single book from Supabase by ID
export const loadBookFromSupabase = async (bookId: string): Promise<Book | null> => {
  try {
    // Fetch book data
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (bookError || !bookData) {
      console.error('Error loading book:', bookError);
      return null;
    }
    
    // Fetch all pages for this book
    const { data: pagesData, error: pagesError } = await supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', bookId)
      .order('page_number', { ascending: true });
    
    if (pagesError) {
      console.error('Error loading pages:', pagesError);
      return null;
    }
    
    // Convert to our Book model
    const book: Book = {
      id: bookData.id,
      title: bookData.title,
      author: bookData.author,
      description: bookData.description || '',
      coverImage: bookData.cover_image_url,
      createdAt: bookData.created_at,
      updatedAt: bookData.updated_at,
      pages: (pagesData || []).map(databasePageToBookPage),
      orientation: bookData.orientation as 'portrait' | 'landscape',
      dimensions: {
        width: bookData.width,
        height: bookData.height
      }
    };
    
    return book;
  } catch (e) {
    console.error('Failed to load book from Supabase', e);
    toast.error('Failed to load book from the server.');
    return null;
  }
};

// Function to load all books from Supabase
export const loadBooksFromSupabase = async (): Promise<Book[]> => {
  try {
    // Fetch all books
    const { data: booksData, error: booksError } = await supabase
      .from('books')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (booksError) {
      console.error('Error loading books:', booksError);
      return [];
    }
    
    // For each book, load its details and pages
    const books: Book[] = [];
    for (const bookData of booksData || []) {
      const book = await loadBookFromSupabase(bookData.id);
      if (book) books.push(book);
    }
    
    return books;
  } catch (e) {
    console.error('Failed to load books from Supabase', e);
    toast.error('Failed to load books from the server.');
    return [];
  }
};

// Function to create a new book in Supabase
export const createBookInSupabase = async (bookData: Partial<Book>): Promise<Book | null> => {
  try {
    const newBookId = bookData.id || uuidv4();
    
    // Create the book entry
    const { data, error } = await supabase
      .from('books')
      .insert({
        id: newBookId,
        title: bookData.title || 'Untitled Book',
        author: bookData.author || 'Anonymous',
        description: bookData.description || '',
        orientation: bookData.orientation || 'portrait',
        width: bookData.dimensions?.width || 8.5,
        height: bookData.dimensions?.height || 11
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating book:', error);
      toast.error('Failed to create new book.');
      return null;
    }
    
    // Create an initial page for the book
    const pageId = uuidv4();
    const { error: pageError } = await supabase
      .from('book_pages')
      .insert({
        id: pageId,
        book_id: newBookId,
        page_number: 0,
        text: 'Once upon a time...',
        layout: 'text-left-image-right'
      });
    
    if (pageError) {
      console.error('Error creating initial page:', pageError);
      toast.error('Failed to create initial page for the book.');
    }
    
    // Load the complete book data
    return await loadBookFromSupabase(newBookId);
  } catch (e) {
    console.error('Failed to create book in Supabase', e);
    toast.error('Failed to create new book.');
    return null;
  }
};

// Function to delete a book from Supabase
export const deleteBookFromSupabase = async (bookId: string): Promise<boolean> => {
  try {
    // Delete the book (cascade will handle pages)
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);
    
    if (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book.');
      return false;
    }
    
    // Delete all images for this book from storage
    await deleteBookImages(bookId);
    
    toast.success('Book deleted successfully.');
    return true;
  } catch (e) {
    console.error('Failed to delete book from Supabase', e);
    toast.error('Failed to delete book.');
    return false;
  }
};
