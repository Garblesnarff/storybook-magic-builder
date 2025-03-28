
# Hooks Directory

This directory contains custom React hooks used throughout the application.

### Files

- `useBookOperations.ts`: Manages book-related operations such as creating, updating, deleting, and loading books.
- `usePageOperations.ts`: Handles all page-related operations within a book, including adding, updating, deleting, reordering, and duplicating pages.
- `useBookManager.ts`: Combines the functionality of `useBookOperations` and `usePageOperations` into a single hook used by the BookContext.
- `usePageState.ts`: Manages the state and operations for the currently selected page in the editor.
- `useAIOperations.ts`: Handles AI-related operations such as generating text and images.
- `use-mobile.tsx`: Provides utilities for responsive design and detecting mobile devices.

### Implementation Guidelines

1. Each hook should have a single, well-defined responsibility.
2. Hooks should expose a clear public API that's documented in comments.
3. Error handling should be handled within each hook, exposing error states to consumers.
4. Loading states should be provided for all asynchronous operations.

### Dependencies

- These hooks rely on services defined in the `src/services` directory for data operations.
- State management is handled with React's useState and useEffect hooks.
- Context is used to provide book and page data throughout the application.

### Notes

- When adding new functionality, consider whether it belongs in an existing hook or if a new hook should be created.
- Keep hooks focused on a single concern to maintain modularity.
