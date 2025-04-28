import { v4 as uuidv4 } from 'uuid';
import { BookPage, PageLayout, TextFormatting, DEFAULT_PAGE_TEXT } from '@/types/book';
import { toast } from 'sonner';

/**
 * Create a new page object with a unique ID
 * 
 * @param bookId The book ID to which this page belongs
 * @param pageNumber The page number within the book
 * @returns A new BookPage object
 */
export const createNewPage = (bookId: string, pageNumber: number): BookPage => {
  return {
    id: uuidv4(), // Generate a unique ID for the page
    bookId,
    pageNumber,
    text: DEFAULT_PAGE_TEXT,
    layout: 'text-left-image-right', // Default layout
    // Other properties are optional and will be undefined initially
  };
};

/**
 * Create a duplicate of an existing page with a new ID
 * 
 * @param page The page to duplicate
 * @param newPageNumber The page number for the duplicated page
 * @returns A duplicated page
 */
export const duplicatePage = (page: BookPage, newPageNumber: number): BookPage => {
  // Generate a new ID for the duplicated page
  const newId = uuidv4();
  
  // Clone the page and update with new ID and page number
  return {
    ...page,
    id: newId,
    pageNumber: newPageNumber,
    image: page.image || undefined, // Ensure image is string | undefined, not null
  };
};

/**
 * Create a default text formatting object
 * 
 * @returns Default text formatting settings
 */
export const createDefaultTextFormatting = (): TextFormatting => {
  return {
    fontFamily: 'Arial',
    fontSize: 16,
    lineHeight: 1.5,
    isBold: false,
    isItalic: false,
    fontColor: '#000000',
    align: 'left',
    imageStyle: 'REALISTIC', // Default image style
  };
};

/**
 * Determine if a layout contains an image
 * 
 * @param layout The page layout to check
 * @returns True if the layout includes an image component
 */
export const layoutHasImage = (layout: PageLayout): boolean => {
  // Only the full-page-text layout doesn't have an image
  return layout !== 'full-page-text';
};

export const getPlaceholderText = (pageNumber: number): string => {
  return `Page ${pageNumber} content. Click to edit.`;
};
