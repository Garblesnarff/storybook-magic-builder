
import React from 'react';
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
    loading 
  } = useBook();
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
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
