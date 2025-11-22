import * as React from 'react';

export function CheeziousLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-label="Cheezious Logo"
      {...props}
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="2" />

      {/* Pizza Slice */}
      <path 
        d="M 50 15 L 75 68 L 25 68 Z" 
        fill="#FFFFFF" 
        stroke="#E6A23C"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Pepperonis */}
      <circle cx="42" cy="55" r="5" fill="#D9534F" />
      <circle cx="58" cy="55" r="5" fill="#D9534F" />
      <circle cx="50" cy="35" r="6" fill="#D9534F" />
      
      {/* Burger Layers */}
      {/* Bottom Bun */}
      <path d="M 30 85 H 70 C 75 85 75 80 70 80 H 30 C 25 80 25 85 30 85 Z" fill="#D2A679"/>
      {/* Patty */}
      <rect x="32" y="75" width="36" height="5" rx="2" fill="#8B4513"/>
      {/* Cheese */}
      <path d="M 31 75 L 69 75 L 67 72 H 33 Z" fill="#FFD700"/>
       {/* Top Bun */}
      <path d="M 50 60 C 65 60 72 72 70 72 H 30 C 28 72 35 60 50 60 Z" fill="#F0C47F"/>
       {/* Sesame seeds */}
      <circle cx="45" cy="66" r="1" fill="#FFFFFF" />
      <circle cx="55" cy="66" r="1" fill="#FFFFFF" />
      <circle cx="50" cy="62" r="1" fill="#FFFFFF" />
      
      <text
        x="50%"
        y="92%"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="12"
        fill="hsl(var(--primary-foreground))"
        fontFamily="Poppins, sans-serif"
      >
        CHEEZIOUS
      </text>

    </svg>
  );
}
