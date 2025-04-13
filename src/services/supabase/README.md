
# Supabase Services Directory

This directory contains modular services for interacting with Supabase.

### Files

- **bookService.ts**: Handles book-related operations with Supabase including creating, loading, updating, and deleting books. Contains functions such as `saveBookToSupabase`, `loadBookFromSupabase`, `loadBooksFromSupabase`, `createBookInSupabase`, and `deleteBookFromSupabase`.

- **pageService.ts**: Manages page-related operations within books, including adding, updating, deleting, and reordering pages in Supabase. Contains functions such as `addPageToSupabase`, `updatePageInSupabase`, `deletePageFromSupabase`, and `reorderPagesInSupabase`.

- **utils.ts**: Provides utility functions for data conversion between the application's data models and Supabase database schema. Contains functions like `bookPageToDatabasePage` and `databasePageToBookPage`.

### Subdirectories

- **storage/**: Contains functions for managing Supabase Storage operations. See storage/README.md for details.

### Instructions

- All database interactions with Supabase should go through these service modules
- When adding new functionality, place it in the appropriate service file based on its purpose
- Keep functions focused on a single responsibility
- Handle errors gracefully and provide user-friendly error messages via toast notifications

### Dependencies

- @supabase/supabase-js: For interacting with Supabase client
- sonner: For toast notifications
- Book and BookPage types from src/types/book.ts
- Supabase client from src/integrations/supabase/client.ts
