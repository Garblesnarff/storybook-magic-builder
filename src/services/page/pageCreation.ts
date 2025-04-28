
import { v4 as uuidv4 } from 'uuid';
import { BookPage } from '@/types/book';
// Remove unused toast import

// Function to create a new page
export const createNewPage = (bookId: string, pageNumber: number): BookPage => {
  return {
    id: uuidv4(),
    bookId,
    pageNumber,
    text: 'This is a new page. Click to edit the text.',
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
  };
};

// Function to duplicate a page
export const duplicatePage = (originalPage: BookPage): BookPage => {
  // Create a copy with a new ID
  return {
    ...originalPage,
    id: uuidv4(),
    text: `${originalPage.text} (Copy)`,
    // Maintain the same layout and formatting
    layout: originalPage.layout,
    textFormatting: {
      ...originalPage.textFormatting
    },
    imageSettings: originalPage.imageSettings ? {
      ...originalPage.imageSettings
    } : {
      scale: 1,
      position: { x: 0, y: 0 },
      fitMethod: 'contain'
    }
  };
};

// Function to create a title page
export const createTitlePage = (bookId: string, title: string, author: string): BookPage => {
  return {
    id: uuidv4(),
    bookId,
    pageNumber: 1,
    text: `# ${title}\n\nBy ${author}`,
    image: '',
    layout: 'full-page-text',
    textFormatting: {
      fontFamily: 'Georgia',
      fontSize: 24,
      fontColor: '#000000',
      // Remove the align property as it's not in TextFormatting type
      // align: 'center'
    },
    imageSettings: {
      scale: 1,
      position: { x: 0, y: 0 },
      fitMethod: 'contain'
    }
  };
};

// Function to create an about page
export const createAboutPage = (bookId: string, description: string): BookPage => {
  return {
    id: uuidv4(),
    bookId,
    pageNumber: 2,
    text: `# About This Book\n\n${description}`,
    image: '',
    layout: 'full-page-text',
    textFormatting: {
      fontFamily: 'Georgia',
      fontSize: 18,
      fontColor: '#000000'
    },
    imageSettings: {
      scale: 1,
      position: { x: 0, y: 0 },
      fitMethod: 'contain'
    }
  };
};
