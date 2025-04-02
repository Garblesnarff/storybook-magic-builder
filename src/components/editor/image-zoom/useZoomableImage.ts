
import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageSettings } from '@/types/book';

interface Position {
  x: number;
  y: number;
}

export function useZoomableImage({
  initialScale = 1,
  initialPosition = { x: 0, y: 0 },
  fitMethod = 'contain',
  onChange
}: {
  initialScale?: number;
  initialPosition?: Position;
  fitMethod?: 'contain' | 'cover';
  onChange?: (settings: ImageSettings) => void;
} = {}) {
  // State
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isPanning, setIsPanning] = useState(false);
  const [transform, setTransform] = useState({ x: initialPosition.x, y: initialPosition.y });
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const startPanRef = useRef({ x: 0, y: 0 });

  // State for tracking zooming limits
  const [canZoomIn, setCanZoomIn] = useState(true);
  const [canZoomOut, setCanZoomOut] = useState(true);
  const [canReset, setCanReset] = useState(false);
  
  // Update transform when position or scale changes
  useEffect(() => {
    setTransform({ x: position.x, y: position.y });
    
    // Update zoom control states
    setCanZoomIn(scale < 4);
    setCanZoomOut(scale > 0.5);
    setCanReset(scale !== 1 || position.x !== 0 || position.y !== 0);
    
    // Call onChange callback if provided
    if (onChange) {
      onChange({
        scale,
        position,
        fitMethod
      });
    }
  }, [scale, position, fitMethod, onChange]);

  // Wheel handler for zooming
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    // Calculate new scale
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(4, scale + delta));
    
    if (newScale !== scale) {
      setScale(newScale);
    }
  }, [scale]);

  // Mouse handlers for panning
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    startPanRef.current = { 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    };
    
    // Add global mouse move/up handlers
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [position]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      setPosition({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y
      });
    }
  }, [isPanning]);

  const onMouseUp = useCallback(() => {
    setIsPanning(false);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }, [onMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    const newScale = Math.min(scale * 1.2, 4);
    setScale(newScale);
  }, [scale]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(scale / 1.2, 0.5);
    setScale(newScale);
  }, [scale]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  return {
    containerRef,
    imageRef,
    scale,
    transform,
    position,
    isPanning,
    onWheel,
    onMouseDown,
    zoomIn,
    zoomOut,
    resetZoom,
    canZoomIn,
    canZoomOut,
    canReset,
    fitMethod
  };
}
