
"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as Tone from "tone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, Loader, Utensils, Printer } from "lucide-react";
import type { Order } from "@/lib/types";
import { useOrders } from "@/context/OrderContext";
import { useSettings } from "@/context/SettingsContext";
import { OrderReceipt } from "@/components/cashier/OrderReceipt";

const IDLE_TIMEOUT_SECONDS = 30; // 30 seconds

export default function OrderStatusPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders, isLoading: isOrdersLoading } = useOrders();
  const { settings, isLoading: isSettingsLoading } = useSettings();
  const printTriggered = useRef(false);
  const idleTimer = useRef<NodeJS.Timeout>();

  const orderNumberFromUrl = searchParams.get('orderNumber');

  const resetToHome = useCallback(() => {
    sessionStorage.removeItem("placedOrder"); // Clear this to prevent re-triggering logic
    router.push("/");
  }, [router]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) {
        clearTimeout(idleTimer.current);
    }
    idleTimer.current = setTimeout(resetToHome, IDLE_TIMEOUT_SECONDS * 1000);
  },[resetToHome]);
  
  const [justPlacedOrder, setJustPlacedOrder] = useState(false);

  useEffect(() => {
      setIsClient(true);
      // Check if we just arrived from the checkout page
      const storedOrderInfo = sessionStorage.getItem("placedOrder");
      if (storedOrderInfo) {
        try {
          const parsed = JSON.parse(storedOrderInfo);
          if (parsed.orderNumber === orderNumberFromUrl) {
            setJustPlacedOrder(true);
          }
        } catch (e) {
          console.error("Could not parse placedOrder from session storage", e);
        }
      }
  }, [orderNumberFromUrl]);


  const order: Order | undefined = useMemo(() => {
    if (!orderNumberFromUrl) return undefined;
    return orders.find(o => o.orderNumber === orderNumberFromUrl);
  }, [orders, orderNumberFromUrl]);

  const status = order?.status;
  const isLoading = isOrdersLoading || isSettingsLoading;

  const qrCodeUrl = useMemo(() => {
    if (isClient && order) {
      return `${window.location.origin}/order-status?orderNumber=${order.orderNumber}`;
    }
    return '';
  }, [isClient, order]);

  const handlePrint = useCallback(() => {
    resetIdleTimer();
    if (!order) return;
    const printableArea = document.getElementById(`printable-receipt-${order.id}`);
    if (!printableArea) return;

    const printContainer = document.createElement('div');
    printContainer.id = 'printable-area';
    printContainer.appendChild(printableArea.cloneNode(true));
    document.body.appendChild(printContainer);
    
    document.body.classList.add('printing-active');
    window.print();
    
    setTimeout(() => {
      if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
      }
      document.body.classList.remove('printing-active');
    }, 500);
  }, [order, resetIdleTimer]);
  
  useEffect(() => {
    if (!isLoading && order && settings.autoPrintReceipts && !printTriggered.current && justPlacedOrder) {
        printTriggered.current = true;
        handlePrint();
        // Clear the flag from session storage after printing
        sessionStorage.removeItem("placedOrder");
    }
  }, [isLoading, order, settings.autoPrintReceipts, handlePrint, justPlacedOrder]);


  useEffect(() => {
    if (status === 'Ready') {
      try {
        if (typeof window !== "undefined") {
          const synth = new Tone.Synth().toDestination();
          const now = Tone.now();
          synth.triggerAttackRelease("E5", "16n", now);
          synth.triggerAttackRelease("G5", "16n", now + 0.1);
          synth.triggerAttackRelease("C6", "8n", now + 0.2);
        }
      } catch (e) {
          console.error("Could not play sound", e)
      }
    }
  }, [status]);
  
  useEffect(() => {
      // Only set up idle timer if we came from checkout
      if(!justPlacedOrder) return;

      resetIdleTimer();
      const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetIdleTimer));

      return () => {
          if (idleTimer.current) {
              clearTimeout(idleTimer.current);
          }
          events.forEach(event => window.removeEventListener(event, resetIdleTimer));
      };
  }, [resetIdleTimer, justPlacedOrder]);

  if (!isClient || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your order status...</p>
      </div>
    );
  }

  if (!order) {
    return (
       <div className="flex h-screen items-center justify-center text-center">
        <div>
            <h1 className="text-xl font-bold">Order Not Found</h1>
            <p className="text-muted-foreground">Could not find details for order number "{orderNumberFromUrl}".</p>
            <Button onClick={resetToHome} className="mt-4">New Order</Button>
        </div>
       </div>
    );
  }


  const isOrderActive = status === 'Pending' || status === 'Preparing';
  const isOrderReady = status === 'Ready';
  
  const branchName = settings.branches.find(b => b.id === order.branchId)?.name || order.branchId;
  const tableName = settings.tables.find(t => t.id === order.tableId)?.name;

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
            Order <span className="font-bold text-primary">#{order.orderNumber}</span>
          </p>
          <p className="text-muted-foreground mt-2">
            {isOrderActive
              ? "We'll notify you with a sound when it's ready."
              : isOrderReady
              ? `Please collect your ${order.orderType} order at the counter.`
              : 'Thank you for your order!'}
          </p>
          
          <div className="mt-6 text-left border rounded-lg p-4 bg-muted/20">
            <h3 className="font-headline font-semibold mb-2">Order Summary</h3>
            <p><strong>Branch:</strong> {branchName}</p>
            {tableName && <p><strong>Table:</strong> {tableName}</p>}
            <p><strong>Total:</strong> <span className="font-bold">RS {order.totalAmount.toFixed(2)}</span></p>
          </div>
        </CardContent>
        <CardFooter className="grid gap-2 grid-cols-2">
          <Button
            size="lg"
            variant="outline"
            onClick={handlePrint}
            className="w-full"
          >
            <Printer className="mr-2 h-4 w-4" /> Print Receipt
          </Button>
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              if (idleTimer.current) clearTimeout(idleTimer.current);
              resetToHome();
            }}
          >
            New Order
          </Button>
        </CardFooter>
      </Card>
      
      {/* Hidden receipt for printing */}
      <div className="hidden">
          <div id={`printable-receipt-${order.id}`}>
              <OrderReceipt order={order} qrCodeUrl={qrCodeUrl}/>
          </div>
      </div>
    </div>
  );
}
