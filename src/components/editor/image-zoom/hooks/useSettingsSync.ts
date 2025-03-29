
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
  // Ref to track the last saved settings to avoid unnecessary updates
  const lastSavedSettingsRef = useRef<string>('');
  
  // Save settings function with debounce mechanism built-in
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
    
    // Stringify for comparison
    const currentSettingsString = JSON.stringify(currentSettings);
    
    // Only save if settings changed
    if (currentSettingsString !== lastSavedSettingsRef.current) {
      console.log('Saving image settings:', currentSettings);
      lastSavedSettingsRef.current = currentSettingsString;
      onSettingsChange(currentSettings);
    }
  }, [imageLoaded, isInteractionReady, onSettingsChange, scale, position, fitMethod, isPanning]);

  // Save settings when they change (except during panning)
  // Use a more efficient debounced approach
  const saveSettingsTimeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!isPanning && imageLoaded && isInteractionReady) {
      // Clear any pending timeout
      if (saveSettingsTimeoutRef.current !== null) {
        window.clearTimeout(saveSettingsTimeoutRef.current);
      }
      
      // Set new timeout for debouncing
      saveSettingsTimeoutRef.current = window.setTimeout(() => {
        saveSettings();
        saveSettingsTimeoutRef.current = null;
      }, 200); // Increased debounce time for better performance
    }
    
    return () => {
      if (saveSettingsTimeoutRef.current !== null) {
        window.clearTimeout(saveSettingsTimeoutRef.current);
      }
    };
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
  }, [initialSettings]);

  return {
    saveSettings
  };
}
