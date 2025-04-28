
import React, { useState, useEffect, useCallback } from 'react';

export function useContainerDimensions(ref: React.RefObject<HTMLDivElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions when the ref changes or the component mounts/unmounts
  const updateDimensions = useCallback(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, [ref]);

  useEffect(() => {
    updateDimensions();
    
    // Add event listener for resize
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]);

  const updateContainerDimensions = useCallback(() => {
    updateDimensions();
  }, [updateDimensions]);

  const updateImageDimensions = useCallback((imageRef: React.RefObject<HTMLImageElement>) => {
    if (imageRef.current) {
      // This function is meant to handle image dimensions specifically
      // Return or update state as needed
    }
  }, []);

  return { 
    dimensions,
    updateDimensions,
    // Export these functions to match the interface expected in useZoomableImage
    containerDimensions: dimensions,
    imageDimensions: { width: 0, height: 0 }, // Default value
    updateContainerDimensions,
    updateImageDimensions
  };
}
