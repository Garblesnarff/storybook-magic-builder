
export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  pages: BookPage[];
  orientation: 'portrait' | 'landscape';
  dimensions: {
    width: number;
    height: number;
  };
}

export interface BookPage {
  id: string;
  pageNumber: number;
  text: string;
  image?: string;
  layout: PageLayout;
  backgroundColor?: string;
  textFormatting?: TextFormatting;
}

export type PageLayout = 
  | 'text-left-image-right'
  | 'image-left-text-right'
  | 'text-top-image-bottom'
  | 'image-top-text-bottom'
  | 'full-page-image'
  | 'full-page-text';

export interface TextFormatting {
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  imageStyle?: 'REALISTIC' | 'CARTOON' | 'SKETCH' | 'ANIME';
}

export interface ImageStyle {
  id: string;
  name: string;
  description: string;
}

// Define the default text as a constant for reuse and a single source of truth
export const DEFAULT_PAGE_TEXT = ''; // Changed from 'Once upon a time...' to empty string

export const DEFAULT_BOOK: Omit<Book, 'id'> = {
  title: 'Untitled Book',
  author: 'Anonymous',
  description: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pages: [],
  orientation: 'portrait',
  dimensions: {
    width: 8.5,
    height: 11
  }
};

export const DEFAULT_PAGE: Omit<BookPage, 'id' | 'pageNumber'> = {
  text: DEFAULT_PAGE_TEXT, // Use the constant here
  layout: 'text-left-image-right',
  textFormatting: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontColor: '#000000',
    isBold: false,
    isItalic: false
  }
};

export const IMAGE_STYLES: ImageStyle[] = [
  { id: 'REALISTIC', name: 'Realistic', description: 'Photorealistic image generation' },
  { id: 'CARTOON', name: 'Cartoon', description: 'Colorful and playful cartoon style' },
  { id: 'SKETCH', name: 'Sketch', description: 'Hand-drawn pencil illustration style' },
  { id: 'ANIME', name: 'Anime', description: 'Japanese animation-inspired style' }
];

// Add the missing layoutNames constant that maps layout types to display names
export const layoutNames: Record<PageLayout, string> = {
  'text-left-image-right': 'Text Left, Image Right',
  'image-left-text-right': 'Image Left, Text Right',
  'text-top-image-bottom': 'Text Top, Image Bottom',
  'image-top-text-bottom': 'Image Top, Text Bottom',
  'full-page-image': 'Full Page Image',
  'full-page-text': 'Full Page Text'
};
