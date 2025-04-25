
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
    handleReset
  } = useZoomableImage(src, initialSettings, onSettingsChange);

  // Handle mouse events in component to ensure we have access to current state
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    handleMouseUp(e);
  }, [handleMouseUp]);

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
            src={`${src}?t=${Date.now()}`} // Add timestamp to force reload
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
