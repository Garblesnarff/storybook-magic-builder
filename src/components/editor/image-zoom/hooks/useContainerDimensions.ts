
import { useState, useCallback } from 'react';

export function useContainerDimensions(ref: React.RefObject<HTMLDivElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions when needed
  const updateDimensions = useCallback(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, [ref]);

  return { 
    dimensions,
    updateDimensions
  };
}
