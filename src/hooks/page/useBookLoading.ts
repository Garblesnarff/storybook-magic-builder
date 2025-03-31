
import { useEffect } from 'react';
import { Book } from '@/types/book';
import { toast } from 'sonner';

export function useBookLoading(bookId: string | undefined, books: Book[], loadBook: (id: string) => Promise<Book | null>) {
  useEffect(() => {
    const fetchBook = async () => {
      try {
        // Only fetch if we have a book id
        if (bookId) {
          console.log('Attempting to load book with ID:', bookId);
          const bookExists = books.some(book => book.id === bookId);
          if (bookExists) {
            console.log('Book found, loading...');
            await loadBook(bookId);
          } else {
            console.log('Book not found in available books');
            toast.error('Book not found');
          }
        }
      } catch (error) {
        console.error('Failed to load book:', error);
        toast.error('Failed to load book');
      }
    };
    
    fetchBook();
  }, [bookId, books, loadBook]);
}
