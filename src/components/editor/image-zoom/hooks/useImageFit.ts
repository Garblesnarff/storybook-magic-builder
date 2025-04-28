
import { useState, useCallback } from 'react';
import { ImageSettings } from '@/types/book';

interface UseImageFitProps {
  containerWidth?: number;
  containerHeight?: number;
  imageWidth?: number;
  imageHeight?: number;
  fitMethod?: 'contain' | 'cover' | 'fill';
  scale?: number;
  position?: { x: number; y: number };
}

export function useImageFit({
  containerWidth = 400,
  containerHeight = 400,
  imageWidth = 200,
  imageHeight = 200,
  fitMethod = 'contain',
  scale = 1,
  position = { x: 0, y: 0 }
}: UseImageFitProps) {
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});

  // Function to calculate the image style based on fit method and dimensions
  const calculateImageStyle = useCallback(() => {
    // Default position for the image
    const defaultPosition = { x: 0, y: 0 };

    // Determine the scale factor based on fit method and container dimensions
    let scaleFactorX = 1;
    let scaleFactorY = 1;

    if (fitMethod === 'contain') {
      scaleFactorX = containerWidth / imageWidth;
      scaleFactorY = containerHeight / imageHeight;
      const scaleFactor = Math.min(scaleFactorX, scaleFactorY);
      scaleFactorX = scaleFactorY = scaleFactor;
    } else if (fitMethod === 'cover') {
      scaleFactorX = containerWidth / imageWidth;
      scaleFactorY = containerHeight / imageHeight;
      const scaleFactor = Math.max(scaleFactorX, scaleFactorY);
      scaleFactorX = scaleFactorY = scaleFactor;
    } else if (fitMethod === 'fill') {
      scaleFactorX = containerWidth / imageWidth;
      scaleFactorY = containerHeight / imageHeight;
    }

    // Apply the custom scale factor from the settings
    const finalScaleX = scaleFactorX * scale;
    const finalScaleY = scaleFactorY * scale;

    // Calculate new dimensions
    const newWidth = imageWidth * finalScaleX;
    const newHeight = imageHeight * finalScaleY;

    // Calculate position (center by default)
    const posX = (containerWidth - newWidth) / 2 + (position?.x || defaultPosition.x);
    const posY = (containerHeight - newHeight) / 2 + (position?.y || defaultPosition.y);

    // Set the image style
    setImageStyle({
      width: `${newWidth}px`,
      height: `${newHeight}px`,
      transform: `translate(${posX}px, ${posY}px)`,
      position: 'absolute',
      objectFit: fitMethod,
    });
  }, [containerWidth, containerHeight, imageWidth, imageHeight, fitMethod, scale, position]);

  return {
    imageStyle,
    calculateImageStyle
  };
}
