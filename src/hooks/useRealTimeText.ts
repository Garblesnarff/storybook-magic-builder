
import { useState, useEffect, useRef } from 'react';

interface UseRealTimeTextProps {
  initialText: string;
  onSave: (text: string) => void;
  saveDelay?: number;
}

export function useRealTimeText({ 
  initialText, 
  onSave, 
  saveDelay = 1000 
}: UseRealTimeTextProps) {
  // Local state for the text that updates immediately
  const [text, setText] = useState(initialText);
  // Track if we should show the saving indicator
  const [isSaving, setIsSaving] = useState(false);
  // Reference to the debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update local text when initialText prop changes (e.g., when page changes)
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle text change with immediate update and debounced save
  const handleTextChange = (newText: string) => {
    // Update local state immediately for responsive typing
    setText(newText);
    
    // Clear any existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Only save if the text is different from the initial text
    // and don't reset empty text to default value
    if (newText !== initialText) {
      // Show saving indicator
      setIsSaving(true);
      
      // Set a delay before saving
      debounceTimerRef.current = setTimeout(() => {
        // Call the save function
        onSave(newText);
        
        // Hide saving indicator after a short delay
        setTimeout(() => {
          setIsSaving(false);
        }, 300);
      }, saveDelay);
    }
  };

  return {
    text,
    setText,
    handleTextChange,
    isSaving
  };
}
