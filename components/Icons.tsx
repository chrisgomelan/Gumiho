import React from "react";

interface IconProps {
  className?: string;
}

/**
 * Gumiho (구미호) Mystical Fox Logo
 * Distinct mythical Korean fox silhouette featuring high pointed ears,
 * graceful cheek contours, sleek slanted eyes, and the mystical forehead pearl.
 */
export function GumihoLogo({ className = "size-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Outer fox head and pointed ears */}
      <path d="M3.5 4.5c.8 4.2-.2 8.2 2.8 11.8L12 21.5l5.7-5.2c3-3.6 2-7.6 2.8-11.8L15 9.5 12 7.5 9 9.5 3.5 4.5z" />
      {/* Inner ear lines */}
      <path d="M6.8 7.8l2 3" />
      <path d="M17.2 7.8l-2 3" />
      {/* Slanted fox eyes */}
      <path d="M7.8 13.5c1.2-.7 2.2-.2 2.8.3" />
      <path d="M16.2 13.5c-1.2-.7-2.2-.2-2.8.3" />
      {/* Mystical Fox Pearl (Yeowoo-guseul) */}
      <circle cx="12" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
      {/* Snout tip */}
      <path d="M11.2 18h1.6" />
    </svg>
  );
}
