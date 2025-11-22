"use client";
import type { Order } from "@/lib/types";
import { OrderCard } from "@/components/cashier/OrderCard";
import { BarChart, Clock, CookingPot, CheckCircle, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/context/OrderContext";

export default function CashierPage() {
  const { orders, isLoading, updateOrderStatus } = useOrders();

  const activeOrders = orders.filter(order => order.status === "Ready");
  const completedOrders = orders.filter(order => order.status === "Completed");

  const totalSales = completedOrders?.reduce((acc, order) => acc + order.totalAmount, 0) ?? 0;
  
  const summaryCards = [
    { title: "Orders Ready for Pickup", value: activeOrders?.length ?? 0, icon: CookingPot },
    { title: "Completed Today", value: completedOrders?.length ?? 0, icon: CheckCircle },
    { title: "Total Sales", value: `RS ${totalSales.toFixed(2)}`, icon: BarChart },
  ];

  if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading Dashboard...</p>
        </div>
      )
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Cashier Dashboard</h1>
        <p className="text-muted-foreground">Manage ready and completed orders.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {summaryCards.map(card => (
            <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {isLoading ? <Skeleton className="h-8 w-24" /> : card.value}
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <h2 className="font-headline text-2xl font-bold mb-4">Ready for Pickup</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <OrderCard.Skeleton key={i} />)
        ) : activeOrders && activeOrders.length > 0 ? (
          activeOrders.map((order) => <OrderCard key={order.id} order={order} workflow="cashier" onUpdateStatus={updateOrderStatus} />)
        ) : (
          <Card className="lg:col-span-2 xl:col-span-3 flex flex-col items-center justify-center p-12 text-center">
             <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-headline text-xl font-semibold">No orders are ready</h3>
            <p className="text-muted-foreground">Orders marked as "Ready" by the kitchen will appear here.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
