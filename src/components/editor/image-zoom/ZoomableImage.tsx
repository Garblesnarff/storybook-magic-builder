
import React, { useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { ZoomableImageProps } from './types';
import { ZoomControls } from './ZoomControls';
import { useZoomableImage } from './useZoomableImage';

// Using memo to prevent unnecessary re-renders
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
    saveSettings
  } = useZoomableImage(src, initialSettings, onSettingsChange);

  // Handler for mouse up which also saves settings
  const handleMouseUpWithSave = useCallback((e: React.MouseEvent) => {
    handleMouseUp(e);
    
    // Only save settings after the interaction is fully complete
    setTimeout(() => {
      if (isInteractionReady && imageLoaded) {
        saveSettings();
      }
    }, 100);
  }, [handleMouseUp, isInteractionReady, imageLoaded, saveSettings]);
  
  // Save settings when mouse leaves the component
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    handleMouseUp(e);
    
    // Save settings when mouse leaves the component
    setTimeout(() => {
      if (isInteractionReady && imageLoaded) {
        saveSettings();
      }
    }, 100);
  }, [handleMouseUp, isInteractionReady, imageLoaded, saveSettings]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpWithSave}
      onMouseLeave={handleMouseLeave}
    >
      {imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center w-full h-full">
          <img
            ref={imageRef}
            src={src}
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
              maxWidth: "none", // Remove max-width constraint to allow proper scaling
              maxHeight: "none", // Remove max-height constraint to allow proper scaling
            }}
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
          />
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
