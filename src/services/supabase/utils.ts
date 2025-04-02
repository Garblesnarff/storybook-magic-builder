
import { Book, BookPage } from '../../types/book';

// Function to convert BookPage type to database schema
export const bookPageToDatabasePage = (bookPage: BookPage, bookId: string) => {
  // Ensure imageSettings is properly stringified for database storage
  const imageSettingsJson = bookPage.imageSettings 
    ? JSON.stringify(bookPage.imageSettings) 
    : null;
  
  return {
    id: bookPage.id,
    book_id: bookId,
    page_number: bookPage.pageNumber,
    text: bookPage.text || '', // Always use the page's actual text value
    image_url: bookPage.image, // Maps the 'image' property to the 'image_url' database field
    layout: bookPage.layout,
    background_color: bookPage.backgroundColor,
    font_family: bookPage.textFormatting?.fontFamily,
    font_size: bookPage.textFormatting?.fontSize,
    font_color: bookPage.textFormatting?.fontColor,
    is_bold: bookPage.textFormatting?.isBold,
    is_italic: bookPage.textFormatting?.isItalic,
    image_style: bookPage.textFormatting?.imageStyle,
    image_settings: imageSettingsJson,
    narration_url: bookPage.narrationUrl || null // Added field for narration URL
  };
};

// Function to convert database page to BookPage type
export const databasePageToBookPage = (dbPage: any): BookPage => {
  // Parse image settings safely
  let imageSettings;
  try {
    imageSettings = dbPage.image_settings ? JSON.parse(dbPage.image_settings) : null;
  } catch (e) {
    console.error('Error parsing image settings:', e);
    imageSettings = null;
  }
  
  return {
    id: dbPage.id,
    pageNumber: dbPage.page_number,
    text: dbPage.text || '', // Use empty string if null, not default text
    image: dbPage.image_url, // Maps the 'image_url' database field to the 'image' property
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
    imageSettings: imageSettings || {
      scale: 1,
      position: { x: 0, y: 0 },
      fitMethod: 'contain'
    },
    narrationUrl: dbPage.narration_url || undefined // Added field for narration URL
  };
};
