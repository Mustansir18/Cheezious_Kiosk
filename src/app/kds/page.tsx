"use client";
import { useFirebase, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import type { Order } from "@/lib/types";
import { OrderCard } from "@/components/cashier/OrderCard";
import { Clock, Loader } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function KdsPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const kitchenOrdersQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, "orders"),
            where("status", "in", ["Pending", "Preparing"]),
            orderBy("orderDate", "asc")
          )
        : null,
    [firestore, user]
  );

  const { data: kitchenOrders, isLoading: isLoadingOrders } = useCollection<Order>(kitchenOrdersQuery);
  
  const isLoading = isUserLoading || isLoadingOrders;

  if (isUserLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Authenticating Kitchen Display...</p>
        </div>
      )
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 bg-gray-900 min-h-screen text-white">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-5xl font-bold">Kitchen Display System</h1>
        <p className="text-gray-400">Live Orders</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <OrderCard.Skeleton key={i} />)
        ) : kitchenOrders && kitchenOrders.length > 0 ? (
          kitchenOrders.map((order) => (
            <OrderCard key={order.id} order={order} workflow="kds" />
          ))
        ) : (
          <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col items-center justify-center p-12 text-center bg-gray-800 border-gray-700">
             <Clock className="h-24 w-24 text-gray-600 mb-4" />
            <h3 className="font-headline text-2xl font-semibold">No Active Orders</h3>
            <p className="text-gray-400">New orders will appear here automatically.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
