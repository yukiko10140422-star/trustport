'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { CartState, CartAction, Product, CartItem } from '@/types';
import { cartReducer, initialCartState, getCartTotal, getCartItemCount } from '@/lib/cart';

type CartContextValue = {
  readonly items: readonly CartItem[];
  readonly totalPrice: number;
  readonly itemCount: number;
  readonly addItem: (product: Product, size: string, quantity?: number) => void;
  readonly removeItem: (productId: string, size: string) => void;
  readonly updateQuantity: (productId: string, size: string, quantity: number) => void;
  readonly clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'swag-cart';

function loadCart(): CartState {
  if (typeof window === 'undefined') return initialCartState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CartState;
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return initialCartState;
}

function saveCart(state: CartState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export function CartProvider({ children }: { readonly children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    const loaded = loadCart();
    if (loaded.items.length > 0) {
      for (const item of loaded.items) {
        dispatch({
          type: 'ADD_ITEM',
          product: item.product,
          size: item.size,
          quantity: item.quantity,
        });
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveCart(state);
    }
  }, [state, isHydrated]);

  const value: CartContextValue = {
    items: isHydrated ? state.items : [],
    totalPrice: isHydrated ? getCartTotal(state.items) : 0,
    itemCount: isHydrated ? getCartItemCount(state.items) : 0,
    addItem: (product, size, quantity = 1) =>
      dispatch({ type: 'ADD_ITEM', product, size, quantity }),
    removeItem: (productId, size) =>
      dispatch({ type: 'REMOVE_ITEM', productId, size }),
    updateQuantity: (productId, size, quantity) =>
      dispatch({ type: 'UPDATE_QUANTITY', productId, size, quantity }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
  };

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
