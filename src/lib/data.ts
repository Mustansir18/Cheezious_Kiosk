
import type { Branch, MenuItem } from './types';
import branchesData from '@/config/branches.json';

export const branches: Branch[] = branchesData.branches;

export const menuItems: MenuItem[] = [
  // Deals from image
  {
    id: 'deal-1',
    name: 'Somewhat Amazing 1',
    description: '2 Bazinga burgers, Reg. fries, 2 reg. drinks.',
    price: 1250,
    category: 'Deals',
    imageId: 'deal-1',
  },
  {
    id: 'deal-2',
    name: 'Somewhat Amazing 2',
    description: '2 Bazinga burgers, 2 pcs chicken, Large fries, 2 reg. drinks.',
    price: 1750,
    category: 'Deals',
    imageId: 'deal-2',
  },
  {
    id: 'deal-3',
    name: 'Somewhat Amazing 3',
    description: '3 Bazinga burgers, Large fries, 1 liter drink.',
    price: 1890,
    category: 'Deals',
    imageId: 'deal-3',
  },
  {
    id: 'deal-4',
    name: 'Somewhat Amazing 4',
    description: '3 Bazinga burgers, 3 pcs chicken, 1 liter drink.',
    price: 2150,
    category: 'Deals',
    imageId: 'deal-4',
  },

  // Money saving deals (Pizzas) from image
  {
    id: 'pizza-deal-1',
    name: 'Small Pizza Deal',
    description: '6" small pizza, 1 reg. Drink (345 ml).',
    price: 750,
    category: 'Pizzas',
    imageId: 'pizza-small',
  },
  {
    id: 'pizza-deal-2',
    name: 'Regular Pizza Deal',
    description: '9" regular pizza, 2 reg. Drinks (345 ml).',
    price: 1450,
    category: 'Pizzas',
    imageId: 'pizza-regular',
  },
  {
    id: 'pizza-deal-3',
    name: 'Large Pizza Deal',
    description: '12" large pizza, 1 liter drink.',
    price: 1990,
    category: 'Pizzas',
    imageId: 'pizza-large',
  },
  
  // Drinks from image
  {
    id: 'd1',
    name: 'Regular Soft Drink',
    description: 'A regular-sized soft drink (345ml).',
    price: 100,
    category: 'Drinks',
    imageId: 'drink-1',
  },
  {
    id: 'd2',
    name: '1 Liter Soft Drink',
    description: '1 Liter soft drink bottle.',
    price: 190,
    category: 'Drinks',
    imageId: 'drink-liter',
  },
  {
    id: 'd3',
    name: '1.5 Liter Soft Drink',
    description: '1.5 Liter soft drink bottle.',
    price: 220,
    category: 'Drinks',
    imageId: 'drink-liter',
  },
  {
    id: 'd4',
    name: 'Small Water Bottle',
    description: 'A small bottle of mineral water.',
    price: 60,
    category: 'Drinks',
    imageId: 'drink-2',
  },
  {
    id: 'd5',
    name: 'Small Juice',
    description: 'A small carton of juice.',
    price: 60,
    category: 'Drinks',
    imageId: 'juice-small',
  },
];
