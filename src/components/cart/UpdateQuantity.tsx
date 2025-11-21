"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

export function UpdateQuantity({ itemId, quantity }: { itemId: string, quantity: number }) {
  const { updateQuantity } = useCart();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => updateQuantity(itemId, quantity - 1)}
      >
        {quantity === 1 ? <Trash2 className="h-4 w-4 text-destructive" /> : <Minus className="h-4 w-4" />}
      </Button>
      <span className="w-6 text-center font-bold">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => updateQuantity(itemId, quantity + 1)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
