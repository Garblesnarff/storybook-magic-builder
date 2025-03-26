
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Palette, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'My Books', path: '/books' },
    { icon: Palette, label: 'Editor', path: '/editor' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto md:left-auto md:w-16 h-16 md:h-full bg-white/90 backdrop-blur-md border-t md:border-l md:border-t-0 border-gray-200 z-50">
      <ul className="flex md:flex-col items-center justify-around h-full px-2 md:py-8">
        {navItems.map((item) => (
          <li key={item.path} className="relative">
            <Link
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors duration-200",
                location.pathname === item.path && "text-primary"
              )}
            >
              <item.icon className="w-5 h-5 md:w-6 md:h-6 mb-1" />
              <span className="text-[10px] md:text-xs">{item.label}</span>
              {location.pathname === item.path && (
                <span className="absolute -bottom-1 md:bottom-auto md:-right-1 h-1 w-8 md:h-8 md:w-1 bg-primary rounded-full animate-pulse-slow" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
