import { useState } from 'react';

export function useSavingState() {
  const [isSaving, setIsSaving] = useState(false);
  
  const setSaving = (saving: boolean) => {
    setIsSaving(saving);
  };
  
  return { isSaving, setSaving };
}
