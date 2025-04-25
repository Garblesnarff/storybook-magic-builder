
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageSettings } from '@/types/book';
import { useImageLoading } from '@/hooks/useImageLoading';
import { Loader2 } from 'lucide-react';

interface ZoomableImageProps {
  src: string;
  alt: string;
  initialSettings?: ImageSettings;
  onSettingsChange?: (settings: ImageSettings) => void;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  initialSettings,
  onSettingsChange
}) => {
  const { isLoading, loadedUrl, error } = useImageLoading(src);
  const [settings, setSettings] = useState<ImageSettings>(
    initialSettings || { scale: 1, position: { x: 0, y: 0 }, fitMethod: 'contain' }
  );

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleDragEnd = (event: any, info: any) => {
    const newSettings = {
      ...settings,
      position: {
        x: info.point.x,
        y: info.point.y
      }
    };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !loadedUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
        Failed to load image
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <motion.img
        src={loadedUrl}
        alt={alt}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{
          width: '100%',
          height: '100%',
          objectFit: settings.fitMethod || 'contain',
          scale: settings.scale,
          x: settings.position.x,
          y: settings.position.y
        }}
        className="will-change-transform"
      />
    </div>
  );
};
