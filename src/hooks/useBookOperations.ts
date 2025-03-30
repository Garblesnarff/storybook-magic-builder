
import { useState, useEffect, useCallback } from 'react'; // <-- Add useCallback
import { Book } from '../types/book';
import { 
  createNewBook, 
  updateBook as updateBookService, 
  deleteBook as deleteBookService,
  loadBookById,
  loadAllBooks
} from '../services/bookOperations';
import { BookTemplate } from '@/data/bookTemplates';
import { toast } from 'sonner';

export function useBookOperations() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load books from Supabase on initial mount
  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        console.log('Loading books from Supabase...');
        const fetchedBooks = await loadAllBooks();
        setBooks(fetchedBooks);
        
        if (fetchedBooks.length) {
          console.log(`Found ${fetchedBooks.length} existing books`);
        } else {
          console.log('No books found');
        }
        
        setLoading(false);
      } catch (e) {
        console.error('Error initializing books', e);
        setError('Failed to load books');
        setLoading(false);
      }
    }

    fetchBooks();
  }, []); // Empty dependency array is correct here

  const createBook = useCallback(async (): Promise<string | null> => {
    try {
      const newBook = await createNewBook();
      setBooks(prevBooks => [...prevBooks, newBook]); // setBooks is stable
      setCurrentBook(newBook); // setCurrentBook is stable
      return newBook.id;
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Failed to create new book');
      return null;
    }
  }, []); // No external dependencies needed

  const createBookFromTemplate = useCallback(async (template: BookTemplate): Promise<string | null> => {
    try {
      const newBook = template.createBook();
      const savedBook = await createNewBook();
      const mergedBook = { ...savedBook, ...newBook, id: savedBook.id };
      // Pass books state directly, useCallback will close over the current value
      // If updateBookService *mutates* books, this could be an issue, but assuming it returns new array
      await updateBookService(mergedBook, books); 
      
      setBooks(prevBooks => [...prevBooks, mergedBook]);
      setCurrentBook(mergedBook);
      return mergedBook.id;
    } catch (error) {
      console.error('Error creating book from template:', error);
      toast.error('Failed to create book from template');
      return null;
    }
  }, [books]); // Depends on the current list of books for updateBookService

  const loadBook = useCallback(async (id: string): Promise<Book | null> => {
    try {
      const book = await loadBookById(id);
      if (book) {
        setCurrentBook(book); // setCurrentBook is stable
        return book;
      }
      return null;
    } catch (error) {
      console.error('Error loading book:', error);
      toast.error('Failed to load book');
      return null;
    }
  }, []); // No external dependencies needed

  const updateBookState = useCallback(async (updatedBook: Book): Promise<void> => {
    try {
      // Pass books state directly
      const updatedBooksResult = await updateBookService(updatedBook, books); 
      setBooks(updatedBooksResult); // setBooks is stable
      
      // Use currentBook state directly
      if (currentBook?.id === updatedBook.id) { 
        setCurrentBook({ ...updatedBook }); // setCurrentBook is stable
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    }
  }, [books, currentBook]); // Depends on books and currentBook

  const deleteBook = useCallback(async (id: string): Promise<void> => {
    try {
      // Pass books state directly
      const updatedBooksResult = await deleteBookService(id, books); 
      setBooks(updatedBooksResult); // setBooks is stable
      
      // Use currentBook state directly
      if (currentBook?.id === id) { 
        setCurrentBook(updatedBooksResult.length ? updatedBooksResult[0] : null); // setCurrentBook is stable
      }
      
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  }, [books, currentBook]); // Depends on books and currentBook

  return {
    books,
    currentBook,
    createBook,
    createBookFromTemplate,
    updateBook: updateBookState,
    deleteBook,
    loadBook,
    loading,
    error,
    // Export state setters to be used by usePageOperations
    setBooks,
    setCurrentBook
  };
}
