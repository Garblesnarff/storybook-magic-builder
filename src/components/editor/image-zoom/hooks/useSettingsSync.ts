// src/components/editor/image-zoom/hooks/useSettingsSync.ts
import { useEffect, useCallback, useRef } from 'react';
import { ImageSettings } from '@/types/book'; // Corrected import path

export function useSettingsSync(
  scale: number,
  position: { x: number; y: number },
  fitMethod: 'contain' | 'cover',
  imageLoaded: boolean,
  // isPanning prop is no longer directly needed here for the check
  isInteractionReady: boolean,
  initialSettings?: ImageSettings,
  onSettingsChange?: (settings: ImageSettings) => void
) {
  const lastSavedSettingsRef = useRef<string>(
    JSON.stringify(initialSettings || {})
  );

  const saveSettings = useCallback(() => {
    if (!onSettingsChange || !imageLoaded || !isInteractionReady) {
      console.log("saveSettings: Conditions not met (no callback, image not loaded, or not ready).");
      return;
    }

    // *** REMOVE THIS CHECK ***
    // if (isPanning) {
    //    console.log("saveSettings: Skipping save because panning is active.");
    //    return;
    // }
    // *************************

    const currentSettings: ImageSettings = {
      scale,
      position,
      fitMethod
    };
    const currentSettingsString = JSON.stringify(currentSettings);

    if (currentSettingsString !== lastSavedSettingsRef.current) {
      console.log("useSettingsSync: Settings changed. Calling onSettingsChange with:", currentSettings);
      lastSavedSettingsRef.current = currentSettingsString;
      onSettingsChange(currentSettings);
    } else {
       console.log("useSettingsSync: Settings unchanged, skipping onSettingsChange call.");
    }
  // Update dependencies - remove isPanning if it was added here
  }, [scale, position, fitMethod, imageLoaded, isInteractionReady, onSettingsChange]);

  // ... (rest of the hook remains the same) ...

    useEffect(() => {
     console.log("useSettingsSync: Initial settings changed, resetting lastSavedSettingsRef.");
     lastSavedSettingsRef.current = JSON.stringify(initialSettings || {});
   }, [initialSettings]);


   return {
     saveSettings
   };
}
