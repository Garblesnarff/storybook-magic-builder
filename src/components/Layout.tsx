
import React from 'react';
// Fix the import statement for Navigation
import Navigation from './Navigation';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string; // For styling the <main> content area
  rootClassName?: string; // For styling the root div
  fullWidth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className,
  rootClassName, // New prop
  fullWidth = false 
}) => {
  return (
    // Apply rootClassName here, fallback to default bg-background if not provided
    <div className={cn("min-h-screen", rootClassName ? rootClassName : "bg-background")}>
      <Navigation />
      <main
        className={cn(
          // Ensure main doesn't have a background that hides the root's background
          "pl-16 min-h-screen",
          fullWidth ? "px-0" : "px-4 md:px-8 lg:px-12 max-w-7xl mx-auto",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
};
