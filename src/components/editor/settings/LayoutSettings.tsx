import React, { useState, useEffect } from 'react';
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
  // Keep local state to prevent UI flickering
  const [selectedLayout, setSelectedLayout] = useState<PageLayout>(
    currentPageData.layout || 'text-left-image-right'
  );
  
  // Update local state when page changes
  useEffect(() => {
    if (currentPageData.layout) {
      setSelectedLayout(currentPageData.layout);
    }
  }, [currentPageData.id, currentPageData.layout]);
  
  const handleLayoutSelect = (layout: PageLayout) => {
    // Update local state immediately
    setSelectedLayout(layout);
    // Then update in database
    handleLayoutChange(layout);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="layout">Page Layout</Label>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(layoutNames).map(([layout, name]) => (
          <div
            key={layout}
            className={`p-3 rounded-md border-2 cursor-pointer text-center text-sm ${
              selectedLayout === layout ? 'border-primary bg-primary/5' : 'border-gray-200'
            }`}
            onClick={() => handleLayoutSelect(layout as PageLayout)}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
};
