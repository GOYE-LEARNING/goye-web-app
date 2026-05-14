import { useState, useEffect } from 'react';

const useWindowWidth = () => {
  // Initialize with undefined or a default value
  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Now it's safe to access window
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Set initial width
    setWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

export default useWindowWidth;