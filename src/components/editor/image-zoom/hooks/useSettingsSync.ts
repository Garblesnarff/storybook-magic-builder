
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
  
  // Save settings function that can be called externally
  const saveSettings = useCallback(() => {
    // Don't save if there's no callback, image isn't loaded, or interaction system isn't ready
    if (!onSettingsChange || !imageLoaded || !isInteractionReady) return;
    
    // Don't initiate saves during active panning to prevent UI jumps
    if (isPanning) return;
    
    // Clear any existing timeout
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
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
      saveTimeoutRef.current = window.setTimeout(() => {
        if (onSettingsChange) {
          console.log("Saving image settings:", currentSettings);
          lastSavedSettingsRef.current = currentSettingsString;
          onSettingsChange(currentSettings);
        }
        saveTimeoutRef.current = null;
      }, 300); // Use a longer debounce time
    }
  }, [scale, position, fitMethod, imageLoaded, isInteractionReady, onSettingsChange, isPanning]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveSettings
  };
}
