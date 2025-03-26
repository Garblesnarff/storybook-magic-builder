
import React from 'react';
import { Layout } from '@/components/Layout';
import { BookList } from '@/components/BookList';
import { useBook } from '@/contexts/BookContext';
import { toast } from 'sonner';

const BooksPage = () => {
  const { books, createBook, deleteBook } = useBook();

  const handleCreateBook = () => {
    createBook();
    toast.success('New book created!');
  };

  const handleDeleteBook = (id: string) => {
    // In a real app, you might want to show a confirmation dialog
    deleteBook(id);
    toast.success('Book deleted');
  };

  return (
    <Layout>
      <div className="py-8">
        <BookList 
          books={books} 
          onCreateBook={handleCreateBook} 
          onDeleteBook={handleDeleteBook} 
        />
      </div>
    </Layout>
  );
};

export default BooksPage;
