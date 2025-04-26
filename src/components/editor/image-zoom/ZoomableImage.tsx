
import React, { useCallback, memo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ZoomableImageProps } from './types';
import { ZoomControls } from './ZoomControls';
import { useZoomableImage } from './hooks/useZoomableImage';
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
    isLoading,
    isInteractionReady,
    containerRef,
    imageRef,
    handleMouseDown: rawHandleMouseDown,
    handleMouseMove: rawHandleMouseMove,
    handleMouseUp: rawHandleMouseUp,
    handleZoomIn,
    handleZoomOut,
    toggleFitMethod,
    handleReset,
    handleImageLoad,
    updateDimensions
  } = useZoomableImage(src, initialSettings, onSettingsChange);

  // Add wrapper handlers that check for isInteractionReady before executing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isInteractionReady) return;
    rawHandleMouseDown(e);
  }, [isInteractionReady, rawHandleMouseDown]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isInteractionReady) return;
    rawHandleMouseMove(e);
  }, [isInteractionReady, rawHandleMouseMove]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isInteractionReady) return;
    rawHandleMouseUp(e);
  }, [isInteractionReady, rawHandleMouseUp]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    handleMouseUp(e);
  }, [handleMouseUp]);

  // Update dimensions on mount and when the window is resized
  useEffect(() => {
    updateDimensions();
    
    const handleResize = () => {
      updateDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update dimensions when the image loads
  useEffect(() => {
    if (imageLoaded) {
      updateDimensions();
    }
  }, [imageLoaded]);

  // Generate unique key for image to ensure proper remounting
  const imageKey = `${src}-${Date.now()}`;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        <img
          ref={imageRef}
          key={imageKey}
          src={src}
          alt={alt}
          className={cn(
            "select-none will-change-transform opacity-0 transition-opacity duration-300",
            imageLoaded && "opacity-100",
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
            console.error('Image failed to load:', {
              src,
              error: e
            });
          }}
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
      
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
