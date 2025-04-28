
import { usePageContentApplier } from '@/hooks/ai/usePageContentApplier';
import { BookPage } from '@/types/book';

// Hook that wraps usePageContentApplier for cleaner usage
export function useAIOperations(
  currentPageData: BookPage | null,
  updatePage: (page: BookPage) => Promise<void>,
  setCurrentPageData: (page: BookPage | null) => void,
  onAddPage?: () => Promise<string | undefined>
) {
  // Pass all props to the usePageContentApplier hook
  return usePageContentApplier(currentPageData, updatePage, setCurrentPageData, onAddPage);
}
