
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyBooksStateProps {
  onCreateBook: () => void;
}

export const EmptyBooksState: React.FC<EmptyBooksStateProps> = ({ onCreateBook }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Welcome to Children's Book Generator!</h2>
      <p className="text-gray-600 mb-8 text-center">
        You don't have any books yet. Create your first book to get started!
      </p>
      <Button 
        onClick={onCreateBook}
        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        size="lg"
      >
        Create Your First Book
      </Button>
    </div>
  );
};
