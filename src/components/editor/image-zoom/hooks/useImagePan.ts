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
  const lastMoveTimeRef = useRef(0);
  
  // Update refs to keep them in sync with state
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  
  useEffect(() => {
    isPanningRef.current = isPanning;
  }, [isPanning]);

  // Handle mouse down for panning - Modified to accept only the event parameter
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // No need to check isInteractionReady here, it will be checked by the component
    
    // Set panning active
    setIsPanning(true);
    isPanningRef.current = true;
    
    // Store the initial point where the user clicked
    startPanRef.current = { 
      x: e.clientX - positionRef.current.x, 
      y: e.clientY - positionRef.current.y 
    };
    
    e.preventDefault();
  }, []);

  // Handle mouse move for panning with throttling - Modified to accept only the event parameter
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    
    // Throttle updates for smoother panning
    const now = Date.now();
    if (now - lastMoveTimeRef.current < 16) { // ~60fps (1000ms/60)
      return;
    }
    lastMoveTimeRef.current = now;
    
    // Calculate new position
    const newX = e.clientX - startPanRef.current.x;
    const newY = e.clientY - startPanRef.current.y;
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setPosition({
        x: newX,
        y: newY
      });
    });
    
    e.preventDefault();
  }, []);

  // Handle mouse up to end panning - Modified to accept only the event parameter
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    
    // Calculate final position on mouse up
    const finalX = e.clientX - startPanRef.current.x;
    const finalY = e.clientY - startPanRef.current.y;
    
    // Update position one last time and end panning state
    requestAnimationFrame(() => {
      setPosition({
        x: finalX,
        y: finalY
      });
      
      setIsPanning(false);
      isPanningRef.current = false;
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
