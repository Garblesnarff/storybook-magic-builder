
# Image Storage

This directory contains modules for interacting with Supabase Storage for image operations.

## Files

- `uploadImage.ts`: Handles uploading images to Supabase storage with validation
- `bookImages.ts`: Functions for managing book-level image operations
- `pageImages.ts`: Functions for managing page-level image operations
- `cleanup.ts`: Utilities for cleaning up orphaned or unused images
- `index.ts`: Re-exports all image storage functions for easy importing

## Usage

```typescript
import { uploadImage, deleteBookImages, deletePageImages, cleanupOrphanedImages } from '@/services/supabase/storage/imageStorage';

// Upload an image
const imageUrl = await uploadImage(imageDataUrl, bookId, pageId);

// Delete images for a page
await deletePageImages(bookId, pageId);

// Delete all images for a book
await deleteBookImages(bookId);

// Clean up any orphaned images
await cleanupOrphanedImages(bookId, validPageIds);
```

## Dependencies

- Supabase storage client
- Image verification utilities
- Toast notifications via sonner
