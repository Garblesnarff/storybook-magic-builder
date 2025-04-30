
import { useCallback } from 'react';
import { Book } from '../../types/book';
import { createNewBook } from '../../services/bookOperations';
import { BookTemplate } from '@/data/bookTemplates';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useBookCreation(
  books: Book[],
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>,
  setCurrentBook: React.Dispatch<React.SetStateAction<Book | null>>
) {
  const { user } = useAuth();

  const createBook = useCallback(async (): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to create a book');
      return null;
    }
    
    try {
      console.log('Creating new book for user:', user.id);
      const newBook = await createNewBook(user.id);
      
      // Add null/undefined check for the newBook
      if (!newBook || typeof newBook !== 'object' || !newBook.id) {
        console.error('Failed to create book: Invalid book data returned');
        toast.error('Failed to create new book: Invalid data');
        return null;
      }
      
      console.log('Book created successfully:', newBook.id);
      setBooks(prevBooks => [...prevBooks, newBook]);
      setCurrentBook(newBook);
      return newBook.id;
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Failed to create new book');
      return null;
    }
  }, [user, setBooks, setCurrentBook]);

  const createBookFromTemplate = useCallback(async (template: BookTemplate): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to create a book');
      return null;
    }
    
    try {
      // Create base book object from template
      const newBook = template.createBook();
      
      // Save to database
      const savedBook = await createNewBook(user.id);
      
      // Add null/undefined check
      if (!savedBook || !savedBook.id) {
        toast.error('Failed to create book from template');
        return null;
      }
      
      // Merge template with saved book
      const mergedBook = { 
        ...savedBook, 
        ...newBook, 
        id: savedBook.id, 
        userId: user.id 
      };
      
      // Update the merged book in the database
      // Note: We'll handle the update in the main hook that combines all these hooks
      
      setBooks(prevBooks => [...prevBooks, mergedBook]);
      setCurrentBook(mergedBook);
      return mergedBook.id;
    } catch (error) {
      console.error('Error creating book from template:', error);
      toast.error('Failed to create book from template');
      return null;
    }
  }, [books, user, setBooks, setCurrentBook]);

  return {
    createBook,
    createBookFromTemplate
  };
}
