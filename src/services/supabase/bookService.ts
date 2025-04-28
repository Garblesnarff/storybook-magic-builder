
import { Book, PageLayout } from '@/types/book';
import { supabase } from '../../integrations/supabase/client';

// Fetch all books for a user
export const fetchBooks = async (userId: string): Promise<Book[]> => {
  try {
    const { data: booksData, error } = await supabase
      .from('books')
      .select('*')
      .eq('userId', userId);
      
    if (error) throw error;
    
    // Transform the database books into our Book type
    const books: Book[] = await Promise.all(booksData.map(async (book) => {
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .eq('bookId', book.id)
        .order('pageNumber', { ascending: true });
      
      if (pagesError) throw pagesError;
      
      return {
        id: book.id,
        title: book.title || 'Untitled Book',
        author: book.author || '',
        description: book.description || '',
        userId: book.userId,
        coverImage: book.coverImage || '',
        dimensions: {
          width: book.width || 8.5,
          height: book.height || 11
        },
        orientation: (book.orientation as "portrait" | "landscape") || 'portrait',
        pages: pagesData || [],
        createdAt: book.createdAt || new Date().toISOString(),
        updatedAt: book.updatedAt || new Date().toISOString()
      };
    }));
    
    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Create a new book
export const createBook = async (book: Book): Promise<Book> => {
  try {
    // Insert the book
    const { error: bookError } = await supabase
      .from('books')
      .insert([
        {
          id: book.id,
          title: book.title,
          author: book.author,
          description: book.description,
          userId: book.userId,
          coverImage: book.coverImage,
          width: book.dimensions.width,
          height: book.dimensions.height,
          orientation: book.orientation as "portrait" | "landscape",
          createdAt: book.createdAt,
          updatedAt: book.updatedAt
        }
      ]);
    
    if (bookError) throw bookError;
    
    // Insert all pages
    if (book.pages.length > 0) {
      const { error: pagesError } = await supabase
        .from('pages')
        .insert(book.pages.map(page => ({
          id: page.id,
          bookId: book.id,
          pageNumber: page.pageNumber,
          text: page.text,
          image: page.image,
          layout: page.layout,
          textFormatting: page.textFormatting,
          imageSettings: page.imageSettings
        })));
      
      if (pagesError) throw pagesError;
    }
    
    return book;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

// Fetch a specific book by ID
export const fetchBook = async (bookId: string): Promise<Book | null> => {
  try {
    const { data: bookData, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      throw error;
    }
    
    const { data: pagesData, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('bookId', bookId)
      .order('pageNumber', { ascending: true });
    
    if (pagesError) throw pagesError;
    
    return {
      id: bookData.id,
      title: bookData.title || 'Untitled Book',
      author: bookData.author || '',
      description: bookData.description || '',
      userId: bookData.userId,
      coverImage: bookData.coverImage || '',
      dimensions: {
        width: bookData.width || 8.5,
        height: bookData.height || 11
      },
      orientation: (bookData.orientation as "portrait" | "landscape") || 'portrait',
      pages: pagesData || [],
      createdAt: bookData.createdAt || new Date().toISOString(),
      updatedAt: bookData.updatedAt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

// Update a book
export const updateBook = async (book: Book): Promise<Book> => {
  try {
    // Update the book
    const { error: bookError } = await supabase
      .from('books')
      .update({
        title: book.title,
        author: book.author,
        description: book.description,
        coverImage: book.coverImage,
        width: book.dimensions.width,
        height: book.dimensions.height,
        orientation: book.orientation,
        updatedAt: new Date().toISOString()
      })
      .eq('id', book.id);
    
    if (bookError) throw bookError;
    
    return book;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

// Delete a book
export const deleteBook = async (bookId: string): Promise<void> => {
  try {
    // Delete the pages first (cascade delete doesn't always work reliably)
    const { error: pagesError } = await supabase
      .from('pages')
      .delete()
      .eq('bookId', bookId);
    
    if (pagesError) throw pagesError;
    
    // Delete the book
    const { error: bookError } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);
    
    if (bookError) throw bookError;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};
