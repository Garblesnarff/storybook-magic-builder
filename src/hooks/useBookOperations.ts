
import { useState, useEffect } from 'react';
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
  }, []);

  const createBook = async (): Promise<string | null> => {
    try {
      const newBook = await createNewBook();
      setBooks(prevBooks => [...prevBooks, newBook]);
      setCurrentBook(newBook);
      return newBook.id;
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Failed to create new book');
      return null;
    }
  };

  const createBookFromTemplate = async (template: BookTemplate): Promise<string | null> => {
    try {
      const newBook = template.createBook();
      const savedBook = await createNewBook();
      // Merge template book data with saved book
      const mergedBook = { ...savedBook, ...newBook, id: savedBook.id };
      await updateBookService(mergedBook, books);
      
      setBooks(prevBooks => [...prevBooks, mergedBook]);
      setCurrentBook(mergedBook);
      return mergedBook.id;
    } catch (error) {
      console.error('Error creating book from template:', error);
      toast.error('Failed to create book from template');
      return null;
    }
  };

  const loadBook = async (id: string): Promise<Book | null> => {
    try {
      const book = await loadBookById(id);
      if (book) {
        setCurrentBook(book);
        return book;
      }
      return null;
    } catch (error) {
      console.error('Error loading book:', error);
      toast.error('Failed to load book');
      return null;
    }
  };

  const updateBookState = async (updatedBook: Book): Promise<void> => {
    try {
      const updatedBooks = await updateBookService(updatedBook, books);
      setBooks(updatedBooks);
      
      if (currentBook?.id === updatedBook.id) {
        setCurrentBook({ ...updatedBook });
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    }
  };

  const deleteBook = async (id: string): Promise<void> => {
    try {
      const updatedBooks = await deleteBookService(id, books);
      setBooks(updatedBooks);
      
      if (currentBook?.id === id) {
        setCurrentBook(updatedBooks.length ? updatedBooks[0] : null);
      }
      
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

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
