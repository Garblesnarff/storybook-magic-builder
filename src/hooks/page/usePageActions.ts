
// This file has been deprecated and its functionality has been split into:
// - useTextEditor.ts
// - useLayoutManager.ts
// - useImageSettings.ts
// This file is kept for backwards compatibility and to prevent import errors.

import { useTextEditor } from './useTextEditor';
import { useLayoutManager } from './useLayoutManager';
import { useImageSettings } from './useImageSettings';
import { BookPage } from '@/types/book';

export function usePageActions(
  currentBook: any,
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>
) {
  const { handleTextChange, handleTextFormattingChange } = useTextEditor(currentPageData, updatePage);
  const { handleLayoutChange } = useLayoutManager(currentPageData, updatePage);
  const { handleImageSettingsChange } = useImageSettings(currentPageData, updatePage);

  return {
    handleTextChange,
    handleLayoutChange,
    handleTextFormattingChange,
    handleImageSettingsChange
  };
}
