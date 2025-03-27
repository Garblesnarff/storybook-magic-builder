
# Services Directory

This directory contains service modules that handle core business logic and data operations.

### Files

- **bookOperations.ts**: Core functions for creating, updating, and deleting books. Contains pure functions that don't depend on React state.
- **bookStorage.ts**: Functions for saving and loading books from localStorage, with error handling and optimization for large books.
- **pageOperations.ts**: Functions for managing book pages, including adding, updating, deleting, and reordering pages within books.
- **pdfExport.ts**: Handles PDF generation and export of books using jsPDF, including layout processing and image handling.

### Dependencies

- uuid: For generating unique IDs
- jspdf: For PDF generation
- Book and BookPage types from types/book.ts

### Usage Notes

- These services are designed to be used by React hooks but contain pure logic that could be used elsewhere
- All functions that modify books return new book arrays rather than mutating existing ones
- Storage operations are handled asynchronously with setTimeout to avoid blocking the UI

### Best Practices

- Keep these functions pure and free from React dependencies
- Ensure error handling for all external operations (localStorage, image processing)
- Return new objects/arrays rather than mutating state
