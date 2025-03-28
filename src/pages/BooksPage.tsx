
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { BookList } from '@/components/BookList';
import { useBook } from '@/contexts/BookContext';
import { toast } from 'sonner';
import { BookTemplate } from '@/data/bookTemplates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BooksPage = () => {
  const { books, createBook, createBookFromTemplate, deleteBook } = useBook();
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  const handleCreateBook = () => {
    createBook();
    toast.success('New book created!');
  };

  const handleCreateBookFromTemplate = (template: BookTemplate) => {
    createBookFromTemplate(template);
    toast.success(`New book created from the "${template.name}" template!`);
  };

  const handleDeleteBook = (id: string) => {
    // Show confirmation dialog instead of deleting immediately
    setBookToDelete(id);
  };

  const confirmDeleteBook = () => {
    if (bookToDelete) {
      deleteBook(bookToDelete);
      setBookToDelete(null);
      toast.success('Book deleted');
    }
  };

  const cancelDeleteBook = () => {
    setBookToDelete(null);
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

        <AlertDialog open={!!bookToDelete} onOpenChange={() => setBookToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this book?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the book and all its pages.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDeleteBook}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteBook} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default BooksPage;
