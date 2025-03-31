
import React from 'react';
import { ZoomableImage as ZoomImage } from './image-zoom/ZoomableImage';
import { ZoomableImageProps } from './image-zoom/types';

// Re-export the ZoomableImage from the image-zoom directory for backwards compatibility
export const ZoomableImage: React.FC<ZoomableImageProps> = (props) => {
  return <ZoomImage {...props} />;
};

ZoomableImage.displayName = 'ZoomableImage';
