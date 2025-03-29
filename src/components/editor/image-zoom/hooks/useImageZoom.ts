import { useState, useCallback, useRef } from 'react';
import { ImageSettings } from '@/types/book';

export function useImageZoom(
  initialSettings?: ImageSettings
) {
  const [scale, setScale] = useState(initialSettings?.scale || 1);
  const scaleRef = useRef(scale);
  
  // Update refs to keep them in sync with state
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Zoom in
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 4));
  }, []);

  // Zoom out
  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  return {
    scale,
    setScale,
    scaleRef,
    handleZoomIn,
    handleZoomOut
  };
}

// Don't forget to import useEffect for the ref sync
import { useEffect } from 'react';
