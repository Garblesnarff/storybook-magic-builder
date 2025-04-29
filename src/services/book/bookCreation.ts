
import { v4 as uuidv4 } from 'uuid';
import { Book, DEFAULT_PAGE_TEXT } from '@/types/book';
import { BookTemplate } from '@/data/bookTemplates';

// Create an empty book with default values
export function createEmptyBook(userId: string): Book {
  const bookId = uuidv4();
  const now = new Date().toISOString();

  return {
    id: bookId,
    title: 'Untitled Book',
    author: '',
    description: '',
    userId: userId,
    coverImage: '',
    dimensions: {
      width: 8.5,
      height: 11
    },
    orientation: 'portrait',
    pages: [],
    createdAt: now,
    updatedAt: now
  };
}

// Create a book from a template
export function createBookFromTemplate(template: BookTemplate, userId: string): Book {
  const bookId = uuidv4();
  const now = new Date().toISOString();
  
  // Create the book with template values
  const book: Book = {
    id: bookId,
    title: template.title,
    author: '',
    description: template.description || '',
    userId: userId,
    coverImage: template.coverImage || '',
    dimensions: template.dimensions || {
      width: 8.5,
      height: 11
    },
    orientation: template.orientation || 'portrait',
    pages: [],
    createdAt: now,
    updatedAt: now
  };
  
  // Add pages from the template
  if (template.pages) {
    book.pages = template.pages.map((page, index) => ({
      id: uuidv4(),
      bookId: bookId,
      pageNumber: index + 1,
      text: page.text || DEFAULT_PAGE_TEXT,
      image: page.image || '',
      layout: page.layout || 'text-left-image-right',
      textFormatting: page.textFormatting || {
        fontFamily: 'Arial',
        fontSize: 16,
        fontColor: '#000000',
        isBold: false,
        isItalic: false
      },
      imageSettings: page.imageSettings || {
        scale: 1,
        position: { x: 0, y: 0 },
        fitMethod: 'contain'
      }
    }));
  }
  
  return book;
}
