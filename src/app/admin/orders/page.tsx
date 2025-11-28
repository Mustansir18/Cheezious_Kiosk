
"use client";
import type { Order } from "@/lib/types";
import { OrderCard } from "@/components/cashier/OrderCard";
import { Clock, CookingPot, CheckCircle, Loader, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useOrders } from "@/context/OrderContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OrderReceipt } from "@/components/cashier/OrderReceipt";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useMemo, useState, useEffect } from "react";

function OrderInfoModal({ order }: { order: Order }) {
    const [origin, setOrigin] = useState('');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    const qrCodeUrl = origin ? `${origin}/order-status?orderNumber=${order.orderNumber}` : '';

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 print-hidden">
                    <Info className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <OrderReceipt order={order} qrCodeUrl={qrCodeUrl}/>
                </div>
            </DialogContent>
        </Dialog>
    )
}


export default function AdminOrdersPage() {
  const { orders, isLoading, updateOrderStatus } = useOrders();
  const { user } = useAuth();
  
  const filteredOrders = useMemo(() => {
    if (!user || user.role === 'root') {
      return orders;
    }
    return orders.filter(order => order.branchId === user.branchId);
  }, [orders, user]);

  const runningOrders = filteredOrders.filter(order => order.status === "Pending" || order.status === "Preparing");
  const readyOrders = filteredOrders.filter(order => order.status === "Ready");
  const completedOrders = filteredOrders.filter(order => order.status === "Completed");

  if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading Orders...</p>
        </div>
      )
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">Live view of all running, ready, and completed orders for your branch.</p>
      </header>

      <div className="space-y-12">
        <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Running Orders</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => <OrderCard.Skeleton key={i} />)
                ) : runningOrders && runningOrders.length > 0 ? (
                runningOrders.map((order) => <OrderCard key={order.id} order={order} workflow="cashier" onUpdateStatus={updateOrderStatus}><OrderInfoModal order={order} /></OrderCard>)
                ) : (
                <Card className="lg:col-span-2 xl:col-span-3 flex flex-col items-center justify-center p-12 text-center">
                    <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="font-headline text-xl font-semibold">No running orders</h3>
                    <p className="text-muted-foreground">New orders will appear here once placed.</p>
                </Card>
                )}
            </div>
        </div>

        <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Ready for Pickup</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <OrderCard.Skeleton key={i} />)
                ) : readyOrders && readyOrders.length > 0 ? (
                readyOrders.map((order) => <OrderCard key={order.id} order={order} workflow="cashier" onUpdateStatus={updateOrderStatus}><OrderInfoModal order={order} /></OrderCard>)
                ) : (
                <Card className="lg:col-span-2 xl:col-span-3 flex flex-col items-center justify-center p-12 text-center">
                    <CookingPot className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="font-headline text-xl font-semibold">No orders are ready</h3>
                    <p className="text-muted-foreground">Orders marked as "Ready" will appear here.</p>
                </Card>
                )}
            </div>
        </div>
        
        <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Completed Orders</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 1 }).map((_, i) => <OrderCard.Skeleton key={i} />)
                ) : completedOrders && completedOrders.length > 0 ? (
                completedOrders.map((order) => <OrderCard key={order.id} order={order} workflow="cashier" onUpdateStatus={updateOrderStatus}><OrderInfoModal order={order} /></OrderCard>)
                ) : (
                <Card className="lg:col-span-2 xl:col-span-3 flex flex-col items-center justify-center p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="font-headline text-xl font-semibold">No completed orders yet</h3>
                    <p className="text-muted-foreground">Completed orders for the day will be shown here.</p>
                </Card>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
