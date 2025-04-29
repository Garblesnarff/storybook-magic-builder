
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { BookList } from '@/components/BookList';
import { useBook } from '@/contexts/BookContext';
import { Button } from '@/components/ui/button';
import { TemplateSelectionDialog } from '@/components/TemplateSelectionDialog';
import { useNavigate } from 'react-router-dom';
import { Loader2, PlusCircle } from 'lucide-react';
import { BookTemplate } from '@/data/bookTemplates';
import { Book } from '@/types/book';
import { toast } from 'sonner';

const BooksPage = () => {
  const navigate = useNavigate();
  const { books, loading, createBook, createBookFromTemplate, deleteBook, updateBook } = useBook();
  
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  
  useEffect(() => {
    document.title = 'My Books | Children\'s Book Generator';
  }, []);
  
  const handleCreateBook = async () => {
    setIsCreating(true);
    
    try {
      const bookId = await createBook();
      if (bookId) {
        navigate(`/editor/${bookId}`);
      } else {
        toast.error("Failed to create a new book");
      }
    } catch (error) {
      console.error("Error creating book:", error);
      toast.error("Failed to create a new book");
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleOpenTemplateDialog = () => {
    setShowTemplateDialog(true);
  };
  
  const handleSelectTemplate = async (template: BookTemplate) => {
    setIsCreating(true);
    
    try {
      const bookId = await createBookFromTemplate(template);
      if (bookId) {
        navigate(`/editor/${bookId}`);
      } else {
        toast.error("Failed to create a book from template");
      }
    } catch (error) {
      console.error("Error creating book from template:", error);
      toast.error("Failed to create a book from template");
    } finally {
      setIsCreating(false);
      setShowTemplateDialog(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await deleteBook(id);
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete the book");
    }
  };

  const handleUpdateBook = async (book: Book) => {
    try {
      await updateBook(book);
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Failed to update the book");
    }
  };

  return (
    <Layout className="bg-books-background bg-cover bg-center bg-no-repeat min-h-screen">
      <section className="container mx-auto my-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Books</h1>
          
          <div className="flex gap-3">
            <Button
              onClick={handleOpenTemplateDialog}
              variant="outline"
              disabled={isCreating}
            >
              From Template
            </Button>
            
            <Button
              onClick={handleCreateBook}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Book
                </>
              )}
            </Button>
          </div>
        </div>
        
        {loading && !books.length ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <BookList 
            books={books} 
            onCreateBook={handleCreateBook}
            onCreateBookFromTemplate={handleSelectTemplate}
            onDeleteBook={handleDeleteBook}
            onUpdateBook={handleUpdateBook}
          />
        )}
      </section>
      
      <TemplateSelectionDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onSelectTemplate={handleSelectTemplate}
      />
    </Layout>
  );
};

export default BooksPage;
