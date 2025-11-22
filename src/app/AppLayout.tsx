
'use client';

import { CartProvider } from '@/context/CartContext';
import { DealsProvider } from '@/context/DealsContext';
import { MenuProvider } from '@/context/MenuContext';
import { OrderProvider } from '@/context/OrderContext';
import { SettingsProvider } from '@/context/SettingsContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow">
        <SettingsProvider>
          <DealsProvider>
            <MenuProvider>
              <OrderProvider>
                <CartProvider>{children}</CartProvider>
              </OrderProvider>
            </MenuProvider>
          </DealsProvider>
        </SettingsProvider>
      </main>
    </div>
  );
}
