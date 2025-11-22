import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheeziousLogo } from '@/components/icons/CheeziousLogo';
import { LogIn } from 'lucide-react';

export default function Home() {
  // Redirect immediately to the default branch page
  redirect('/branch/rssu');

  // This part of the component will not be rendered due to the redirect,
  // but it's kept here as a fallback and for structural reference.
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <CheeziousLogo className="h-24 w-auto text-primary" />
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Welcome to Cheezious Connect
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Your seamless digital dining experience starts here. Redirecting to our branch...
        </p>
      </div>
      
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href="/cashier">
            <LogIn className="mr-2 h-4 w-4" />
            Cashier
          </Link>
        </Button>
        <span className='mx-2'>|</span>
         <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href="/kds">
            <LogIn className="mr-2 h-4 w-4" />
            Kitchen
          </Link>
        </Button>
        <p className="mt-2">&copy; {new Date().getFullYear()} Cheezious Connect. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
