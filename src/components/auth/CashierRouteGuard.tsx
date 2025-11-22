
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader } from 'lucide-react';

export function CashierRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in, redirect to login page
        router.push('/login');
      } else if (user.role !== 'cashier' && user.role !== 'admin') {
        // Logged in, but not authorized, redirect to home
        router.push('/'); 
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (user.role !== 'cashier' && user.role !== 'admin')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
