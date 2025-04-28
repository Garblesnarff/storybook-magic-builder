
import React, { useState } from 'react';

export function useContainerDimensions(ref: React.RefObject<HTMLDivElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions when the ref changes or the component mounts/unmounts
  const updateDimensions = () => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  };

  return { dimensions, updateDimensions };
}
