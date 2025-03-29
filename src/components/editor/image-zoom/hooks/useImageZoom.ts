
import { useState, useCallback, useRef, useEffect } from 'react';
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

  // Zoom in with requestAnimationFrame for smoother transitions
  const handleZoomIn = useCallback(() => {
    requestAnimationFrame(() => {
      setScale(prev => Math.min(prev + 0.25, 4));
    });
  }, []);

  // Zoom out with requestAnimationFrame for smoother transitions
  const handleZoomOut = useCallback(() => {
    requestAnimationFrame(() => {
      setScale(prev => Math.max(prev - 0.25, 0.5));
    });
  }, []);

  return {
    scale,
    setScale,
    scaleRef,
    handleZoomIn,
    handleZoomOut
  };
}
