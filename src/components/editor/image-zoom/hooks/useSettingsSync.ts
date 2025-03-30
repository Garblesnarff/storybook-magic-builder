
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
  const saveTimeoutRef = useRef<number | null>(null);
  
  // Flag to track if a save operation is currently pending
  const saveIsPendingRef = useRef(false);
  
  // Enhanced save settings function with debounce mechanism and proper cleanup
  const saveSettings = useCallback(() => {
    if (!onSettingsChange || !imageLoaded || !isInteractionReady) return;
    
    // Avoid saving during active panning to prevent UI jumps
    if (isPanning) return;
    
    // Don't save if already pending to avoid redundant operations
    if (saveIsPendingRef.current) return;
    
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
      // Clear any existing timeout to prevent multiple saves
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      
      // Mark save as pending
      saveIsPendingRef.current = true;
      
      // Use a short delay before saving to batch rapid updates
      saveTimeoutRef.current = window.setTimeout(() => {
        if (onSettingsChange) {
          console.log('Saving image settings:', currentSettings);
          lastSavedSettingsRef.current = currentSettingsString;
          onSettingsChange(currentSettings);
        }
        // Reset pending flag after save
        saveIsPendingRef.current = false;
        saveTimeoutRef.current = null;
      }, 250);
    }
  }, [imageLoaded, isInteractionReady, onSettingsChange, scale, position, fitMethod, isPanning]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        
        // Final save on unmount if there was a pending save
        if (saveIsPendingRef.current && 
            isInteractionReady && 
            imageLoaded && 
            onSettingsChange) {
          onSettingsChange({
            scale,
            position, 
            fitMethod
          });
        }
      }
    };
  }, [scale, position, fitMethod, isInteractionReady, imageLoaded, onSettingsChange]);

  // Track initial settings changes
  const lastInitialSettingsRef = useRef<ImageSettings | undefined>(initialSettings);
  
  useEffect(() => {
    // Skip if settings haven't changed or are undefined
    if (!initialSettings || 
        (lastInitialSettingsRef.current && 
         JSON.stringify(lastInitialSettingsRef.current) === JSON.stringify(initialSettings))) {
      return;
    }
    
    lastInitialSettingsRef.current = initialSettings;
  }, [initialSettings]);

  return {
    saveSettings
  };
}
