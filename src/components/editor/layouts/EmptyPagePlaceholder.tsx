
import React from 'react';

export const EmptyPagePlaceholder: React.FC = () => {
  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-gray-50">
      <p>Select a page to edit</p>
    </div>
  );
};
