
import { ImageSettings } from '@/types/book';

export interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  settings?: ImageSettings;
  onSettingsChange?: (settings: ImageSettings) => void;
}

export interface ZoomControlsProps {
  scale: number;
  fitMethod: 'contain' | 'cover';
  isInteractionReady: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFitMethod: () => void;
  onReset: () => void;
  canZoomIn?: boolean;
  canZoomOut?: boolean;
  canReset?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}
