export type Branch = {
  id: string;
  name: string;
  location: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageId: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageId: string;
};

export type OrderType = 'Dine-In' | 'Take Away';

export type PlacedOrder = {
    orderNumber: string;
    items: CartItem[];
    total: number;
    branchName: string;
    orderType: OrderType;
}
