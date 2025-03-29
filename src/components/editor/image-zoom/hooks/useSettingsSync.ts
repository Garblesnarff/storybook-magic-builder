
import { useEffect, useCallback, useRef } from 'react';
import { ImageSettings } from '@/types/book';

export function useSettingsSync(
  scale: number,
  position: { x: number; y: number },
  fitMethod: 'contain' | 'cover',
  imageLoaded: boolean,
  isPanning: boolean,
  isInteractionReady: boolean,
  initialSettings?: ImageSettings,
  onSettingsChange?: (settings: ImageSettings) => void
) {
  // Save settings function
  const saveSettings = useCallback(() => {
    if (!onSettingsChange || !imageLoaded || !isInteractionReady) return;
    
    // Don't save if panning is active
    if (isPanning) return;
    
    // Create settings object from current state
    const currentSettings: ImageSettings = {
      scale,
      position,
      fitMethod
    };
    
    console.log('Saving image settings:', currentSettings);
    onSettingsChange(currentSettings);
  }, [imageLoaded, isInteractionReady, onSettingsChange, scale, position, fitMethod, isPanning]);

  // Save settings when they change (except during panning)
  useEffect(() => {
    if (!isPanning && imageLoaded && isInteractionReady) {
      // Use timeout to avoid saving too frequently
      const timeout = setTimeout(() => {
        saveSettings();
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [scale, position, fitMethod, imageLoaded, isPanning, isInteractionReady, saveSettings]);

  // Apply initial settings when they change (e.g., when changing pages)
  const lastInitialSettingsRef = useRef<ImageSettings | undefined>(initialSettings);
  
  useEffect(() => {
    // Skip if settings haven't changed
    if (!initialSettings || 
        (lastInitialSettingsRef.current && 
         JSON.stringify(lastInitialSettingsRef.current) === JSON.stringify(initialSettings))) {
      return;
    }
    
    console.log('Applying new initial settings:', initialSettings);
    lastInitialSettingsRef.current = initialSettings;
    
    // Set as ready for interaction after a short delay
    setTimeout(() => {
      console.log('Interaction ready after applying initial settings');
    }, 200);
  }, [initialSettings]);

  return {
    saveSettings
  };
}
