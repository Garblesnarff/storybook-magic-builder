
import { useState, useCallback } from 'react';
import type { ImageSettings } from '@/types/book';

export interface UseImageFitProps {
  containerWidth?: number;
  containerHeight?: number;
  imageWidth?: number;
  imageHeight?: number;
  fitMethod?: 'contain' | 'cover' | 'fill';
  scale?: number;
  position?: { x: number; y: number };
}

export function useImageFit(props: UseImageFitProps = {}) {
  const {
    containerWidth = 400,
    containerHeight = 400,
    imageWidth = 200,
    imageHeight = 200,
    fitMethod: initialFitMethod = 'contain',
    scale = 1,
    position = { x: 0, y: 0 }
  } = props;

  const [fitMethod, setFitMethod] = useState<'contain' | 'cover'>(initialFitMethod === 'fill' ? 'contain' : initialFitMethod as 'contain' | 'cover');
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});

  // Toggle between contain and cover fit methods
  const toggleFitMethod = useCallback(() => {
    setFitMethod(prev => prev === 'contain' ? 'cover' : 'contain');
  }, []);

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

  // Function to fit image to container
  const fitImageToContainer = useCallback((
    imageLoaded: boolean,
    containerDims: { width: number; height: number },
    imageDims: { width: number; height: number },
    isInteractionReady: boolean,
    setScale: (scale: number) => void,
    setPosition?: (position: { x: number; y: number }) => void,
    scaleRef?: React.MutableRefObject<number>
  ) => {
    if (!imageLoaded || !isInteractionReady) return;
    
    // Calculate appropriate scale to fit image in container
    const containerRatio = containerDims.width / containerDims.height;
    const imageRatio = imageDims.width / imageDims.height;
    
    // Reset position if setPosition is provided
    if (setPosition) {
      setPosition({ x: 0, y: 0 });
    }
    
    // Set scale back to 1
    setScale(1);
    if (scaleRef) scaleRef.current = 1;
    
  }, []);

  return {
    imageStyle,
    calculateImageStyle,
    fitMethod,
    toggleFitMethod,
    fitImageToContainer
  };
}
