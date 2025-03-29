
import { useState, useEffect, useRef, useCallback } from 'react';

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
  // Track whether an initial save has been completed
  const initialSaveCompleted = useRef(false);
  // Keep track of whether the text has been explicitly modified
  const textModified = useRef(false);
  // Store latest value to use in cleanup
  const latestTextRef = useRef(initialText);

  // Update local text when initialText prop changes (e.g., when page changes)
  useEffect(() => {
    setText(initialText);
    latestTextRef.current = initialText; 
    textModified.current = false;
    initialSaveCompleted.current = false;
  }, [initialText]);

  // Handle text change with immediate update and debounced save
  const handleTextChange = useCallback((newText: string) => {
    // Update local state immediately for responsive typing
    setText(newText);
    latestTextRef.current = newText;
    
    // Mark the text as modified
    textModified.current = true;
    
    // Clear any existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Show saving indicator
    setIsSaving(true);
    
    // Set a delay before saving
    debounceTimerRef.current = setTimeout(() => {
      console.log('Saving text:', newText);
      onSave(newText);
      initialSaveCompleted.current = true;
      
      // Hide saving indicator after a short delay
      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    }, saveDelay);
  }, [onSave, saveDelay]);

  // Force an immediate save if needed
  const forceSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    // Only save if the text has changed
    if (textModified.current) {
      console.log('Force saving text:', latestTextRef.current);
      onSave(latestTextRef.current);
      initialSaveCompleted.current = true;
      textModified.current = false; 
      setIsSaving(false);
    }
  }, [onSave]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      // Ensure we save any pending changes on unmount
      if (textModified.current && debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        onSave(latestTextRef.current);
      }
    };
  }, [onSave]);

  return {
    text,
    setText,
    handleTextChange,
    forceSave,
    isSaving,
    textModified: textModified.current,
    initialSaveCompleted: initialSaveCompleted.current
  };
}
