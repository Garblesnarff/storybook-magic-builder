
import { useState, useEffect } from 'react';
import { Book } from '@/types/book';

export function useBookLoading(bookId: string | undefined, books: Book[], loadBook: (id: string) => Promise<Book | null>) {
  useEffect(() => {
    if (bookId && books.length > 0) {
      console.log('Attempting to load book with ID:', bookId);
      const bookExists = books.some(book => book.id === bookId);
      if (bookExists) {
        console.log('Book found, loading...');
        loadBook(bookId);
      } else {
        console.log('Book not found in available books');
      }
    }
  }, [bookId, books, loadBook]);
}
