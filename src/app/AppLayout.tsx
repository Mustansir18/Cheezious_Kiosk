'use client';

import { CartProvider } from '@/context/CartContext';
import { OrderProvider } from '@/context/OrderContext';
import { SettingsProvider } from '@/context/SettingsContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow">
        <SettingsProvider>
            <OrderProvider>
            <CartProvider>{children}</CartProvider>
            </OrderProvider>
        </SettingsProvider>
      </main>
    </div>
  );
}
