// src/hooks/useCart.ts

import { useState, useEffect, useCallback } from 'react';
import { storage, type CartItem } from '../utils/storage';
import { type Product } from './useInventory';
import { toast } from '../utils/toast';

interface UseCartReturn {
  cartItems: CartItem[];
  addToCart: (product: Product, price: number, quantity?: number) => boolean;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: (shouldRestoreInventory?: boolean) => Promise<void>;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

export const useCart = (products: Product[]): UseCartReturn => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from storage on mount
  useEffect(() => {
    const savedCart = storage.cart.load();
    setCartItems(savedCart);
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    storage.cart.save(cartItems);
  }, [cartItems]);

// ❌ REMOVED: restoreInventory function - no longer needed since inventory isn't deducted on add to cart
// Inventory will only be deducted when sale is completed at checkout

  const addToCart = useCallback((product: Product, price: number, quantity: number = 1): boolean => {
    // ✅ CHANGED: Removed inventory deduction, now just adds to cart
    // Stock validation is client-side only - backend will validate at checkout
    const existingItem = cartItems.find(item => item.id === product.id);

    setCartItems(current => {
if (existingItem) {
  return current.map(item => 
    item.id === product.id 
      ? { 
          ...item, 
          quantity: item.quantity + quantity, 
          price,
          // Ensure we keep the product details
          make: product.make,
          model: product.model,
          type: product.type,
          capacity: product.capacity,
          description: product.description
        }
      : item
        );
      } else {
return [...current, {
  id: product.id,
  name: product.name,
  make: product.make,        // Add this
  model: product.model,      // Add this
  type: product.type,        // Add this
  capacity: product.capacity, // Add this
  description: product.description, // Add this
  image: product.image,
  price,
  quantity
}];
      }
    });

    return true;
  }, [cartItems]);

  const updateQuantity = useCallback(async (id: string, quantity: number): Promise<void> => {
    if (quantity <= 0) {
      // ✅ CHANGED: Just remove item, no inventory restoration needed
      const item = cartItems.find(item => item.id === id);
      if (item) {
        setCartItems(current => current.filter(item => item.id !== id));
        toast.success(`${item.name} removed from cart`);
      }
      return;
    }

    // ✅ CHANGED: Removed inventory API calls for quantity changes
    // Just update cart state - backend validates at checkout
    const currentItem = cartItems.find(item => item.id === id);
    if (!currentItem) return;

    setCartItems(current => 
      current.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [products, cartItems]);

  const removeItem = useCallback(async (id: string): Promise<void> => {
    const item = cartItems.find(item => item.id === id);
    
    if (item) {
      // ✅ CHANGED: No inventory restoration - just remove from cart
      setCartItems(current => current.filter(item => item.id !== id));
      toast.success(`${item.name} removed from cart`);
    }
  }, [cartItems]);

const clearCart = useCallback(async (shouldRestoreInventory: boolean = true): Promise<void> => {
  console.log('=== CLEAR CART DEBUG ===');
  console.log('shouldRestoreInventory:', shouldRestoreInventory);
  console.log('cartItems to process:', cartItems);
  
  // ✅ CHANGED: Removed inventory restoration logic since inventory is never deducted on add to cart
  // Just clear the cart regardless of shouldRestoreInventory flag
  
  setCartItems([]);
  storage.cart.clear();
  toast.success('Cart cleared');
  console.log('=== CLEAR CART COMPLETE ===');
}, [cartItems]);

  const getTotalAmount = useCallback((): number => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const getTotalItems = useCallback((): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalAmount,
    getTotalItems
  };
};