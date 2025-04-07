
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { BookList } from '@/components/BookList';
import { useBook } from '@/contexts/BookContext';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const BooksPage: React.FC = () => {
  const { 
    books, 
    createBook, 
    createBookFromTemplate, 
    updateBook,
    deleteBook, 
    loading: booksLoading,
    error: booksError,
    retryLoading
  } = useBook();
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Report any errors that occur during book loading
  useEffect(() => {
    if (booksError) {
      console.error('Error loading books:', booksError);
      toast.error('Failed to load books. Please try again.');
    }
  }, [booksError]);
  
  // Track when initial loading is complete to avoid getting stuck in loading state
  useEffect(() => {
    if (!authLoading && user) {
      // Set a timeout to ensure we don't get stuck in loading
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 3000); // Give it 3 seconds max to load books
      
      return () => clearTimeout(timer);
    }
    
    if (!authLoading && !user) {
      // If not authenticated, mark load as complete immediately
      setInitialLoadComplete(true);
    }
  }, [authLoading, user]);
  
  const handleCreateBook = async () => {
    try {
      const newBookId = await createBook();
      if (newBookId) {
        navigate(`/editor/${newBookId}`);
        toast.success('Book created successfully');
      }
    } catch (error) {
      console.error('Error creating book', error);
      toast.error('Failed to create book');
    }
  };
  
  const handleCreateBookFromTemplate = async (template: any) => {
    try {
      const newBookId = await createBookFromTemplate(template);
      if (newBookId) {
        navigate(`/editor/${newBookId}`);
        toast.success('Book created from template');
      }
    } catch (error) {
      console.error('Error creating book from template', error);
      toast.error('Failed to create book from template');
    }
  };
  
  const handleDeleteBook = async (id: string) => {
    try {
      await deleteBook(id);
      toast.success('Book deleted');
    } catch (error) {
      console.error('Error deleting book', error);
      toast.error('Failed to delete book');
    }
  };

  const handleRetry = () => {
    console.log('Manually retrying book loading');
    retryLoading();
    setInitialLoadComplete(false);
    setTimeout(() => setInitialLoadComplete(true), 5000);
  };
  
  // Show a comprehensive loading state with retry button if it takes too long
  if ((authLoading || (booksLoading && !initialLoadComplete)) && user) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 mb-4">
              {authLoading ? 'Verifying your account...' : 'Loading your books...'}
            </p>
            
            {!authLoading && initialLoadComplete && (
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="mt-4"
              >
                Loading taking too long? Click to retry
              </Button>
            )}
          </div>
        </div>
      </Layout>
    );
  }
  
  // Show a specific message if there's an authentication issue
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-8 text-center">
              Please sign in to view and create books.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              size="lg"
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout rootClassName="bg-books-background bg-cover bg-center bg-no-repeat"> 
      <div className="container mx-auto py-8 px-4">
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Welcome to Children's Book Generator!</h2>
            <p className="text-gray-600 mb-8 text-center">
              You don't have any books yet. Create your first book to get started!
            </p>
            <Button 
              onClick={handleCreateBook}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              size="lg"
            >
              Create Your First Book
            </Button>
          </div>
        ) : (
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
