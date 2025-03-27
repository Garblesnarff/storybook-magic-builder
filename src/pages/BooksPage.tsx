
import React from 'react';
import { Layout } from '@/components/Layout';
import { BookList } from '@/components/BookList';
import { useBook } from '@/contexts/BookContext';
import { toast } from 'sonner';
import { BookTemplate } from '@/data/bookTemplates';

const BooksPage = () => {
  const { books, createBook, createBookFromTemplate, deleteBook } = useBook();

  const handleCreateBook = () => {
    createBook();
    toast.success('New book created!');
  };

  const handleCreateBookFromTemplate = (template: BookTemplate) => {
    createBookFromTemplate(template);
    toast.success(`New book created from the "${template.name}" template!`);
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
          onCreateBookFromTemplate={handleCreateBookFromTemplate}
          onDeleteBook={handleDeleteBook} 
        />
      </div>
    </Layout>
  );
};

export default BooksPage;
