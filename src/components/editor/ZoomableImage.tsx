
import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, MoveHorizontal, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ 
  src, 
  alt,
  className = ''
}) => {
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const startPanRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load image dimensions when source changes
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.src = src;
  }, [src]);

  // Get container dimensions
  useEffect(() => {
    if (containerRef.current) {
      const updateContainerSize = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          setContainerDimensions({ width, height });
        }
      };

      updateContainerSize();
      window.addEventListener('resize', updateContainerSize);
      return () => window.removeEventListener('resize', updateContainerSize);
    }
  }, []);

  // Calculate initial fitting scale when image and container dimensions are available
  useEffect(() => {
    if (imageLoaded && containerDimensions.width > 0 && containerDimensions.height > 0) {
      // Reset position when image changes
      setPosition({ x: 0, y: 0 });
    }
  }, [imageLoaded, containerDimensions, imageDimensions]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    startPanRef.current = { 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    };
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const newX = e.clientX - startPanRef.current.x;
      const newY = e.clientY - startPanRef.current.y;
      
      setPosition({
        x: newX,
        y: newY
      });
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const canMove = true; // Always allow moving

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {imageLoaded && (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={cn(
            "select-none object-contain max-w-none", 
            isPanning ? "cursor-grabbing" : "cursor-grab",
            className
          )}
          style={{ 
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
            transformOrigin: 'center',
            maxHeight: '100%',
            width: 'auto',
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: '-50%',
            marginTop: '-50%'
          }}
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
        />
      )}
      
      {/* Drag indicator */}
      {canMove && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-gray-700 flex items-center z-10">
          <MoveHorizontal className="h-3 w-3 mr-1" />
          <span>Drag to position</span>
        </div>
      )}
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
        <Button 
          size="sm" 
          variant="secondary" 
          className="rounded-full h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
          onClick={handleZoomIn}
          disabled={scale >= 3}
        >
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only">Zoom In</span>
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="rounded-full h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
          <span className="sr-only">Zoom Out</span>
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="rounded-full h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
          onClick={handleReset}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Reset View</span>
        </Button>
      </div>
    </div>
  );
};
