
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ShoppingBag, Loader } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function ModeSelectionPage() {
  const { settings, isLoading } = useSettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  
  const mode = searchParams.get("mode");
  const tableId = searchParams.get("tableId");
  const floorId = searchParams.get("floorId");
  const branchId = params.branchId as string;

  const branch = settings.branches.find((b) => b.id === branchId);

  useEffect(() => {
    if (!isLoading && branch) {
      // Direct redirection for table-specific QR code
      if (mode === "Dine-In" && tableId && floorId && branch.dineInEnabled) {
        router.replace(`/branch/${branchId}/menu?mode=Dine-In&tableId=${tableId}&floorId=${floorId}`);
      } 
      // Direct redirection for general Take Away QR code
      else if (mode === "Take-Away" && branch.takeAwayEnabled) {
        router.replace(`/branch/${branchId}/menu?mode=Take-Away`);
      }
      // Do nothing if no mode is specified, allowing the user to choose.
    }
  }, [mode, tableId, floorId, isLoading, branch, branchId, router]);

  if (isLoading || (mode && ( (mode === "Dine-In" && tableId && floorId) || mode === "Take-Away") )) {
    return (
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-12 text-center h-[calc(100vh-4rem)]">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Redirecting to your order...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-12 text-center h-[calc(100vh-4rem)]">
      <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
        Welcome to {branch?.name || 'Cheezious'}!
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        How would you like to enjoy your meal today?
      </p>

      <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-8 md:grid-cols-2">
        {branch?.dineInEnabled && (
          <Link href={`/branch/${branchId}/table-selection`}>
            <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <Utensils className="mx-auto h-16 w-16 text-primary" />
              </CardHeader>
              <CardContent>
                <CardTitle className="font-headline text-2xl">Dine-In</CardTitle>
                <p className="mt-2 text-muted-foreground">
                  Enjoy your meal in our cozy restaurant.
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        {branch?.takeAwayEnabled && (
          <Link href={`/branch/${branchId}/menu?mode=Take-Away`}>
            <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <ShoppingBag className="mx-auto h-16 w-16 text-primary" />
              </CardHeader>
              <CardContent>
                <CardTitle className="font-headline text-2xl">Take Away</CardTitle>
                <p className="mt-2 text-muted-foreground">
                  Grab your favorites to enjoy on the go.
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

       {(!branch?.dineInEnabled && !branch?.takeAwayEnabled) && (
            <div className="mt-10 text-center text-muted-foreground">
                <p>This branch is not accepting orders at the moment.</p>
                <p>Please check back later.</p>
            </div>
       )}
    </div>
  );
}
