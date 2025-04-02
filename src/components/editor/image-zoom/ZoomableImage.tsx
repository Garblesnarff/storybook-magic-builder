
import React, { useState } from 'react';
import { ZoomControls } from './ZoomControls';
import { useZoomableImage } from './useZoomableImage';
import { ImageSettings, DEFAULT_IMAGE_SETTINGS } from '@/types/book';

export interface ZoomableImageProps {
  src: string;
  alt: string;
  settings?: ImageSettings | null;
  onSettingsChange?: (settings: ImageSettings) => void;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  settings,
  onSettingsChange
}) => {
  // Ensure we have valid settings object, using defaults if none provided
  const actualSettings = settings || DEFAULT_IMAGE_SETTINGS;
  
  // Debug the image source
  React.useEffect(() => {
    console.log("ZoomableImage received src:", src ? src.substring(0, 50) + "..." : "undefined");
    console.log("ZoomableImage received settings:", actualSettings);
  }, [src, actualSettings]);

  const {
    containerRef,
    imageRef,
    scale,
    transform,
    onWheel,
    onMouseDown,
    resetZoom,
    zoomIn,
    zoomOut,
    canZoomIn,
    canZoomOut,
    canReset,
    fitMethod
  } = useZoomableImage({
    initialScale: actualSettings.scale,
    initialPosition: actualSettings.position,
    fitMethod: actualSettings.fitMethod,
    onChange: onSettingsChange
  });

  // Handle case where src is undefined or empty
  if (!src) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-500">
        No image available
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Image container */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden bg-gray-100"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        style={{ cursor: 'grab' }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="w-auto h-auto max-w-none"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: 'none',
          }}
          loading="eager"
          onError={(e) => {
            console.error('Image failed to load:', e);
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YxZjFmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIGZhaWxlZCB0byBsb2FkPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
      </div>

      {/* Controls overlay */}
      <ZoomControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetZoom}
        onToggleFitMethod={() => {}} // Empty function as we're not implementing this yet
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        canReset={canReset}
        scale={scale}
        fitMethod={fitMethod}
        isInteractionReady={true}
      />
    </div>
  );
}
