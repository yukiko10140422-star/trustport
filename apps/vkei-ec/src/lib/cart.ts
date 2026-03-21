import type { CartItem, CartState, CartAction } from '@/types';

export const initialCartState: CartState = { items: [] };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === action.product.id && item.size === action.size
      );
      if (existingIndex >= 0) {
        const updatedItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + action.quantity }
            : item
        );
        return { items: updatedItems };
      }
      return {
        items: [
          ...state.items,
          { product: action.product, size: action.size, quantity: action.quantity },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(
          (item) => !(item.product.id === action.productId && item.size === action.size)
        ),
      };
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return {
          items: state.items.filter(
            (item) => !(item.product.id === action.productId && item.size === action.size)
          ),
        };
      }
      return {
        items: state.items.map((item) =>
          item.product.id === action.productId && item.size === action.size
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    }
    case 'CLEAR_CART':
      return initialCartState;
    default:
      return state;
  }
}

export function getCartTotal(items: readonly CartItem[]): number {
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
}

export function getCartItemCount(items: readonly CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
