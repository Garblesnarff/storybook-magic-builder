
import React, { useCallback, memo, useEffect } from 'react';
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

  // Handler for saving settings after user actions (when component unmounts or leaves)
  const handleMouseUpWithSave = useCallback((e: React.MouseEvent) => {
    handleMouseUp(e);
    
    // Only save settings after interaction has fully completed
    if (isInteractionReady && imageLoaded) {
      // Use setTimeout to ensure mouse up is fully processed first
      setTimeout(() => saveSettings(), 100);
    }
  }, [handleMouseUp, isInteractionReady, imageLoaded, saveSettings]);
  
  // Save settings when mouse leaves the component
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    handleMouseUp(e);
    
    // Save settings when mouse leaves the component
    if (isInteractionReady && imageLoaded) {
      // Use setTimeout to ensure mouse up is fully processed first
      setTimeout(() => saveSettings(), 100);
    }
  }, [handleMouseUp, isInteractionReady, imageLoaded, saveSettings]);

  // Add an effect to save settings on unmount
  useEffect(() => {
    return () => {
      if (isInteractionReady && imageLoaded) {
        saveSettings();
      }
    };
  }, [src, isInteractionReady, imageLoaded, saveSettings]);

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
        onZoomIn={() => {
          handleZoomIn();
          // Don't save immediately after zoom to avoid update conflicts
        }}
        onZoomOut={() => {
          handleZoomOut();
          // Don't save immediately after zoom to avoid update conflicts
        }}
        onToggleFitMethod={() => {
          toggleFitMethod();
          // Don't save immediately after fit method change to avoid update conflicts
        }}
        onReset={() => {
          handleReset();
          // Don't save immediately after reset to avoid update conflicts
        }}
      />
    </div>
  );
});

ZoomableImage.displayName = 'ZoomableImage';
