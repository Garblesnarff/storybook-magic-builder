import { useCallback } from 'react';
import { toast } from 'sonner';

export function usePageContentApplier(
  onApplyText: (text: string) => Promise<void>,
  onApplyImage: (imageUrl: string) => Promise<void>
) {
  const applyText = useCallback(
    async (text: string) => {
      try {
        await onApplyText(text);
        toast.success('Text applied to page');
      } catch (error: any) {
        console.error('Error applying text:', error);
        toast.error(error.message || 'Failed to apply text');
      }
    },
    [onApplyText]
  );

  const applyImage = useCallback(
    async (imageUrl: string) => {
      try {
        await onApplyImage(imageUrl);
        toast.success('Image applied to page');
      } catch (error: any) {
        console.error('Error applying image:', error);
        toast.error(error.message || 'Failed to apply image');
      }
    },
    [onApplyImage]
  );

  return { applyText, applyImage };
}
