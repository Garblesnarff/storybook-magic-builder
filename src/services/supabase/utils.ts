
import { Book, BookPage, DEFAULT_PAGE_TEXT } from '../../types/book';

// Function to convert BookPage type to database schema
export const bookPageToDatabasePage = (bookPage: BookPage, bookId: string) => {
  return {
    id: bookPage.id,
    book_id: bookId,
    page_number: bookPage.pageNumber,
    text: bookPage.text, // We'll use the exact text value, even if empty
    image_url: bookPage.image, // This will be updated to store image URLs
    layout: bookPage.layout,
    background_color: bookPage.backgroundColor,
    font_family: bookPage.textFormatting?.fontFamily,
    font_size: bookPage.textFormatting?.fontSize,
    font_color: bookPage.textFormatting?.fontColor,
    is_bold: bookPage.textFormatting?.isBold,
    is_italic: bookPage.textFormatting?.isItalic,
    image_style: bookPage.textFormatting?.imageStyle,
    // Add image_settings to save position and scale
    image_settings: bookPage.imageSettings ? JSON.stringify(bookPage.imageSettings) : null
  };
};

// Function to convert database page to BookPage type
export const databasePageToBookPage = (dbPage: any): BookPage => {
  return {
    id: dbPage.id,
    pageNumber: dbPage.page_number,
    text: dbPage.text ?? '', // Use empty string if null, don't insert default text
    image: dbPage.image_url,
    layout: dbPage.layout,
    backgroundColor: dbPage.background_color,
    textFormatting: {
      fontFamily: dbPage.font_family || 'Inter',
      fontSize: dbPage.font_size || 16,
      fontColor: dbPage.font_color || '#000000',
      isBold: dbPage.is_bold || false,
      isItalic: dbPage.is_italic || false,
      imageStyle: dbPage.image_style
    },
    // Parse image settings from the database or use default settings
    imageSettings: dbPage.image_settings ? JSON.parse(dbPage.image_settings) : {
      scale: 1,
      position: { x: 0, y: 0 },
      fitMethod: 'contain'
    }
  };
};
