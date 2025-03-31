
# Page Hooks Directory

This directory contains hooks related to page management and editing functionality.

## Files

- `useBookLoading.ts`: Handles loading a book based on ID.
- `usePageSelection.ts`: Manages page selection within a book.
- `usePageData.ts`: Provides the current page data based on selection.
- `useSavingState.ts`: Manages the saving state for operations.
- `usePageOperationsHandlers.ts`: Handles page operations like add, delete, duplicate, and reorder.
- `usePageActions.ts`: Manages page content actions like text and layout changes.

## Usage

These hooks are composed together in the main `usePageState.ts` hook which provides a unified API for the editor components to use.

## Dependencies

- These hooks rely on the BookContext for data operations.
- Some hooks use the sonner toast library for notifications.

## Notes

- Each hook is responsible for a specific aspect of page state management.
- The hooks are designed to be composable and reusable.
- Error handling is implemented in each hook.
