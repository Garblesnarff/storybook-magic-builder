
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

  // Zoom in with requestAnimationFrame for smoother transitions
  const handleZoomIn = useCallback(() => {
    // Throttle zoom operations
    const now = Date.now();
    if (now - lastZoomTimeRef.current < 150) {
      return;
    }
    lastZoomTimeRef.current = now;
    
    requestAnimationFrame(() => {
      setScale(prev => {
        // Round to nearest 0.25 after zoom to prevent floating point issues
        const newScale = Math.min(prev + 0.25, 4);
        return Math.round(newScale * 4) / 4; // Round to nearest 0.25
      });
    });
  }, []);

  // Zoom out with requestAnimationFrame for smoother transitions
  const handleZoomOut = useCallback(() => {
    // Throttle zoom operations
    const now = Date.now();
    if (now - lastZoomTimeRef.current < 150) {
      return;
    }
    lastZoomTimeRef.current = now;
    
    requestAnimationFrame(() => {
      setScale(prev => {
        // Round to nearest 0.25 after zoom to prevent floating point issues
        const newScale = Math.max(prev - 0.25, 0.5);
        return Math.round(newScale * 4) / 4; // Round to nearest 0.25
      });
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
