import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, Restaurant } from "@shared/schema";

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string | null;
  addItem: (item: MenuItem, restaurantId: number, restaurantName: string) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, delta: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      total: 0,

      addItem: (item, restaurantId, restaurantName) => {
        const { items, restaurantId: currentRestaurantId } = get();

        // If adding from a different restaurant, confirm clear (simple version just warns/clears)
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
          if (!window.confirm("Start a new order? Adding items from a new restaurant will clear your current cart.")) {
            return;
          }
          set({ items: [], restaurantId, restaurantName }); // Clear and set new
        } else if (!currentRestaurantId) {
           set({ restaurantId, restaurantName });
        }

        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          let newItems;
          
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            newItems = [...state.items, { ...item, quantity: 1 }];
          }

          const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return { items: newItems, total };
        });
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== itemId);
          const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return { 
            items: newItems, 
            total,
            // Reset restaurant info if cart becomes empty
            restaurantId: newItems.length === 0 ? null : state.restaurantId,
            restaurantName: newItems.length === 0 ? null : state.restaurantName
          };
        });
      },

      updateQuantity: (itemId, delta) => {
        set((state) => {
          const newItems = state.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
          }).filter(item => item.quantity > 0);

          const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return { 
            items: newItems, 
            total,
            restaurantId: newItems.length === 0 ? null : state.restaurantId,
            restaurantName: newItems.length === 0 ? null : state.restaurantName
          };
        });
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null, total: 0 }),
    }),
    {
      name: "food-delivery-cart",
    }
  )
);
