import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageSettings } from '@/types/book';

export function useImageZoom(
  initialSettings?: ImageSettings
) {
  const [scale, setScale] = useState(initialSettings?.scale || 1);
  const scaleRef = useRef(scale);
  const lastZoomTimeRef = useRef(0);
  
  // Update refs to keep them in sync with state
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Zoom in with throttling for smoother transitions
  const handleZoomIn = useCallback(() => {
    // Throttle zoom operations
    const now = Date.now();
    if (now - lastZoomTimeRef.current < 150) {
      return;
    }
    lastZoomTimeRef.current = now;
    
    setScale(prev => {
      // Increase by 0.25 up to max of 4
      const newScale = Math.min(prev + 0.25, 4);
      // Round to nearest 0.25 to prevent floating point issues
      return Math.round(newScale * 4) / 4;
    });
  }, []);

  // Zoom out with throttling for smoother transitions
  const handleZoomOut = useCallback(() => {
    // Throttle zoom operations
    const now = Date.now();
    if (now - lastZoomTimeRef.current < 150) {
      return;
    }
    lastZoomTimeRef.current = now;
    
    setScale(prev => {
      // Decrease by 0.25 down to min of 0.5
      const newScale = Math.max(prev - 0.25, 0.5);
      // Round to nearest 0.25 to prevent floating point issues
      return Math.round(newScale * 4) / 4;
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
