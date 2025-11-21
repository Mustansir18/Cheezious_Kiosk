"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { CartItem, MenuItem, OrderType } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  branchId: string | null;
  orderType: OrderType | null;
  addItem: (item: MenuItem) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setOrderDetails: (details: { branchId: string; orderType: OrderType }) => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<OrderType | null>(null);

  useEffect(() => {
    try {
      const storedCart = sessionStorage.getItem('cheeziousCart');
      if (storedCart) {
        const { items, branchId, orderType } = JSON.parse(storedCart);
        setItems(items || []);
        setBranchId(branchId || null);
        setOrderType(orderType || null);
      }
    } catch (error) {
      console.error("Could not load cart from session storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      const cartState = JSON.stringify({ items, branchId, orderType });
      sessionStorage.setItem('cheeziousCart', cartState);
    } catch (error) {
      console.error("Could not save cart to session storage", error);
    }
  }, [items, branchId, orderType]);

  const setOrderDetails = (details: { branchId: string; orderType: OrderType }) => {
    setBranchId(details.branchId);
    setOrderType(details.orderType);
  };

  const addItem = (itemToAdd: MenuItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.id !== itemId);
      }
      return prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        branchId,
        orderType,
        addItem,
        updateQuantity,
        clearCart,
        setOrderDetails,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
