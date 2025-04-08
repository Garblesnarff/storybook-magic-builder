
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

// Updated PageLayout type to include all layout values used in the codebase
export type PageLayout =
  | 'text-left-image-right'
  | 'text-right-image-left'
  | 'text-top-image-bottom'
  | 'text-bottom-image-top'
  | 'full-text'
  | 'full-image'
  | 'image-left-text-right' 
  | 'image-top-text-bottom'
  | 'full-page-text'
  | 'full-page-image';

// Add missing layouts mapping for the LayoutSettings component
export const layoutNames: Record<PageLayout, string> = {
  'text-left-image-right': 'Text Left, Image Right',
  'text-right-image-left': 'Text Right, Image Left',
  'text-top-image-bottom': 'Text Top, Image Bottom',
  'text-bottom-image-top': 'Text Bottom, Image Top',
  'full-text': 'Full Page Text',
  'full-image': 'Full Page Image',
  'image-left-text-right': 'Image Left, Text Right',
  'image-top-text-bottom': 'Image Top, Text Bottom',
  'full-page-text': 'Full Page Text',
  'full-page-image': 'Full Page Image'
};

// Add missing IMAGE_STYLES constant for the ImageSettings component
export const IMAGE_STYLES = [
  { id: 'REALISTIC', name: 'Realistic' },
  { id: 'CARTOON', name: 'Cartoon' },
  { id: 'WATERCOLOR', name: 'Watercolor' },
  { id: 'SKETCH', name: 'Sketch' },
  { id: 'ABSTRACT', name: 'Abstract' },
  { id: 'FANTASY', name: 'Fantasy' },
  { id: 'VINTAGE', name: 'Vintage' }
];

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
