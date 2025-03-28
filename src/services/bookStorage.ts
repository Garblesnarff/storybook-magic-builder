
import { Book, BookPage } from '../types/book';
import { toast } from 'sonner';

// Function to sanitize text for localStorage
const sanitizeText = (text: string): string => {
  return text || '';
};

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
          if (page.text !== undefined) {
            const sanitizedText = sanitizeText(page.text);
            localStorage.setItem(`book-${book.id}-page-${page.id}-text`, sanitizedText);
            console.log(`Saved text for book ${book.id}, page ${page.id}:`, sanitizedText.substring(0, 50));
          }
          
          // Store images separately (might still fail due to size)
          if (page.image) {
            try {
              localStorage.setItem(`book-${book.id}-page-${page.id}-image`, page.image);
            } catch (e) {
              console.warn(`Failed to store image for book ${book.id}, page ${page.id}`, e);
              // Don't throw error here, just continue without storing the image
              toast.error(`Failed to save large image for page ${page.pageNumber}. Try using a smaller image.`, { 
                id: `image-save-error-${page.id}`,
                duration: 5000
              });
            }
          }
        });
      } catch (e) {
        console.error(`Error storing book ${book.id} data`, e);
      }
    });
    
    return true;
  } catch (e) {
    console.error('Failed to save books to localStorage', e);
    toast.error('Failed to save your books locally. Some data may be lost when you reload.');
    return false;
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
        let text = 'Once upon a time...';
        try {
          const savedText = localStorage.getItem(`book-${book.id}-page-${page.id}-text`);
          if (savedText !== null) {
            text = savedText;
            console.log(`Loaded text for book ${book.id}, page ${page.id}:`, text.substring(0, 50));
          }
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
          text,
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
