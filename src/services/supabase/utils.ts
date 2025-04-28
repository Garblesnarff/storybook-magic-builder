
import { BookPage, TextFormatting, ImageSettings, PageLayout } from '@/types/book';

// Convert database page format to our BookPage format
export const databasePageToBookPage = (dbPage: any): BookPage => {
  // Parse JSON fields if they exist and are strings
  let textFormatting: TextFormatting | undefined = undefined;
  if (dbPage.text_formatting) {
    textFormatting = typeof dbPage.text_formatting === 'string'
      ? JSON.parse(dbPage.text_formatting)
      : dbPage.text_formatting;
  }
  
  let imageSettings: ImageSettings | undefined = undefined;
  if (dbPage.image_settings) {
    imageSettings = typeof dbPage.image_settings === 'string'
      ? JSON.parse(dbPage.image_settings)
      : dbPage.image_settings;
  }
  
  return {
    id: dbPage.id,
    bookId: dbPage.book_id,
    pageNumber: dbPage.page_number,
    text: dbPage.text || '',
    // Convert null to undefined for image and other fields
    image: dbPage.image || undefined,
    layout: (dbPage.layout as PageLayout) || 'text-left-image-right',
    backgroundColor: dbPage.background_color || undefined,
    narrationUrl: dbPage.narration_url || undefined,
    textFormatting,
    imageSettings
  };
};

// Convert our BookPage format to database page format
export const bookPageToDatabasePage = (page: BookPage, bookId?: string): any => {
  return {
    id: page.id,
    book_id: bookId || page.bookId,
    page_number: page.pageNumber,
    text: page.text || '',
    image: page.image || null, // Convert undefined to null for database
    layout: page.layout || 'text-left-image-right',
    background_color: page.backgroundColor || null,
    narration_url: page.narrationUrl || null,
    text_formatting: page.textFormatting ? JSON.stringify(page.textFormatting) : null,
    image_settings: page.imageSettings ? JSON.stringify(page.imageSettings) : null
  };
};
