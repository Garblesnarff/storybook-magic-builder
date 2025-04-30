
# Book Service Modules

This directory contains modules related to book operations in Supabase.

## Files

- `fetchBook.ts`: Functions for retrieving books from the database
- `imageUpload.ts`: Functions for uploading images to Supabase storage
- `saveBook.ts`: Functions for saving book data to Supabase
- `createBook.ts`: Functions for creating new books in Supabase
- `deleteBook.ts`: Functions for deleting books from Supabase
- `listBooks.ts`: Functions for listing books from Supabase
- `index.ts`: Re-exports all functions for easier imports

## Usage

```typescript
// Import specific functions directly
import { fetchBookFromDatabase } from '@/services/supabase/book/fetchBook';
import { createBookInSupabase } from '@/services/supabase/book/createBook';

// Or import from the index file
import { 
  fetchBookFromDatabase,
  createBookInSupabase 
} from '@/services/supabase/book';

// Or use the legacy imports (backward compatible)
import { 
  fetchBookFromDatabase,
  createBookInSupabase 
} from '@/services/supabase/bookService';
```

## Dependencies

- Supabase client from `@/integrations/supabase/client`
- Book types from `@/types/book`
