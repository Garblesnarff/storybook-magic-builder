
# Page Service Modules

This directory contains modules related to page operations in Supabase.

## Files

- `addPage.ts`: Function for adding new pages to a book
- `updatePage.ts`: Function for updating existing pages
- `deletePage.ts`: Function for deleting pages and their associated assets
- `reorderPages.ts`: Function for reordering pages within a book
- `index.ts`: Re-exports all functions for easier imports

## Usage

```typescript
// Import specific functions directly
import { addPageToSupabase } from '@/services/supabase/page/addPage';
import { updatePageInSupabase } from '@/services/supabase/page/updatePage';

// Or import from the index file
import { 
  addPageToSupabase,
  updatePageInSupabase
} from '@/services/supabase/page';

// Or use the legacy imports (backward compatible)
import { 
  addPageToSupabase,
  updatePageInSupabase
} from '@/services/supabase/pageService';
```

## Error Handling

All functions include:
- Error logging to console
- User-friendly error messages via toast notifications
- Type-safe return values with appropriate null/error handling

## Dependencies

- Supabase client from `@/integrations/supabase/client`
- Toast notifications via `sonner`
- Storage utilities from `@/services/supabase/storage`
- Book types from `@/types/book`
