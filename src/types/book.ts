export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage?: string;
  orientation: 'portrait' | 'landscape';
  dimensions: {
    width: number;
    height: number;
  };
  userId: string; // Added userId field
  pages: BookPage[];
  createdAt: string;
  updatedAt: string;
}

export interface BookPage {
  id: string;
  pageNumber: number;
  text: string;
  image?: string;
  layout: PageLayout;
  backgroundColor?: string;
  textFormatting?: TextFormatting;
  imageSettings?: ImageSettings;
  narrationUrl?: string;
}

export interface TextFormatting {
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  imageStyle?: string;
}

export interface ImageSettings {
  scale: number;
  position: { x: number; y: number };
  fitMethod: 'contain' | 'cover' | 'fill';
}

export type PageLayout =
  | 'text-left-image-right'
  | 'text-right-image-left'
  | 'text-top-image-bottom'
  | 'text-bottom-image-top'
  | 'full-text'
  | 'full-image';

export const DEFAULT_BOOK: Omit<Book, 'id' | 'pages' | 'createdAt' | 'updatedAt' | 'userId'> = {
  title: 'Untitled Book',
  author: 'Anonymous',
  description: '',
  orientation: 'portrait',
  dimensions: { width: 8.5, height: 11 }
};

export const DEFAULT_PAGE_TEXT = 'Once upon a time...';

export const DEFAULT_PAGE: Omit<BookPage, 'id' | 'pageNumber'> = {
  text: DEFAULT_PAGE_TEXT,
  layout: 'text-left-image-right'
};
