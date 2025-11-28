
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RecallOrderPage() {
  const [orderId, setOrderId] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleRecallOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      router.push(`/order-status?orderId=${orderId.trim()}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Order ID Required',
        description: 'Please enter an order ID to recall an order.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleRecallOrder}>
          <CardHeader className="text-center">
            <QrCode className="mx-auto h-16 w-auto text-primary" />
            <CardTitle className="font-headline text-2xl">Recall Your Order</CardTitle>
            <CardDescription>Enter your Order ID below to check its status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter the ID from your receipt"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Find Order
            </Button>
             <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/')}>
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
