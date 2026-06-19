'use client';

import { useState, useEffect } from 'react';

interface TextRotatorProps {
  texts: string[];
  intervalMs?: number;
  className?: string;
}

export function TextRotator({ texts, intervalMs = 3000, className = '' }: TextRotatorProps) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (texts.length <= 1) return;

    const timeout = setInterval(() => {
      setFade(false); // trigger fade out
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length);
        setFade(true); // trigger fade in
      }, 500); // Wait 500ms for fade out animation before changing text
    }, intervalMs);

    return () => clearInterval(timeout);
  }, [texts.length, intervalMs]);

  if (!texts || texts.length === 0) return null;

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
        opacity: fade ? 1 : 0,
        transform: fade ? 'translateY(0)' : 'translateY(10px)',
      }}
    >
      {texts[index]}
    </span>
  );
}
