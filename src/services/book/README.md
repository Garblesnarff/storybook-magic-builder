
# Book Services

This directory contains service functions related to book operations.

## Files

- `bookCreation.ts`: Functions for creating new books and books from templates
- `bookOperations.ts`: Functions for updating and deleting existing books

## Functions

### bookCreation.ts

- `createBook(title, books)`: Creates a new book with the given title and adds it to the books array
- `createBookFromTemplate(template, books)`: Creates a new book based on a template and adds it to the books array

### bookOperations.ts

- `updateBook(bookToUpdate, books)`: Updates a book in the collection and performs image cleanup
- `deleteBook(id, books)`: Deletes a book and its associated images

## Usage

```typescript
import { createBook, createBookFromTemplate } from '../book/bookCreation';
import { updateBook, deleteBook } from '../book/bookOperations';

// Create a new book
const updatedBooks = await createBook('My New Book', existingBooks);

// Delete a book
const booksAfterDeletion = await deleteBook(bookId, existingBooks);
```

## Dependencies

- UUID generation for creating unique IDs
- Supabase storage services for image cleanup
- Book and BookPage data models
