
import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const imageRef = useRef<HTMLDivElement>(null);
  const startPanRef = useRef({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.25, 1);
      // Reset position if we're back to normal scale
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsPanning(true);
      startPanRef.current = { 
        x: e.clientX - position.x, 
        y: e.clientY - position.y 
      };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && scale > 1) {
      setPosition({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y
      });
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div 
        ref={imageRef}
        className={`w-full h-full select-none ${isPanning ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'}`}
        style={{ 
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transition: isPanning ? 'none' : 'transform 0.2s ease-out'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
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
          disabled={scale <= 1}
        >
          <ZoomOut className="h-4 w-4" />
          <span className="sr-only">Zoom Out</span>
        </Button>
        {scale > 1 && (
          <Button 
            size="sm" 
            variant="secondary" 
            className="rounded-full h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
            onClick={handleReset}
          >
            <Move className="h-4 w-4" />
            <span className="sr-only">Reset View</span>
          </Button>
        )}
      </div>
    </div>
  );
};
