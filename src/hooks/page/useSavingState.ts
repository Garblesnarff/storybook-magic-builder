
import { useRef, useState, useEffect } from 'react';

export function useSavingState() {
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentSavingOperationsRef = useRef<number>(0);

  // Helper function to track saving operations
  const trackSavingOperation = () => {
    // Increment the counter
    currentSavingOperationsRef.current += 1;
    
    // Make sure saving indicator is shown
    setIsSaving(true);
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };

  // Helper function to complete a saving operation
  const completeSavingOperation = () => {
    // Decrement the counter
    currentSavingOperationsRef.current = Math.max(0, currentSavingOperationsRef.current - 1);
    
    // If no more operations are in progress, schedule hiding the indicator
    if (currentSavingOperationsRef.current === 0) {
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(false);
      }, 800);
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    trackSavingOperation,
    completeSavingOperation
  };
}
