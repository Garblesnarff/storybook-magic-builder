
import { useState, useEffect } from 'react';
import { Book } from '../../types/book';
import { loadAllBooks } from '../../services/bookOperations';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useBookData() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading books from Supabase...');
        
        if (!user || !user.id) {
          console.log('No authenticated user found, skipping book load');
          setBooks([]);
          setLoading(false);
          return;
        }
        
        // Add null check for loadAllBooks result
        const fetchedBooks = await loadAllBooks() || [];
        
        // Ensure we have valid books before filtering
        const validFetchedBooks = Array.isArray(fetchedBooks) 
          ? fetchedBooks.filter(book => book && typeof book === 'object')
          : [];
        
        // Filter books by current user's ID
        const userBooks = validFetchedBooks.filter(book => book.userId === user.id);
        
        setBooks(userBooks);
        
        if (userBooks.length) {
          console.log(`Found ${userBooks.length} existing books for the user`);
        } else {
          console.log('No books found for the user');
        }
        
        setLoading(false);
      } catch (e) {
        console.error('Error initializing books', e);
        setError('Failed to load books');
        setLoading(false);
        // Set empty array to prevent null reference issues
        setBooks([]);
      }
    }

    if (user) {
      fetchBooks();
    } else {
      setBooks([]);
      setLoading(false);
    }
    
  }, [user]);

  return {
    books,
    setBooks,
    currentBook,
    setCurrentBook,
    loading,
    error
  };
}
