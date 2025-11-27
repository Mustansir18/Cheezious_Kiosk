import Image from 'next/image';
import * as React from 'react';

export function CheeziousLogo(props: { className?: string }) {
  return (
    <div className={props.className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Image
        src="https://cheezious.com/images/logo.png"
        alt="Cheezious Logo"
        fill
        style={{ objectFit: 'contain' }}
        unoptimized
      />
    </div>
  );
}
