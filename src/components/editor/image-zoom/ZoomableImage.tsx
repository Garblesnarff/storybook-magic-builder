
import React, { useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { ZoomableImageProps } from './types';
import { ZoomControls } from './ZoomControls';
import { useZoomableImage } from './useZoomableImage';
import { Loader2 } from 'lucide-react';

export const ZoomableImage: React.FC<ZoomableImageProps> = memo(({ 
  src, 
  alt,
  className = '',
  initialSettings,
  onSettingsChange
}) => {
  const {
    scale,
    position,
    fitMethod,
    isPanning,
    imageLoaded,
    isInteractionReady,
    containerRef,
    imageRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleZoomIn,
    handleZoomOut,
    toggleFitMethod,
    handleReset,
    handleImageLoad
  } = useZoomableImage(src, initialSettings, onSettingsChange);

  // Handle mouse events in component to ensure we have access to current state
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    handleMouseUp(e);
  }, [handleMouseUp]);

  // Add cache busting to src URL and log the URL for debugging
  const cacheBustedSrc = src.includes('?') ? 
    `${src}&_t=${Date.now()}` : 
    `${src}?_t=${Date.now()}`;
  
  console.log('ZoomableImage rendering with src:', cacheBustedSrc);
  console.log('Image loaded state:', imageLoaded);
  console.log('Container dimensions:', containerRef.current?.clientWidth, containerRef.current?.clientHeight);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {imageLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center w-full h-full">
          <img
            ref={imageRef}
            key={cacheBustedSrc} // Add key to force remount on src change
            src={cacheBustedSrc}
            alt={alt}
            className={cn(
              "select-none will-change-transform",
              fitMethod === 'contain' ? "object-contain" : "object-cover",
              isPanning ? "cursor-grabbing" : "cursor-grab",
              className
            )}
            style={{ 
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
              transformOrigin: 'center',
              maxWidth: "none",
              maxHeight: "none",
            }}
            onLoad={handleImageLoad}
            onError={(e) => {
              console.error('Image load error:', e);
            }}
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}
      
      <ZoomControls 
        scale={scale}
        fitMethod={fitMethod}
        isInteractionReady={isInteractionReady}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleFitMethod={toggleFitMethod}
        onReset={handleReset}
      />
    </div>
  );
});

ZoomableImage.displayName = 'ZoomableImage';
