
import React from 'react';
import { BookPage, PageLayout, layoutNames } from '@/types/book';
import { Label } from '@/components/ui/label';

interface LayoutSettingsProps {
  currentPageData: BookPage;
  handleLayoutChange: (layout: PageLayout) => void;
}

export const LayoutSettings: React.FC<LayoutSettingsProps> = ({
  currentPageData,
  handleLayoutChange
}) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="layout">Page Layout</Label>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(layoutNames).map(([layout, name]) => (
          <div
            key={layout}
            className={`p-3 rounded-md border-2 cursor-pointer text-center text-sm ${
              currentPageData.layout === layout ? 'border-primary bg-primary/5' : 'border-gray-200'
            }`}
            onClick={() => handleLayoutChange(layout as PageLayout)}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
};
