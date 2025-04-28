
import { useState, useCallback, useEffect } from 'react';

export function useContainerDimensions(ref: React.RefObject<HTMLDivElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions when needed
  const updateDimensions = useCallback(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, [ref]);
  
  // Initially update dimensions when component mounts
  useEffect(() => {
    updateDimensions();
    
    // Set up a resize observer to update dimensions when container resizes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current);
      }
    };
  }, [ref, updateDimensions]);

  return { 
    dimensions,
    updateDimensions
  };
}
