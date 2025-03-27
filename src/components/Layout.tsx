
import React from 'react';
import { Navigation } from './Navigation';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className,
  fullWidth = false 
}) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main
        className={cn(
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
