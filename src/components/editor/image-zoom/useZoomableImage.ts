
import { useState, useEffect } from 'react';
import { ImageSettings } from '@/types/book';

export function useZoomableImage(
  imageUrl?: string,
  initialSettings?: ImageSettings,
  onSettingsChange?: (settings: ImageSettings) => void
) {
  // Simply re-export the hook with the same interface for backward compatibility
  return useZoomableImageHook(imageUrl, initialSettings, onSettingsChange);
}

// The actual implementation that was moved to a separate file
export function useZoomableImageHook(
  imageUrl?: string,
  initialSettings?: ImageSettings,
  onSettingsChange?: (settings: ImageSettings) => void
) {
  const [scale, setScale] = useState(initialSettings?.scale || 1);
  const [position, setPosition] = useState(initialSettings?.position || { x: 0, y: 0 });
  const [fitMethod, setFitMethod] = useState(initialSettings?.fitMethod || 'contain');

  // Update internal state when props change
  useEffect(() => {
    if (initialSettings) {
      setScale(initialSettings.scale || 1);
      setPosition(initialSettings.position || { x: 0, y: 0 });
      setFitMethod(initialSettings.fitMethod || 'contain');
    }
  }, [initialSettings]);

  // Update parent component when state changes
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({ scale, position, fitMethod });
    }
  }, [scale, position, fitMethod, onSettingsChange]);

  // Functions to control zoom and position
  const zoomIn = () => setScale(prev => Math.min(prev * 1.2, 4));
  const zoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.5));
  const moveImage = (newPosition: { x: number; y: number }) => setPosition(newPosition);
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  const toggleFitMethod = () => {
    setFitMethod(prev => (prev === 'contain' ? 'cover' : 'contain'));
  };

  return {
    scale,
    position,
    fitMethod,
    zoomIn,
    zoomOut,
    moveImage,
    resetView,
    toggleFitMethod
  };
}
