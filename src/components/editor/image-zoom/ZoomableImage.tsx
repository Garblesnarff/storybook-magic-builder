
import React, { useState, useRef, useEffect } from 'react';
import { ImageSettings } from '@/types/book';
import { ZoomControls } from './ZoomControls';
import { useImageDimensions } from './hooks/useImageDimensions';
import { useImageZoom } from './hooks/useImageZoom';
import { useImagePan } from './hooks/useImagePan';
import { useImageFit } from './hooks/useImageFit';
import { useSettingsSync } from './hooks/useSettingsSync';

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

  // Dimensions and readiness tracking
  const {
    imageDimensions,
    containerDimensions,
    imageLoaded,
    isInteractionReady,
    updateContainerSize
  } = useImageDimensions(src);

  // Get zoom functionality
  const {
    scale,
    setScale,
    handleZoomIn,
    handleZoomOut
  } = useImageZoom(settings);

  // Get pan functionality
  const {
    position,
    setPosition,
    isPanning,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useImagePan(settings);

  // Get object fit functionality
  const {
    fitMethod,
    toggleFitMethod,
    fitImageToContainer
  } = useImageFit(settings, onSettingsChange);

  // Sync settings with parent component
  useSettingsSync({
    scale,
    position,
    fitMethod,
    onSettingsChange,
    isInteractionReady
  });

  // Update container dimensions on resize
  useEffect(() => {
    const updateSize = () => updateContainerSize(containerRef);
    updateSize();

    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [updateContainerSize]);

  // Auto-fit image when loaded
  useEffect(() => {
    if (imageLoaded && containerDimensions.width > 0 && imageDimensions.width > 0) {
      fitImageToContainer(
        imageLoaded,
        containerDimensions,
        imageDimensions,
        isInteractionReady,
        setScale,
        setPosition,
        scale
      );
    }
  }, [imageLoaded, containerDimensions, imageDimensions, fitImageToContainer, isInteractionReady, setScale, setPosition, scale]);

  // Handle wheel events for zooming
  const handleWheel = (e: React.WheelEvent) => {
    if (!isInteractionReady) return;
    e.preventDefault();
    
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Handle reset function
  const handleReset = React.useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [setScale, setPosition]);

  return (
    <div className="relative w-full h-full group">
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        onMouseDown={(e) => handleMouseDown(e, isInteractionReady, containerRef)}
        onMouseUp={(e) => handleMouseUp(e, isInteractionReady, containerRef)}
        onMouseLeave={(e) => handleMouseUp(e, isInteractionReady, containerRef)}
        onMouseMove={(e) => handleMouseMove(e, isInteractionReady)}
        onWheel={handleWheel}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="transition-transform duration-200 ease-out"
          style={{
            objectFit: fitMethod,
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center',
            width: '100%',
            height: '100%',
          }}
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
        canZoomIn={scale < 4}
        canZoomOut={scale > 0.5}
        canReset={scale !== 1 || position.x !== 0 || position.y !== 0}
      />
    </div>
  );
};
