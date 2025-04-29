
import { Book, BookPage } from '@/types/book';
import { supabase } from '@/integrations/supabase/client';
import { databasePageToBookPage } from './supabase/utils';
import { addPageToSupabase, updatePageInSupabase, deletePageFromSupabase } from './supabase/pageService';

// Create a new page for a book
export async function createPage(bookId: string): Promise<string | undefined> {
  try {
    // Get the current book pages to determine new page number
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('*, book_pages(*)')
      .eq('id', bookId)
      .maybeSingle();
    
    if (bookError) {
      console.error('Error fetching book:', bookError);
      throw new Error(`Failed to fetch book: ${bookError?.message || 'Unknown error'}`);
    }
    
    if (!bookData) {
      console.error(`Book with ID ${bookId} not found`);
      throw new Error(`Book with ID ${bookId} not found`);
    }
    
    // Calculate the next page number
    const pageNumber = bookData.book_pages ? bookData.book_pages.length + 1 : 1;
    
    // Create the new page
    const newPage = await addPageToSupabase(bookId, pageNumber);
    
    if (!newPage) {
      throw new Error('Failed to create page');
    }
    
    return newPage.id;
  } catch (err) {
    console.error('Error in createPage:', err);
    throw err;
  }
}

// Update the function to use maybeSingle instead of single and handle book-not-found cases
export async function updatePage(page: BookPage): Promise<Book> {
  try {
    // Validate bookId before proceeding
    if (!page.bookId) {
      throw new Error('Book ID is missing from the page data');
    }
    
    console.log(`Updating page ${page.id} for book ${page.bookId}`);
    
    // First update the page in the database
    const success = await updatePageInSupabase(page.bookId, page);
    if (!success) {
      throw new Error('Failed to update page in database');
    }
    
    // Now fetch the updated book to return
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*, book_pages(*)')
      .eq('id', page.bookId)
      .maybeSingle();
    
    if (bookError) {
      console.error('Error fetching updated book:', bookError);
      throw new Error(`Failed to fetch updated book: ${bookError?.message || 'Unknown error'}`);
    }
    
    if (!book) {
      console.warn(`Book with ID ${page.bookId} not found when updating page. Returning simplified book object.`);
      
      // Create a minimal book object with just the updated page
      // This ensures we don't break downstream code that expects a Book object
      return {
        id: page.bookId,
        title: 'Unknown Book',
        author: 'Unknown Author',
        description: '',
        userId: '',
        coverImage: '',
        dimensions: {
          width: 8.5,
          height: 11
        },
        orientation: "portrait",
        pages: [page],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    // Convert the database book to our Book type
    const bookPages = book.book_pages.map(databasePageToBookPage);
    
    const updatedBook: Book = {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description || '',
      userId: book.user_id || '',
      coverImage: book.cover_image_url || '',
      dimensions: {
        width: book.width,
        height: book.height
      },
      orientation: book.orientation as "portrait" | "landscape",
      pages: bookPages,
      createdAt: book.created_at,
      updatedAt: book.updated_at
    };
    
    return updatedBook;
  } catch (err) {
    console.error('Error in updatePage:', err);
    throw err;
  }
}

export async function deletePage(pageId: string): Promise<void> {
  try {
    // First get the page to find its book ID
    const { data: page, error: pageError } = await supabase
      .from('book_pages')
      .select('book_id')
      .eq('id', pageId)
      .single();
    
    if (pageError || !page) {
      console.error('Error fetching page:', pageError);
      throw new Error(`Failed to fetch page: ${pageError?.message || 'Unknown error'}`);
    }
    
    const bookId = page.book_id;
    
    // Delete the page
    const success = await deletePageFromSupabase(bookId, pageId);
    if (!success) {
      throw new Error('Failed to delete page');
    }
  } catch (err) {
    console.error('Error in deletePage:', err);
    throw err;
  }
}
