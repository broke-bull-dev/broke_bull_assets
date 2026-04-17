import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productType: 'hoodie' | 'tshirt';
  color: string;
  colorHex: string;
  size: string;
  price: number;
  currency: string;
  nftName: string;
  nftCollection: string;
  nftContract: string;
  nftTokenId: string;
  nftImage: string;
  nftChainId: number;
  walletAddress: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` }],
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
      count: () => get().items.length,
    }),
    { name: 'on-chain-drip-cart' }
  )
);
