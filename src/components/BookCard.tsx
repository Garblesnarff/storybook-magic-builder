
import React from 'react';
import { Book } from '@/types/book';
import { formatDistanceToNow } from 'date-fns';
import { BookCopy, Clock, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { EditableTitle } from '@/components/EditableTitle';

interface BookCardProps {
  book: Book;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onDelete, onUpdateTitle }) => {
  const { id, title, author, updatedAt, pages } = book;
  
  const formattedDate = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
  
  const placeholderCover = 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80';
  
  return (
    <Card className="book-card group animate-fade-in h-full flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
        <img 
          src={book.coverImage || placeholderCover} 
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <CardContent className="flex-grow p-4">
        <EditableTitle 
          value={title} 
          onSave={(newTitle) => onUpdateTitle(id, newTitle)}
          className="font-display text-lg font-semibold text-gray-900 line-clamp-1" 
        />
        <p className="text-sm text-gray-600">by {author}</p>
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <BookCopy className="w-3 h-3 mr-1" />
          <span>{pages.length} pages</span>
        </div>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          <span>Updated {formattedDate}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive/90" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(id);
          }}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          <span className="sr-only">Delete</span>
        </Button>
        
        <Link to={`/editor/${id}`}>
          <Button variant="outline" size="sm" className="ml-auto">
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
