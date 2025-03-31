
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Palette, Settings, Home, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Navigation = () => {
  // We need to make sure this component is only rendered inside Router context
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'My Books', path: '/books' },
    { icon: Palette, label: 'Editor', path: '/editor' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="fixed top-0 left-0 bottom-0 w-16 md:w-16 h-screen bg-white/90 backdrop-blur-md border-r border-gray-200 z-50">
      <ul className="flex flex-col items-center justify-start h-full pt-8 px-2">
        {navItems.map((item) => (
          <li key={item.path} className="relative mb-6">
            <Link
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors duration-200",
                location.pathname === item.path && "text-primary"
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
              {location.pathname === item.path && (
                <span className="absolute -right-1 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-full animate-pulse-slow" />
              )}
            </Link>
          </li>
        ))}
        
        {user && (
          <li className="mt-auto mb-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleSignOut} 
                    className="flex flex-col items-center justify-center text-gray-500 hover:text-destructive transition-colors duration-200"
                  >
                    <LogOut className="w-6 h-6 mb-1" />
                    <span className="text-xs">Logout</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </li>
        )}
      </ul>
    </nav>
  );
};
