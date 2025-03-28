
# Supabase Services Directory

This directory contains modular services for interacting with Supabase.

### Files

- **bookService.ts**: Handles book-related operations with Supabase including creating, loading, updating, and deleting books. Contains functions such as `saveBookToSupabase`, `loadBookFromSupabase`, `loadBooksFromSupabase`, `createBookInSupabase`, and `deleteBookFromSupabase`.

- **pageService.ts**: Manages page-related operations within books, including adding, updating, deleting, and reordering pages in Supabase. Contains functions such as `addPageToSupabase`, `updatePageInSupabase`, `deletePageFromSupabase`, and `reorderPagesInSupabase`.

- **storageService.ts**: Handles image upload and storage operations in Supabase Storage. Contains functions like `uploadImage`, `deleteBookImages`, and `deletePageImages` for managing image assets related to books and pages.

- **utils.ts**: Provides utility functions for data conversion between the application's data models and Supabase database schema. Contains functions like `bookPageToDatabasePage` and `databasePageToBookPage`.

### Subdirectories

- None at this time.

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

### Notes

- These services replace the previous monolithic supabaseStorage.ts file
- All services maintain backward compatibility with the original API signatures
- When updating these services, ensure that error handling is consistently applied
- Book images are stored in the 'book_images' bucket in Supabase Storage with a path pattern of `{bookId}/{pageId}_{timestamp}.png`
