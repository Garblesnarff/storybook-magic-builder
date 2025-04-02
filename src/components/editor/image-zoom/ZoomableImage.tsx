
import React, { useState, useRef, useEffect } from 'react';
import { ImageSettings } from '@/types/book';
import { ZoomControls } from './ZoomControls';
import { useZoomableImage } from './useZoomableImage';

interface ZoomableImageProps {
  src: string;
  alt: string;
  settings?: ImageSettings;
  onSettingsChange?: (settings: ImageSettings) => void;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  settings,
  onSettingsChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const defaultSettings: ImageSettings = {
    zoom: 1,
    panX: 0,
    panY: 0,
    objectFit: 'contain',
  };

  // Use the provided settings or default
  const imageSettings = settings || defaultSettings;
  
  const {
    zoom,
    panX,
    panY,
    objectFit,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    isPanning,
    startPanning,
    stopPanning,
    onPanMove,
    setObjectFit,
  } = useZoomableImage({
    imgRef,
    containerRef,
    initialSettings: imageSettings,
    onSettingsChange,
  });

  // Safeguard to ensure objectFit is valid for the component
  const safeObjectFit = objectFit === 'fill' ? 'contain' : objectFit;

  return (
    <div className="relative w-full h-full group">
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        onMouseDown={startPanning}
        onMouseUp={stopPanning}
        onMouseLeave={stopPanning}
        onMouseMove={isPanning ? onPanMove : undefined}
        onTouchStart={startPanning}
        onTouchEnd={stopPanning}
        onTouchMove={isPanning ? onPanMove : undefined}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="transition-transform duration-200 ease-out"
          style={{
            objectFit: safeObjectFit,
            transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
            transformOrigin: 'center',
            width: '100%',
            height: '100%',
          }}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
      
      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onFitChange={(fit) => setObjectFit(fit)}
        currentFit={safeObjectFit}
        zoom={zoom}
      />
    </div>
  );
};
