
import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageSettings } from '@/types/book';

export function useImagePan(
  initialSettings?: ImageSettings
) {
  const [position, setPosition] = useState(initialSettings?.position || { x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  
  // Refs for tracking state in callbacks
  const positionRef = useRef(position);
  const isPanningRef = useRef(isPanning);
  const startPanRef = useRef({ x: 0, y: 0 });
  
  // Update refs to keep them in sync with state
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  
  useEffect(() => {
    isPanningRef.current = isPanning;
  }, [isPanning]);

  // Handle mouse down for panning - improved to ensure reliable tracking
  const handleMouseDown = useCallback((e: React.MouseEvent, isInteractionReady: boolean, containerRef: React.RefObject<HTMLDivElement>) => {
    if (!isInteractionReady) return;
    
    // Set panning active
    setIsPanning(true);
    
    // Store the initial point where the user clicked
    startPanRef.current = { 
      x: e.clientX - positionRef.current.x, 
      y: e.clientY - positionRef.current.y 
    };
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
    
    e.preventDefault();
  }, []);

  // Handle mouse move for panning - avoid frequent state updates
  const handleMouseMove = useCallback((e: React.MouseEvent, isInteractionReady: boolean) => {
    if (!isPanningRef.current || !isInteractionReady) return;
    
    // Calculate new position
    const newX = e.clientX - startPanRef.current.x;
    const newY = e.clientY - startPanRef.current.y;
    
    // Use requestAnimationFrame for smoother updates without triggering too many React renders
    requestAnimationFrame(() => {
      setPosition({
        x: newX,
        y: newY
      });
    });
    
    e.preventDefault();
  }, []);

  // Handle mouse up to end panning
  const handleMouseUp = useCallback((
    e: React.MouseEvent, 
    isInteractionReady: boolean, 
    containerRef: React.RefObject<HTMLDivElement>
  ) => {
    if (!isPanningRef.current) return;
    
    setIsPanning(false);
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
    
    // Calculate final position on mouse up
    const finalX = e.clientX - startPanRef.current.x;
    const finalY = e.clientY - startPanRef.current.y;
    
    // Use requestAnimationFrame for the final position update
    requestAnimationFrame(() => {
      // Only set position if the component is still mounted
      setPosition({
        x: finalX,
        y: finalY
      });
    });
    
    e.preventDefault();
  }, []);

  return {
    position,
    setPosition,
    isPanning,
    setIsPanning,
    positionRef,
    isPanningRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}
