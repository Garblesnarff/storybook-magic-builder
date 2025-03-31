
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const EditorLoading: React.FC = () => {
  return (
    <div className="flex flex-col space-y-4 p-8 w-full max-w-5xl mx-auto">
      <Skeleton className="h-12 w-3/4" />
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
};
