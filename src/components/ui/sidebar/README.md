
# Sidebar Component

This directory contains the sidebar component, split into smaller files for better maintainability.

## Files

- `context.tsx`: Contains the SidebarContext, SidebarProvider, and useSidebar hook for state management
- `sidebar.tsx`: Main Sidebar component implementation
- `trigger.tsx`: SidebarTrigger and SidebarRail components for toggling the sidebar
- `sections.tsx`: Basic structural components like SidebarHeader, SidebarContent, SidebarFooter
- `group.tsx`: Components for grouping sidebar content
- `menu.tsx`: Components for creating sidebar menus
- `menu-sub.tsx`: Components for nested menu items
- `index.tsx`: Barrel file that re-exports all components for convenient imports

## Usage

Import the sidebar components from this directory:

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar"
```

See the shadcn documentation for usage examples.

## Dependencies

- React
- class-variance-authority
- lucide-react
- @radix-ui/react-slot
- @radix-ui/react-tooltip
- @/components/ui/button
- @/components/ui/input
- @/components/ui/separator
- @/components/ui/sheet
- @/components/ui/skeleton
- @/components/ui/tooltip
- @/lib/utils
- @/hooks/use-mobile
