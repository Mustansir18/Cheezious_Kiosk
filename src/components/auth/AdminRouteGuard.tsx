
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader } from 'lucide-react';

const ROOT_ONLY_PAGES = [
    '/admin/settings',
    '/admin/users',
    '/admin/menu',
    '/admin/deals',
];

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until authentication state is loaded
    }

    if (!user) {
      // Not logged in, redirect to login page immediately.
      router.replace('/login');
      return;
    } 
    
    const isRootOrAdmin = user.role === 'root' || user.role === 'admin';
    if (!isRootOrAdmin) {
      // Logged in, but not an admin or root, redirect to their default page or home.
      router.replace(user.role === 'cashier' ? '/cashier' : '/'); 
      return;
    }
    
    // If user is a branch admin (not root) and tries to access a root-only page
    if (user.role === 'admin' && ROOT_ONLY_PAGES.includes(pathname)) {
      router.replace('/admin/orders'); // Redirect to their allowed dashboard
      return;
    }
  }, [user, isLoading, router, pathname]);

  // While loading, or if the user is not authenticated/authorized, show a loading screen.
  // This prevents any child content from rendering until the check is complete.
  const isAuthorized = user && (user.role === 'root' || (user.role === 'admin' && !ROOT_ONLY_PAGES.includes(pathname)));

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
