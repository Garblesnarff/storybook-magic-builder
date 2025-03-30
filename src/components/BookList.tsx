
import React, { useState } from 'react';
import { Book } from '@/types/book';
import { BookCard } from './BookCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateSelectionDialog } from './TemplateSelectionDialog';
import { BookTemplate } from '@/data/bookTemplates';

interface BookListProps {
  books: Book[];
  onCreateBook: () => void;
  onCreateBookFromTemplate: (template: BookTemplate) => void;
  onDeleteBook: (id: string) => void;
}

export const BookList: React.FC<BookListProps> = ({ 
  books, 
  onCreateBook,
  onCreateBookFromTemplate,
  onDeleteBook 
}) => {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const handleCreateClick = () => {
    setTemplateDialogOpen(true);
  };

  const handleQuickCreate = () => {
    // Bypass template selection for quick create
    onCreateBook();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-semibold text-gray-900">My Books</h2>
        <Button onClick={handleCreateClick} className="bg-primary hover:bg-primary/90 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          New Book
        </Button>
      </div>
      
      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You don't have any books yet. Create your first book to get started.</p>
          <Button onClick={handleCreateClick} className="bg-primary hover:bg-primary/90">
            <Plus className="w-5 h-5 mr-2" />
            Create My First Book
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              onDelete={onDeleteBook}
            />
          ))}
          <div className="aspect-[3/4] flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
            <Button 
              variant="ghost" 
              onClick={handleQuickCreate} 
              className="flex flex-col h-auto py-8"
            >
              <Plus className="w-8 h-8 mb-2 text-gray-400" />
              <span className="text-gray-600">Quick Add</span>
            </Button>
          </div>
        </div>
      )}

      <TemplateSelectionDialog 
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onSelectTemplate={onCreateBookFromTemplate}
      />
    </div>
  );
};
