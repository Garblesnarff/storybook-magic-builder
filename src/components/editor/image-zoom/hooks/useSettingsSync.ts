
import { useEffect, useCallback, useRef } from 'react';
import { ImageSettings } from '@/types/book';

export function useSettingsSync(
  scale: number,
  position: { x: number; y: number },
  fitMethod: 'contain' | 'cover',
  imageLoaded: boolean,
  isInteractionReady: boolean,
  initialSettings?: ImageSettings,
  onSettingsChange?: (settings: ImageSettings) => void
) {
  const lastSavedSettingsRef = useRef<string>(
    JSON.stringify(initialSettings || {})
  );

  const saveSettings = useCallback(() => {
    if (!onSettingsChange || !imageLoaded || !isInteractionReady) {
      return;
    }

    const currentSettings: ImageSettings = {
      scale,
      position,
      fitMethod
    };
    
    const currentSettingsString = JSON.stringify(currentSettings);

    if (currentSettingsString !== lastSavedSettingsRef.current) {
      lastSavedSettingsRef.current = currentSettingsString;
      onSettingsChange(currentSettings);
    }
  }, [scale, position, fitMethod, imageLoaded, isInteractionReady, onSettingsChange]);

  useEffect(() => {
    lastSavedSettingsRef.current = JSON.stringify(initialSettings || {});
  }, [initialSettings]);

  return {
    saveSettings
  };
}
