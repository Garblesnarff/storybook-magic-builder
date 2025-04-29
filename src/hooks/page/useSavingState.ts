
import { useState } from 'react';

export function useSavingState() {
  const [isSaving, setSaving] = useState(false);

  // Track saving operations
  const trackSavingOperation = () => {
    setSaving(true);
  };

  // Complete saving operation
  const completeSavingOperation = () => {
    setSaving(false);
  };

  return {
    isSaving,
    setSaving,
    trackSavingOperation,
    completeSavingOperation
  };
}
