
# Page Services

This directory contains service functions related to page operations.

## Files

- `pageCreation.ts`: Functions for creating and duplicating pages
- `pageModification.ts`: Functions for updating, deleting, and reordering pages

## Functions

### pageCreation.ts

- `addPage(book, allBooks)`: Adds a new page to a book and returns the updated books array and new page ID
- `duplicatePage(id, book, allBooks)`: Duplicates an existing page and returns the updated books array and new page ID

### pageModification.ts

- `updatePage(page)`: Updates a page with new content, handling image uploads if needed
- `deletePage(pageId, book, allBooks)`: Deletes a page from a book and cleans up associated images
- `reorderPage(id, newPosition, book, allBooks)`: Changes the order of a page within a book

## Usage

```typescript
import { addPage, duplicatePage } from '../page/pageCreation';
import { updatePage, deletePage, reorderPage } from '../page/pageModification';

// Add a new page
const [updatedBooks, newPageId] = await addPage(currentBook, allBooks);

// Update a page
await updatePage(modifiedPage);

// Reorder a page
const booksAfterReorder = await reorderPage(pageId, newPosition, currentBook, allBooks);
```

## Dependencies

- UUID generation for creating unique IDs
- Supabase storage services for image management
- Book and BookPage data models
