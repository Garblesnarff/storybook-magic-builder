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

// Enhance IMAGE_STYLES to include detailed descriptions for the prompt
export const IMAGE_STYLES = [
  { id: 'REALISTIC', name: 'Realistic', description: 'realistic, detailed, photorealistic style' },
  { id: 'CARTOON', name: 'Cartoon', description: 'cartoon style, animated, colorful, kid-friendly' },
  { id: 'WATERCOLOR', name: 'Watercolor', description: 'watercolor painting style, soft brushstrokes, artistic' },
  { id: 'SKETCH', name: 'Pencil Sketch', description: 'pencil sketch style, hand-drawn, detailed linework' },
  { id: 'ABSTRACT', name: 'Abstract', description: 'abstract art style, non-representational, colorful shapes' },
  { id: 'FANTASY', name: 'Fantasy', description: 'fantasy illustration style, magical, whimsical' },
  { id: 'VINTAGE', name: 'Vintage', description: 'vintage illustration style, retro, nostalgic' }
];

// Helper function to get style description by ID
export function getStyleDescriptionById(styleId: string): string {
  const style = IMAGE_STYLES.find(style => style.id === styleId);
  return style?.description || 'realistic, detailed style';
}

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
