import * as React from 'react';

export function CheeziousLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-label="Cheezious Logo"
      {...props}
    >
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.8 }} />
        </linearGradient>
      </defs>
      
      {/* Pizza Slice */}
      <path 
        d="M 20 20 C 40 10, 70 15, 80 30 L 50 80 Z" 
        fill="url(#gold-gradient)" 
        stroke="#A0522D" 
        strokeWidth="2"
      />
      <circle cx="35" cy="40" r="3" fill="#A0522D" />
      <circle cx="55" cy="35" r="4" fill="#A0522D" />
      <circle cx="65" cy="50" r="3" fill="#A0522D" />

      {/* Burger */}
      <path 
        d="M 25 60 C 20 70, 30 85, 50 85 S 80 80, 75 70 L 65 55 L 35 55 Z" 
        fill="url(#gold-gradient)" 
        stroke="#8B4513" 
        strokeWidth="2"
      />
      <path d="M 30 65 H 70" stroke="#228B22" strokeWidth="3" />
      <path d="M 32 60 H 68" stroke="#FF6347" strokeWidth="2" />
      
      {/* Drink */}
      <path 
        d="M 65 40 L 70 80 H 90 L 85 40 Z" 
        fill="url(#gold-gradient)"
        stroke="#8B4513"
        strokeWidth="2"
      />
      <line x1="85" y1="40" x2="90" y2="20" stroke="#8B4513" strokeWidth="3" />

      {/* Swooshes */}
      <path d="M 20 85 C 30 95, 50 95, 60 80" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M 80 85 C 70 95, 50 98, 40 85" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
