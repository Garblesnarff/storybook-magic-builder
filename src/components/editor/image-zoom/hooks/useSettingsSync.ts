
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
  
  // Enhanced save settings function with debounce mechanism
  const saveSettings = useCallback(() => {
    if (!onSettingsChange || !imageLoaded || !isInteractionReady) return;
    
    // Clear any existing timeout to prevent multiple saves
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
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
      // Use a short timeout to avoid too frequent updates
      saveTimeoutRef.current = window.setTimeout(() => {
        console.log('Saving image settings:', currentSettings);
        lastSavedSettingsRef.current = currentSettingsString;
        if (onSettingsChange) {
          onSettingsChange(currentSettings);
        }
      }, 50);
    }
  }, [imageLoaded, isInteractionReady, onSettingsChange, scale, position, fitMethod]);

  // Set up an auto-save effect when component unmounts
  useEffect(() => {
    return () => {
      // Clean up timeout
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      
      // Final save on unmount
      saveSettings();
    };
  }, [saveSettings]);

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
