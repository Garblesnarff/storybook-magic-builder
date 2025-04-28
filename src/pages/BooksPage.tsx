
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookList } from '@/components/BookList';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { TemplateSelectionDialog } from '@/components/TemplateSelectionDialog';
import { useBook } from '@/contexts/BookContext';
import { BookTemplate } from '@/data/bookTemplates';
import { useAuth } from '@/contexts/AuthContext';
import { PlusCircle, Loader2 } from 'lucide-react';

const BooksPage = () => {
  const navigate = useNavigate();
  const { books, loading, createBook, createBookFromTemplate } = useBook();
  const { session } = useAuth();
  // Remove user variable since it's not used
  
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
      }
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
      }
    } finally {
      setIsCreating(false);
      setShowTemplateDialog(false);
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
          <BookList books={books} />
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
