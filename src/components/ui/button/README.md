
# Button Component

This directory contains the Button component, split into smaller files for better maintainability.

## Files

- `button.tsx`: Main Button component implementation
- `variants.ts`: Button styling variants using class-variance-authority
- `index.ts`: Barrel file that re-exports the Button component and its variants

## Usage

Import the Button component as you would normally:

```tsx
import { Button } from "@/components/ui/button"
```

## Dependencies

- React
- class-variance-authority
- @radix-ui/react-slot
- @/lib/utils
