
# Pages Directory

This directory contains the main pages of the application.

### Files

- `Index.tsx`: Landing page/entry point for the application.
- `HomePage.tsx`: Main dashboard page after user login.
- `BooksPage.tsx`: Page for displaying and managing user's books.
- `ComingSoon.tsx`: Placeholder page for features under development.
- `EditorPage.tsx`: Book editor page (currently replaced with ComingSoon).
- `SettingsPage.tsx`: User settings and app configuration page.
- `NotFound.tsx`: 404 page for undefined routes.

### Instructions

- All pages are wrapped in the `Layout` component for consistent styling.
- Pages are connected to routes in `App.tsx`.
- When adding a new page, make sure to add its route to `App.tsx`.

### Dependencies

- React Router DOM for routing
- Layout component for consistent page structure
