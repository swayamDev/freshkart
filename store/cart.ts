import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Id } from "@/convex/_generated/dataModel";

export interface CartItem {
  productId: Id<"products">;
  name: string;
  price: number;
  imageUrl?: string | null;
  stock: number;
  unit?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: Id<"products">) => void;
  updateQuantity: (productId: Id<"products">, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item) => {
        const { quantity = 1, ...rest } = item;
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === rest.productId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === rest.productId
                  ? {
                      ...i,
                      quantity: Math.min(i.stock, i.quantity + quantity),
                    }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...rest, quantity: Math.min(rest.stock, quantity) },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(i.stock, quantity) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      subtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "freshkart-cart",
    }
  )
);
