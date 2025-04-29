
import { useState } from 'react';

export function useSavingState() {
  const [isSaving, setIsSaving] = useState(false);
  const [operationsCount, setOperationsCount] = useState(0);
  
  const setSaving = (saving: boolean) => {
    setIsSaving(saving);
  };
  
  // Add these functions to track saving operations
  const trackSavingOperation = () => {
    setIsSaving(true);
    setOperationsCount(prev => prev + 1);
  };
  
  const completeSavingOperation = () => {
    setOperationsCount(prev => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        setIsSaving(false);
      }
      return newCount;
    });
  };
  
  return { 
    isSaving, 
    setSaving,
    trackSavingOperation,
    completeSavingOperation
  };
}
