
import { useCallback } from 'react';
import { CSSProperties } from 'react';

export interface UseImageFitProps {
  containerWidth: number;
  containerHeight: number;
  imageWidth: number;
  imageHeight: number;
}

export function useImageFit(props: UseImageFitProps) {
  const { containerWidth, containerHeight, imageWidth, imageHeight } = props;

  // Calculate image style for containing the image within the container
  const calculateImageStyle = useCallback((): CSSProperties => {
    if (!containerWidth || !containerHeight || !imageWidth || !imageHeight) {
      return {
        width: 'auto',
        height: 'auto',
        objectFit: 'contain',
      };
    }

    // Calculate aspect ratios
    const containerAspect = containerWidth / containerHeight;
    const imageAspect = imageWidth / imageHeight;

    // Determine how to fit the image
    let width, height;
    
    if (imageAspect > containerAspect) {
      // Image is wider than container relative to height
      width = containerWidth;
      height = containerWidth / imageAspect;
    } else {
      // Image is taller than container relative to width
      height = containerHeight;
      width = containerHeight * imageAspect;
    }

    return {
      width: `${width}px`,
      height: `${height}px`,
      objectFit: 'contain',
    };
  }, [containerWidth, containerHeight, imageWidth, imageHeight]);

  const imageStyle = calculateImageStyle();

  return {
    imageStyle,
    calculateImageStyle
  };
}
