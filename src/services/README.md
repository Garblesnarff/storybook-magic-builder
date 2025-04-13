
# Services Directory

This directory contains service functions that provide the core business logic for the application.

## Structure

- **book/**: Contains operations related to book management
  - `bookCreation.ts`: Functions for creating books
  - `bookOperations.ts`: Functions for updating and deleting books
  
- **page/**: Contains operations related to page management
  - `pageCreation.ts`: Functions for creating and duplicating pages
  - `pageModification.ts`: Functions for updating, deleting, and reordering pages
  
- **supabase/**: Contains services for interacting with Supabase
  - `storageService.ts`: Functions for managing file storage
  - `bookService.ts`: Functions for interacting with book data in Supabase
  - `pageService.ts`: Functions for interacting with page data in Supabase
  - `utils.ts`: Utility functions for Supabase data conversion

- **pageOperations.ts**: Re-exports functions from refactored modules to maintain backward compatibility

## Usage

Services can be imported from their specific modules or from the main re-export file:

```typescript
// Importing specific services directly
import { addPage, duplicatePage } from './page/pageCreation';
import { updatePage } from './page/pageModification';

// Or using the compatibility layer
import { addPage, updatePage, duplicatePage } from './pageOperations';
```

## Dependencies

These services rely on:
- UUID generation for creating unique IDs
- Supabase storage services for image management
- The Book and BookPage data models from the types directory

## Notes

- All async functions return Promises and should be properly awaited
- Image upload/deletion is handled through the Supabase storage service
- Error handling is implemented in each function
