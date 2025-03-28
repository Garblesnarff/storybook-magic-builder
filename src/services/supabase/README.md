
# Supabase Services Directory

This directory contains modular services for interacting with Supabase.

### Files

- **bookService.ts**: Functions for creating, loading, updating, and deleting books in Supabase.
- **pageService.ts**: Functions for adding, updating, deleting, and reordering book pages in Supabase.
- **storageService.ts**: Functions for uploading and managing images in Supabase Storage.
- **utils.ts**: Utility functions for data conversion between our app models and Supabase database schema.

### Dependencies

- @supabase/supabase-js: For Supabase client interaction
- Book and BookPage types from types/book.ts

### Usage Notes

- These services replace the previous monolithic supabaseStorage.ts file
- All functions maintain the same API signatures for drop-in replacement
- Services handle proper error reporting via toast notifications
