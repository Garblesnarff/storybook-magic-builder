
import { BookPage, ImageSettings, PageLayout, TextFormatting } from '@/types/book';

export function databasePageToBookPage(dbPage: any): BookPage {
  let imageSettings: ImageSettings;
  try {
    imageSettings = typeof dbPage.image_settings === 'string'
      ? JSON.parse(dbPage.image_settings)
      : dbPage.image_settings || {
          scale: 1,
          position: { x: 0, y: 0 },
          fitMethod: 'contain'
        };
  } catch (e) {
    console.error('Error parsing image settings:', e);
    imageSettings = {
      scale: 1,
      position: { x: 0, y: 0 },
      fitMethod: 'contain'
    };
  }

  const textFormatting: TextFormatting = {
    fontFamily: dbPage.font_family || 'Arial',
    fontSize: dbPage.font_size || 16,
    fontColor: dbPage.font_color || '#000000',
    isBold: dbPage.is_bold || false,
    isItalic: dbPage.is_italic || false,
    imageStyle: dbPage.image_style
  };

  return {
    id: dbPage.id,
    bookId: dbPage.book_id,
    pageNumber: dbPage.page_number,
    text: dbPage.text || '',
    image: dbPage.image_url || '',
    layout: dbPage.layout as PageLayout || 'text-left-image-right',
    textFormatting,
    imageSettings,
    backgroundColor: dbPage.background_color
  };
}

export function bookPageToDatabasePage(page: BookPage, bookId: string): any {
  return {
    id: page.id,
    book_id: bookId,
    page_number: page.pageNumber,
    text: page.text,
    image_url: page.image,
    layout: page.layout,
    font_family: page.textFormatting?.fontFamily,
    font_size: page.textFormatting?.fontSize,
    font_color: page.textFormatting?.fontColor,
    is_bold: page.textFormatting?.isBold,
    is_italic: page.textFormatting?.isItalic,
    image_settings: page.imageSettings,
    background_color: page.backgroundColor,
    image_style: page.textFormatting?.imageStyle
  };
}
