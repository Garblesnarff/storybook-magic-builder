
# Menubar Component

This directory contains the menubar component, split into smaller files for better maintainability.

## Files

- `menubar.tsx`: Main Menubar component implementation
- `content.tsx`: Components for creating menubar content
- `items.tsx`: Components for regular, checkbox, and radio menubar items
- `sub.tsx`: Components for submenus and subtriggers
- `index.tsx`: Barrel file that re-exports all components for convenient imports

## Usage

Import the menubar components from this directory:

```tsx
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarPortal,
  MenubarGroup,
  MenubarShortcut,
} from "@/components/ui/menubar"
```

## Dependencies

- React
- @radix-ui/react-menubar
- class-variance-authority
- lucide-react
- @/lib/utils
