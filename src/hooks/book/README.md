
# Book Operations Hooks

This directory contains hooks related to book operations, broken down by functionality:

- `useBookData.ts`: Handles loading and managing books data.
- `useBookCreation.ts`: Handles creating new books and books from templates.
- `useBookModification.ts`: Handles updating and deleting books.
- `useBookFetching.ts`: Handles fetching book data from the database.
- `index.ts`: Re-exports all hooks for easier imports.

These hooks are used together by the main `useBookOperations.ts` hook which combines their functionality.
