
import { useEffect } from 'react';
import { ImageSettings } from '@/types/book';

interface UseSettingsSyncProps {
  scale: number;
  position: { x: number; y: number };
  fitMethod: 'contain' | 'cover';
  onSettingsChange?: (settings: ImageSettings) => void;
  isInteractionReady: boolean;
}

export function useSettingsSync({
  scale,
  position,
  fitMethod,
  onSettingsChange,
  isInteractionReady
}: UseSettingsSyncProps) {
  // Sync settings with parent component when they change
  useEffect(() => {
    if (!onSettingsChange || !isInteractionReady) return;
    
    // Use debounce to avoid too many updates
    const timeoutId = setTimeout(() => {
      onSettingsChange({
        scale,
        position,
        fitMethod
      });
    }, 200);
    
    return () => clearTimeout(timeoutId);
  }, [scale, position, fitMethod, onSettingsChange, isInteractionReady]);
}
