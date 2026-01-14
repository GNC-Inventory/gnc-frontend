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
    console.log('=== ADD TO CART CALLED ===');
    console.log('Product:', product);
    console.log('Price:', price);
    console.log('Quantity:', quantity);
    
    // Use functional update to get current cart state
    let validationFailed = false;
    
    setCartItems(current => {
      console.log('Current cart items:', current);
      
      const existingItem = current.find(item => item.id === product.id);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      const totalRequestedQuantity = currentCartQuantity + quantity;

      console.log('Existing item in cart:', existingItem);
      console.log('Current cart quantity:', currentCartQuantity);
      console.log('Total requested:', totalRequestedQuantity);
      console.log('Stock left:', product.stockLeft);

      // Validate sufficient stock
      if (totalRequestedQuantity > product.stockLeft) {
        console.log('❌ VALIDATION FAILED: Insufficient stock');
        validationFailed = true;
        toast.error(`Only ${product.stockLeft} items available in stock`);
        return current; // Return unchanged cart
      }

      console.log('✅ Validation passed, updating cart...');

      const updated = existingItem
        ? current.map(item => 
            item.id === product.id 
              ? { 
                  ...item, 
                  quantity: item.quantity + quantity, 
                  price,
                  make: product.make,
                  model: product.model,
                  type: product.type,
                  capacity: product.capacity,
                  description: product.description
                }
              : item
          )
        : [...current, {
            id: product.id,
            name: product.name,
            make: product.make,
            model: product.model,
            type: product.type,
            capacity: product.capacity,
            description: product.description,
            image: product.image,
            price,
            quantity
          }];
      
      console.log('Updated cart:', updated);
      return updated;
    });

    if (validationFailed) {
      console.log('❌ Returning false due to validation failure');
      return false;
    }

    console.log('✅ Cart updated, returning true');
    console.log('=== ADD TO CART COMPLETE ===');
    return true;
  }, []); // ✅ Empty dependency array - use functional updates instead

  const updateQuantity = useCallback((id: string, quantity: number): void => {
    if (quantity <= 0) {
      // ✅ CHANGED: Just remove item, no inventory restoration needed
      setCartItems(current => {
        const item = current.find(item => item.id === id);
        if (item) {
          toast.success(`${item.name} removed from cart`);
        }
        return current.filter(item => item.id !== id);
      });
      return;
    }

    // ✅ CHANGED: Removed inventory API calls for quantity changes
    // Just update cart state - backend validates at checkout
    setCartItems(current => 
      current.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, []); // ✅ Empty dependency array

  const removeItem = useCallback((id: string): void => {
    setCartItems(current => {
      const item = current.find(item => item.id === id);
      
      if (item) {
        toast.success(`${item.name} removed from cart`);
        return current.filter(item => item.id !== id);
      }
      
      return current;
    });
  }, []); // ✅ Empty dependency array

const clearCart = useCallback(async (shouldRestoreInventory: boolean = true): Promise<void> => {
  console.log('=== CLEAR CART DEBUG ===');
  console.log('shouldRestoreInventory:', shouldRestoreInventory);
  
  setCartItems(current => {
    console.log('cartItems to process:', current);
    // ✅ CHANGED: Removed inventory restoration logic since inventory is never deducted on add to cart
    return [];
  });
  
  storage.cart.clear();
  toast.success('Cart cleared');
  console.log('=== CLEAR CART COMPLETE ===');
}, []); // ✅ Empty dependency array

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