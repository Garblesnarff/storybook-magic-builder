
import { ImageSettings } from '@/types/book';

export interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  initialSettings?: ImageSettings;
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
}
