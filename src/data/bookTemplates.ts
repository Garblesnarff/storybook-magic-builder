
import { Book, BookPage } from '@/types/book';
import { v4 as uuidv4 } from 'uuid';

export interface BookTemplate {
  id: string;
  title: string;
  description: string;
  author?: string;
  coverImage?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  orientation?: 'portrait' | 'landscape';
  pages: Partial<BookPage>[];
  createBook: () => Book;
  // Add these properties used in TemplateSelectionDialog
  name: string;
  pageCount: number;
}

// Example book template
export const defaultBookTemplate: BookTemplate = {
  id: 'default-template',
  title: 'Blank Book',
  name: 'Blank Book', // Add name property
  description: 'Start with a blank book',
  author: '',
  coverImage: '',
  pageCount: 1, // Add pageCount property
  dimensions: {
    width: 8.5,
    height: 11
  },
  orientation: 'portrait',
  pages: [
    {
      text: 'Once upon a time...',
      layout: 'text-left-image-right',
      textFormatting: {
        fontFamily: 'Arial',
        fontSize: 16,
        fontColor: '#000000'
      }
    }
  ],
  createBook: function(): Book {
    const now = new Date().toISOString();
    const bookId = uuidv4();
    
    // Create pages based on template
    const pages: BookPage[] = this.pages.map((templatePage, index) => {
      return {
        id: uuidv4(),
        bookId,
        pageNumber: index + 1,
        text: templatePage.text || 'Once upon a time...',
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
      title: this.title,
      author: this.author || '',
      description: this.description,
      userId: '', // Will be filled in by the createBookFromTemplate function
      coverImage: this.coverImage || '',
      dimensions: this.dimensions || {
        width: 8.5,
        height: 11
      },
      orientation: this.orientation || 'portrait',
      pages,
      createdAt: now,
      updatedAt: now
    };
  }
};

export const bookTemplates: BookTemplate[] = [
  defaultBookTemplate,
  // Add more templates as needed
];

export default bookTemplates;
