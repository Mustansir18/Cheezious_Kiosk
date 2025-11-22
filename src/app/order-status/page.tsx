"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Tone from "tone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, Loader, Utensils } from "lucide-react";
import type { Order, PlacedOrder } from "@/lib/types";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function OrderStatusPage() {
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const router = useRouter();
  const { firestore } = useFirebase();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedOrder = sessionStorage.getItem("placedOrder");
      if (storedOrder) {
        const parsed = JSON.parse(storedOrder);
        setPlacedOrder(parsed);
        setOrderId(parsed.orderId); // The orderId was added to PlacedOrder
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error("Could not load order from session storage", error);
      router.replace('/');
    }
  }, [router]);

  const orderDocRef = useMemoFirebase(
    () => (firestore && orderId ? doc(firestore, "orders", orderId) : null),
    [firestore, orderId]
  );
  
  const { data: order, isLoading } = useDoc<Order>(orderDocRef);
  const status = order?.status;

  useEffect(() => {
    if (status === 'Ready') {
      if (typeof window !== "undefined") {
        const synth = new Tone.Synth().toDestination();
        const now = Tone.now();
        synth.triggerAttackRelease("E5", "16n", now);
        synth.triggerAttackRelease("G5", "16n", now + 0.1);
        synth.triggerAttackRelease("C6", "8n", now + 0.2);
      }
    }
  }, [status]);
  
  if (!placedOrder || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your order status...</p>
      </div>
    );
  }

  const isOrderActive = status === 'Pending' || status === 'Preparing';
  const isOrderReady = status === 'Ready';

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader>
          {isOrderActive ? (
            <>
              <Utensils className="mx-auto h-16 w-16 animate-pulse text-primary" />
              <CardTitle className="font-headline text-2xl mt-4">
                Your order is being prepared!
              </CardTitle>
            </>
          ) : (
            <>
              <CheckCircle className={`mx-auto h-16 w-16 ${isOrderReady ? 'text-green-500' : 'text-muted-foreground'}`} />
              <CardTitle className="font-headline text-2xl mt-4">
                {isOrderReady ? 'Order Ready for Pickup!' : 'Order Completed'}
              </CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Order <span className="font-bold text-primary">#{placedOrder.orderNumber}</span>
          </p>
          <p className="text-muted-foreground mt-2">
            {isOrderActive
              ? "We'll notify you with a sound when it's ready."
              : isOrderReady
              ? `Please collect your ${placedOrder.orderType} order at the counter.`
              : 'Thank you for your order!'}
          </p>
          
          <div className="mt-6 text-left border rounded-lg p-4 bg-muted/20">
            <h3 className="font-headline font-semibold mb-2">Order Summary</h3>
            <p><strong>Branch:</strong> {placedOrder.branchName}</p>
            <p><strong>Total:</strong> <span className="font-bold">${placedOrder.total.toFixed(2)}</span></p>
          </div>

        </CardContent>
        <CardFooter>
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Start a New Order
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
