import { create } from 'zustand';
import { IProduct, ICustomer } from '../db';

export interface CartItem extends IProduct {
  quantity: number;
}

export interface IHeldCart {
  id: string;
  items: CartItem[];
  customer: ICustomer | null;
  discount: number;
  createdAt: Date;
}

interface CartState {
  items: CartItem[];
  customer: ICustomer | null;
  discount: number;
  heldCarts: IHeldCart[];
  addItem: (product: IProduct) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  setCustomer: (customer: ICustomer | null) => void;
  clearCart: () => void;
  subtotal: () => number;
  tax: () => number;
  total: () => number;
  holdCart: () => void;
  resumeCart: (heldCart: IHeldCart) => void;
  deleteHeldCart: (id: string) => void;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  discount: 0,
  heldCarts: [],

  addItem: (product) => {
    const { items } = get();
    const existingItem = items.find((i) => i.id === product.id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.id !== productId) });
  },

  updateQuantity: (productId, delta) => {
    const { items } = get();
    set({
      items: items
        .map((i) => {
          if (i.id === productId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : i;
          }
          return i;
        })
    });
  },

  setCustomer: (customer) => set({ customer }),
  
  clearCart: () => set({ items: [], customer: null, discount: 0 }),

  subtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  tax: () => {
    const { items } = get();
    return items.reduce((totalTax, item) => {
      let itemTax = 0;
      const taxType = item.taxType || 'none';
      const taxValue = item.taxValue || 0;

      if (taxType === 'percentage') {
        itemTax = (item.price * item.quantity) * (taxValue / 100);
      } else if (taxType === 'fixed') {
        itemTax = taxValue * item.quantity;
      }
      
      // Round to 2 decimal places per item line
      return totalTax + Math.round(itemTax * 100) / 100;
    }, 0);
  },

  total: () => {
    const sub = get().subtotal();
    const tax = get().tax();
    return sub + tax - get().discount;
  },

  holdCart: () => {
    const { items, customer, discount, heldCarts } = get();
    if (items.length === 0) return;

    const newHeldCart: IHeldCart = {
      id: Math.random().toString(36).substr(2, 9),
      items,
      customer,
      discount,
      createdAt: new Date(),
    };

    set({
      heldCarts: [...heldCarts, newHeldCart],
      items: [],
      customer: null,
      discount: 0,
    });
  },

  resumeCart: (heldCart) => {
    const { items } = get();
    if (items.length > 0) {
      // If current cart is not empty, hold it first? Or just replace?
      // Let's replace for simplicity, but in a real app we might merge or ask.
    }
    set({
      items: heldCart.items,
      customer: heldCart.customer,
      discount: heldCart.discount,
      heldCarts: get().heldCarts.filter(c => c.id !== heldCart.id)
    });
  },

  deleteHeldCart: (id) => {
    set({
      heldCarts: get().heldCarts.filter(c => c.id !== id)
    });
  }
}));
