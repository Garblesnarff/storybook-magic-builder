
# Page State Hooks

This directory contains hooks that manage different aspects of page state in the book editor.

### Files

- `useBookLoading.ts`: Handles loading book data when book ID changes
- `usePageSelection.ts`: Manages the currently selected page
- `usePageData.ts`: Derives the current page data from book and page ID
- `useSavingState.ts`: Manages saving state and indicators across page operations
- `usePageOperationsHandlers.ts`: Provides handlers for page CRUD operations
- `usePageActions.ts`: Handles page content updates like text changes, layout changes, etc.

### Implementation Guidelines

Each hook handles one specific aspect of page state management, making the codebase more modular, testable, and maintainable.
