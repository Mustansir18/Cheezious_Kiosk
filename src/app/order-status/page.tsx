"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Tone from "tone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, Loader } from "lucide-react";
import type { PlacedOrder } from "@/lib/types";

export default function OrderStatusPage() {
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [status, setStatus] = useState<"preparing" | "ready">("preparing");
  const router = useRouter();

  useEffect(() => {
    try {
      const storedOrder = sessionStorage.getItem("placedOrder");
      if (storedOrder) {
        setOrder(JSON.parse(storedOrder));
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error("Could not load order from session storage", error);
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => {
        setStatus("ready");
        if (typeof window !== "undefined") {
          const synth = new Tone.Synth().toDestination();
          const now = Tone.now();
          synth.triggerAttackRelease("E5", "16n", now);
          synth.triggerAttackRelease("G5", "16n", now + 0.1);
          synth.triggerAttackRelease("C6", "8n", now + 0.2);
        }
      }, 8000); // 8-second delay to simulate preparation

      return () => clearTimeout(timer);
    }
  }, [order]);

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader>
          {status === "preparing" ? (
            <>
              <Loader className="mx-auto h-16 w-16 animate-spin text-primary" />
              <CardTitle className="font-headline text-2xl mt-4">
                Your order is being prepared!
              </CardTitle>
            </>
          ) : (
            <>
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <CardTitle className="font-headline text-2xl mt-4">
                Order Ready for Pickup!
              </CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Order <span className="font-bold text-primary">#{order.orderNumber}</span>
          </p>
          <p className="text-muted-foreground mt-2">
            {status === "preparing"
              ? "We'll notify you with a sound when it's ready."
              : `Please collect your ${order.orderType} order at the counter.`}
          </p>
          
          <div className="mt-6 text-left border rounded-lg p-4 bg-muted/20">
            <h3 className="font-headline font-semibold mb-2">Order Summary</h3>
            <p><strong>Branch:</strong> {order.branchName}</p>
            <p><strong>Total:</strong> <span className="font-bold">${order.total.toFixed(2)}</span></p>
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
