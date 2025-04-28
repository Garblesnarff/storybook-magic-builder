
import { useState } from 'react';

export function useSavingState() {
  const [isSaving, setIsSaving] = useState(false);
  const [operationCount, setOperationCount] = useState(0);
  
  const trackSavingOperation = () => {
    setIsSaving(true);
    setOperationCount(prev => prev + 1);
  };
  
  const completeSavingOperation = () => {
    setOperationCount(prev => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setIsSaving(false);
        return 0;
      }
      return newCount;
    });
  };
  
  const setSaving = (value: boolean) => {
    setIsSaving(value);
    if (!value) {
      setOperationCount(0);
    }
  };
  
  return {
    isSaving,
    setSaving,
    trackSavingOperation,
    completeSavingOperation
  };
}
