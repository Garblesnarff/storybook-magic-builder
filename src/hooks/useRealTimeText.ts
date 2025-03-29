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
  // Track whether an initial save has been completed
  const initialSaveCompleted = useRef(false);
  // Keep track of whether the text has been explicitly modified
  const textModified = useRef(false);

  // Update local text when initialText prop changes (e.g., when page changes)
  useEffect(() => {
    setText(initialText);
    textModified.current = false;
    initialSaveCompleted.current = false;
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
      // Always save the text, even if it's the same as initialText
      // This ensures we override any default value in the database
      console.log('Saving text:', newText);
      onSave(newText);
      initialSaveCompleted.current = true;
      
      // Hide saving indicator after a short delay
      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    }, saveDelay);
  };

  // Force an immediate save if needed
  const forceSave = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    console.log('Force saving text:', text);
    onSave(text);
    initialSaveCompleted.current = true;
    setIsSaving(false);
  };

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
