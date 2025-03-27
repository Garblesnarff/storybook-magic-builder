
import { Book, BookPage } from '../types/book';
import { toast } from 'sonner';

// Function to save books to localStorage with error handling
export const saveBooks = (books: Book[]) => {
  try {
    // Store basic book metadata separately from page content
    const bookMetadata = books.map(book => ({
      ...book,
      pages: book.pages.map(page => ({
        id: page.id,
        pageNumber: page.pageNumber,
        // Don't store images in localStorage to reduce size
        image: page.image ? 'image-exists' : undefined,
        layout: page.layout,
        backgroundColor: page.backgroundColor,
        textFormatting: page.textFormatting
      }))
    }));
    
    localStorage.setItem('books-metadata', JSON.stringify(bookMetadata));
    
    // Store each book's content separately to avoid hitting storage limits
    books.forEach(book => {
      try {
        book.pages.forEach(page => {
          if (page.text) {
            localStorage.setItem(`book-${book.id}-page-${page.id}-text`, page.text);
          }
          
          // Store images separately (might still fail due to size)
          if (page.image) {
            try {
              localStorage.setItem(`book-${book.id}-page-${page.id}-image`, page.image);
            } catch (e) {
              console.warn(`Failed to store image for book ${book.id}, page ${page.id}`, e);
              // Don't throw error here, just continue without storing the image
            }
          }
        });
      } catch (e) {
        console.error(`Error storing book ${book.id} data`, e);
      }
    });
  } catch (e) {
    console.error('Failed to save books to localStorage', e);
    toast.error('Failed to save your books locally. Some data may be lost when you reload.');
  }
};

// Function to load books from localStorage with error handling
export const loadBooks = (): Book[] => {
  try {
    // Load book metadata
    const savedMetadata = localStorage.getItem('books-metadata');
    if (!savedMetadata) return [];
    
    const bookMetadata = JSON.parse(savedMetadata) as Book[];
    
    // Reconstruct full books with page content
    return bookMetadata.map(book => {
      const fullPages = book.pages.map(page => {
        // Load text content
        let text = '';
        try {
          const savedText = localStorage.getItem(`book-${book.id}-page-${page.id}-text`);
          if (savedText) text = savedText;
        } catch (e) {
          console.warn(`Failed to load text for book ${book.id}, page ${page.id}`, e);
        }
        
        // Load image
        let image = undefined;
        if (page.image === 'image-exists') {
          try {
            image = localStorage.getItem(`book-${book.id}-page-${page.id}-image`) || undefined;
          } catch (e) {
            console.warn(`Failed to load image for book ${book.id}, page ${page.id}`, e);
          }
        }
        
        return {
          ...page,
          text: text || 'Once upon a time...',
          image
        } as BookPage;
      });
      
      return {
        ...book,
        pages: fullPages
      };
    });
  } catch (e) {
    console.error('Failed to load books from localStorage', e);
    toast.error('Failed to load your saved books. Starting with a new book.');
    return [];
  }
};
