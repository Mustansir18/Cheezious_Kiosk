import * as React from 'react';

export function CheeziousLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
        viewBox="0 0 1024 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Cheezious Logo"
        {...props}
    >
        <circle cx="512" cy="512" r="462" fill="currentColor" />
        <circle cx="512" cy="512" r="384" fill="white" />
        <path
            d="M512 256C369.89 256 256 369.89 256 512C256 654.11 369.89 768 512 768C654.11 768 768 654.11 768 512"
            stroke="currentColor"
            strokeWidth="80"
            strokeLinecap="round"
        />
        <circle cx="512" cy="512" r="128" fill="currentColor" />
    </svg>
  );
}
