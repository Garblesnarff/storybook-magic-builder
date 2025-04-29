
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
  // Use our custom hook for all the zoom functionality
  const {
    scale,
    fitMethod,
    isPanning,
    imageLoaded,
    isLoading,
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
    handleImageLoad,
    updateDimensions,
    imageStyle
  } = useZoomableImage(src, initialSettings, onSettingsChange);

  // Update dimensions on mount and when the window is resized
  useEffect(() => {
    updateDimensions();
    
    const handleResize = () => {
      updateDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDimensions]);

  // Update dimensions when the image loads
  useEffect(() => {
    if (imageLoaded) {
      updateDimensions();
    }
  }, [imageLoaded, updateDimensions]);

  // Mouse event handlers with interaction check
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    handleMouseUp(e);
  }, [handleMouseUp]);

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
          style={imageStyle}
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
