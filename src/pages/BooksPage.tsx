
import React from 'react';
import { Layout } from '@/components/Layout';
import { BookList } from '@/components/BookList';
import { BookLoadingState } from '@/components/books/BookLoadingState';
import { AuthRequiredState } from '@/components/books/AuthRequiredState';
import { EmptyBooksState } from '@/components/books/EmptyBooksState';
import { useBookPageState } from '@/hooks/books/useBookPageState';

const BooksPage: React.FC = () => {
  const {
    books,
    user,
    updateBook,
    isInitialLoading,
    isLoadingStuck,
    isAuthenticated,
    handleCreateBook,
    handleCreateBookFromTemplate,
    handleDeleteBook,
    handleRetry,
    handleHardRefresh
  } = useBookPageState();
  
  return (
    <Layout rootClassName="bg-books-background bg-cover bg-center bg-no-repeat"> 
      <div className="container mx-auto py-8 px-4">
        {isInitialLoading && (
          <BookLoadingState />
        )}
        
        {isLoadingStuck && (
          <BookLoadingState 
            isStuck={true}
            onRetry={handleRetry}
            onHardRefresh={handleHardRefresh}
          />
        )}
        
        {!isAuthenticated && !isInitialLoading && !isLoadingStuck && (
          <AuthRequiredState />
        )}
        
        {isAuthenticated && !isInitialLoading && !isLoadingStuck && books.length === 0 && (
          <EmptyBooksState onCreateBook={handleCreateBook} />
        )}
        
        {isAuthenticated && !isInitialLoading && !isLoadingStuck && books.length > 0 && (
          <BookList
            books={books}
            onCreateBook={handleCreateBook}
            onCreateBookFromTemplate={handleCreateBookFromTemplate}
            onDeleteBook={handleDeleteBook}
            onUpdateBook={updateBook}
          />
        )}
      </div>
    </Layout>
  );
};

export default BooksPage;
