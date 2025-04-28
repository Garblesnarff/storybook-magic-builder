
import { v4 as uuidv4 } from 'uuid';
import { Book, BookTemplate, TextFormatting, PageLayout } from '@/types/book';

// Create a new default book
export const createNewBook = (userId: string, title = 'Untitled Book'): Book => {
  const newPageId = uuidv4();
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(),
    title,
    author: '',
    description: '',
    userId,
    coverImage: '',
    dimensions: {
      width: 8.5,
      height: 11
    },
    orientation: 'portrait',
    pages: [
      {
        id: newPageId,
        bookId: '',
        pageNumber: 1,
        text: 'Once upon a time...',
        image: '',
        layout: 'text-left-image-right',
        textFormatting: {
          fontFamily: 'Arial',
          fontSize: 16,
          fontColor: '#000000'
        },
        imageSettings: {
          scale: 1,
          position: { x: 0, y: 0 },
          fitMethod: 'contain'
        }
      }
    ],
    createdAt: now,
    updatedAt: now
  };
};

// Function to create a book from a template
export const createBookFromTemplate = (userId: string, template: BookTemplate): Book => {
  const bookId = uuidv4();
  const now = new Date().toISOString();
  
  // Create pages from the template
  const pages = template.pages.map((templatePage, index) => {
    return {
      id: uuidv4(),
      bookId,
      pageNumber: index + 1,
      text: templatePage.text || '',
      image: templatePage.image || '',
      layout: templatePage.layout || 'text-left-image-right',
      textFormatting: templatePage.textFormatting || {
        fontFamily: 'Arial',
        fontSize: 16,
        fontColor: '#000000'
      },
      imageSettings: templatePage.imageSettings || {
        scale: 1,
        position: { x: 0, y: 0 },
        fitMethod: 'contain'
      }
    };
  });
  
  return {
    id: bookId,
    title: template.title || 'Untitled Book',
    author: template.author || '',
    description: template.description || '',
    userId,
    coverImage: template.coverImage || '',
    dimensions: template.dimensions || {
      width: 8.5,
      height: 11
    },
    orientation: template.orientation || 'portrait',
    pages,
    createdAt: now,
    updatedAt: now
  };
};

// Update an existing book
export const updateBook = (book: Book, updates: Partial<Book>): Book => {
  return {
    ...book,
    ...updates,
    updatedAt: new Date().toISOString()
  };
};

// Delete a book (just returns filtered books array - actual deletion would happen in persistence layer)
export const deleteBook = (books: Book[], bookId: string): Book[] => {
  return books.filter(book => book.id !== bookId);
};

// Load a specific book
export const loadBook = (books: Book[], bookId: string): Book | null => {
  const book = books.find(book => book.id === bookId);
  return book || null;
};

// Create mock books for testing
export const createMockBooks = (userId: string): Book[] => {
  const now = new Date().toISOString();
  
  const books: Book[] = [];
  
  for (let i = 1; i <= 3; i++) {
    const bookId = uuidv4();
    const pages = [];
    
    for (let j = 1; j <= 3; j++) {
      pages.push({
        id: uuidv4(),
        bookId,
        pageNumber: j,
        text: `This is page ${j} of book ${i}.`,
        image: '',
        layout: 'text-left-image-right' as PageLayout,
        textFormatting: {
          fontFamily: 'Arial',
          fontSize: 16,
          fontColor: '#000000'
        },
        imageSettings: {
          scale: 1,
          position: { x: 0, y: 0 },
          fitMethod: 'contain'
        }
      });
    }
    
    books.push({
      id: bookId,
      title: `Book ${i}`,
      author: `Author ${i}`,
      description: `Description for book ${i}`,
      userId,
      coverImage: '',
      dimensions: {
        width: 8.5,
        height: 11
      },
      orientation: 'portrait',
      pages,
      createdAt: now,
      updatedAt: now
    });
  }
  
  return books;
};
