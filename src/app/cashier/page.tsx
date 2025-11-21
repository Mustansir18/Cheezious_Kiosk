import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor } from 'lucide-react';

export default function CashierPage() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
            <Monitor className="mx-auto h-16 w-16 text-primary" />
          <CardTitle className="font-headline text-3xl mt-4">Cashier Screen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            This is a placeholder for the cashier's order management interface.
          </p>
          <div className="mt-6 rounded-lg border-2 border-dashed p-8">
            <p className="font-semibold">New orders from Cheezious Connect will appear here in real-time.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
