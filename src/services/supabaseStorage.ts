
import { Book, BookPage } from '../types/book';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Function to convert BookPage type to database schema
const bookPageToDatabasePage = (bookPage: BookPage, bookId: string) => {
  return {
    id: bookPage.id,
    book_id: bookId,
    page_number: bookPage.pageNumber,
    text: bookPage.text,
    image_url: bookPage.image, // This will be updated to store image URLs
    layout: bookPage.layout,
    background_color: bookPage.backgroundColor,
    font_family: bookPage.textFormatting?.fontFamily,
    font_size: bookPage.textFormatting?.fontSize,
    font_color: bookPage.textFormatting?.fontColor,
    is_bold: bookPage.textFormatting?.isBold,
    is_italic: bookPage.textFormatting?.isItalic,
    image_style: bookPage.textFormatting?.imageStyle
  };
};

// Function to convert database page to BookPage type
const databasePageToBookPage = (dbPage: any): BookPage => {
  return {
    id: dbPage.id,
    pageNumber: dbPage.page_number,
    text: dbPage.text || 'Once upon a time...',
    image: dbPage.image_url,
    layout: dbPage.layout,
    backgroundColor: dbPage.background_color,
    textFormatting: {
      fontFamily: dbPage.font_family || 'Inter',
      fontSize: dbPage.font_size || 16,
      fontColor: dbPage.font_color || '#000000',
      isBold: dbPage.is_bold || false,
      isItalic: dbPage.is_italic || false,
      imageStyle: dbPage.image_style
    }
  };
};

// Upload an image to Supabase Storage
export const uploadImage = async (image: string, bookId: string, pageId: string): Promise<string | null> => {
  try {
    // Extract the base64 data from the string
    const base64Data = image.split(',')[1];
    if (!base64Data) return null;
    
    // Convert base64 to a Blob
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
    
    // Generate a unique file path
    const filePath = `${bookId}/${pageId}_${Date.now()}.png`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('book_images')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    // Return the public URL for the image
    const { data: urlData } = supabase
      .storage
      .from('book_images')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (e) {
    console.error('Failed to upload image to storage', e);
    return null;
  }
};

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
        .upsert(bookPageToDatabasePage(page, book.id));
      
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
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('book_images')
      .list(bookId);
    
    if (!storageError && storageData && storageData.length > 0) {
      const filesToDelete = storageData.map(file => `${bookId}/${file.name}`);
      
      await supabase
        .storage
        .from('book_images')
        .remove(filesToDelete);
    }
    
    toast.success('Book deleted successfully.');
    return true;
  } catch (e) {
    console.error('Failed to delete book from Supabase', e);
    toast.error('Failed to delete book.');
    return false;
  }
};

// Function to add a new page to a book in Supabase
export const addPageToSupabase = async (bookId: string, pageNumber: number): Promise<BookPage | null> => {
  try {
    const pageId = uuidv4();
    
    // Insert the new page
    const { data, error } = await supabase
      .from('book_pages')
      .insert({
        id: pageId,
        book_id: bookId,
        page_number: pageNumber,
        text: 'Once upon a time...',
        layout: 'text-left-image-right'
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

// Function to update a page in a book in Supabase
export const updatePageInSupabase = async (bookId: string, page: BookPage): Promise<boolean> => {
  try {
    // If page has a base64 image, upload it to storage
    if (page.image && page.image.startsWith('data:image')) {
      const imageUrl = await uploadImage(page.image, bookId, page.id);
      page.image = imageUrl || undefined;
    }
    
    // Update the page data
    const { error } = await supabase
      .from('book_pages')
      .update(bookPageToDatabasePage(page, bookId))
      .eq('id', page.id);
    
    if (error) {
      console.error('Error updating page:', error);
      toast.error('Failed to update page.');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Failed to update page in Supabase', e);
    toast.error('Failed to update page.');
    return false;
  }
};

// Function to delete a page from a book in Supabase
export const deletePageFromSupabase = async (bookId: string, pageId: string): Promise<boolean> => {
  try {
    // Delete the page
    const { error } = await supabase
      .from('book_pages')
      .delete()
      .eq('id', pageId);
    
    if (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page.');
      return false;
    }
    
    // Delete any associated image
    try {
      const { data, error: listError } = await supabase
        .storage
        .from('book_images')
        .list(bookId, {
          search: pageId
        });
      
      if (!listError && data && data.length > 0) {
        const filesToDelete = data.map(file => `${bookId}/${file.name}`);
        
        await supabase
          .storage
          .from('book_images')
          .remove(filesToDelete);
      }
    } catch (storageError) {
      console.error('Error deleting page images:', storageError);
      // Continue even if image deletion fails
    }
    
    return true;
  } catch (e) {
    console.error('Failed to delete page from Supabase', e);
    toast.error('Failed to delete page.');
    return false;
  }
};

// Function to reorder pages in a book in Supabase
export const reorderPagesInSupabase = async (bookId: string, pageOrdering: {id: string, pageNumber: number}[]): Promise<boolean> => {
  try {
    // Create an array of updates to perform
    const updates = pageOrdering.map(({id, pageNumber}) => ({
      id,
      book_id: bookId,
      page_number: pageNumber
    }));
    
    // Update all pages in a batch
    const { error } = await supabase
      .from('book_pages')
      .upsert(updates);
    
    if (error) {
      console.error('Error reordering pages:', error);
      toast.error('Failed to reorder pages.');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Failed to reorder pages in Supabase', e);
    toast.error('Failed to reorder pages.');
    return false;
  }
};
