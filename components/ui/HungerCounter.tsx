'use client';

import { useEffect, useState } from 'react';

export function HungerCounter() {
  const [count, setCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Function to calculate the estimated deaths so far today
    const updateCount = () => {
      const now = new Date();
      // Get the start of the current day (midnight)
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Calculate seconds elapsed since midnight
      const secondsElapsed = (now.getTime() - startOfDay.getTime()) / 1000;
      
      // 7000 deaths per 24 hours (86400 seconds)
      const deathsPerSecond = 7000 / 86400;
      
      // Calculate current estimated deaths
      setCount(Math.floor(secondsElapsed * deathsPerSecond));
    };

    // Run immediately
    updateCount();

    // Update every second
    const interval = setInterval(updateCount, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Avoid hydration mismatch by rendering a placeholder until client-side JS kicks in
  if (!isClient) return <span>...</span>;

  // Render formatted number (e.g. 1,234)
  return <span>{count.toLocaleString()}</span>;
}
