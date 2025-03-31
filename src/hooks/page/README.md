
# Page Hooks Directory

This directory contains hooks related to page management and editing functionality.

## Files

- `useBookLoading.ts`: Handles loading a book based on ID.
- `usePageSelection.ts`: Manages page selection within a book.
- `usePageData.ts`: Provides the current page data based on selection.
- `useSavingState.ts`: Manages the saving state for operations.
- `usePageOperationsHandlers.ts`: Handles page operations like add, delete, duplicate, and reorder.
- `useTextEditor.ts`: Manages text content editing functionality.
- `useLayoutManager.ts`: Handles page layout changes.
- `useImageSettings.ts`: Manages image settings and positioning.
- `useBookTitle.ts`: Handles book title updates.

## Usage

These hooks are composed together in the main `usePageState.ts` hook which provides a unified API for the editor components to use.

## Dependencies

- These hooks rely on the BookContext for data operations.
- Some hooks use the sonner toast library for notifications.

## Notes

- Each hook is responsible for a specific aspect of page state management.
- The hooks are designed to be composable and reusable.
- Error handling is implemented in each hook.
- Most hooks use the useSavingState hook to track async operations.
