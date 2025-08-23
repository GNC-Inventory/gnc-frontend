// src/hooks/useCart.ts

import { useState, useEffect, useCallback } from 'react';
import { storage, type CartItem } from '../utils/storage';
import { type Product } from './useInventory';
import { showToast } from '../utils/toast';

interface UseCartReturn {
  cartItems: CartItem[];
  addToCart: (product: Product, price: number) => boolean;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
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

  const addToCart = useCallback((product: Product, price: number): boolean => {
    // Check stock availability
    if (product.stockLeft <= 0) {
      showToast('Product is out of stock', 'error');
      return false;
    }

    const existingItem = cartItems.find(item => item.id === product.id);
    const currentQuantity = existingItem?.quantity || 0;

    // Check if adding one more would exceed stock
    if (currentQuantity + 1 > product.stockLeft) {
      showToast(`Only ${product.stockLeft} items available in stock`, 'error');
      return false;
    }

    setCartItems(current => {
      if (existingItem) {
        return current.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, price }
            : item
        );
      } else {
        return [...current, {
          id: product.id,
          name: product.name,
          image: product.image,
          price,
          quantity: 1
        }];
      }
    });

    showToast(`${product.name} added to cart`, 'success');
    return true;
  }, [cartItems]);

  const updateQuantity = useCallback((id: string, quantity: number): void => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    // Find the product to check stock
    const product = products.find(p => p.id === id);
    if (product && quantity > product.stockLeft) {
      showToast(`Only ${product.stockLeft} items available in stock`, 'error');
      return;
    }

    setCartItems(current => 
      current.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [products]);

  const removeItem = useCallback((id: string): void => {
    setCartItems(current => current.filter(item => item.id !== id));
    
    const item = cartItems.find(item => item.id === id);
    if (item) {
      showToast(`${item.name} removed from cart`, 'info');
    }
  }, [cartItems]);

  const clearCart = useCallback((): void => {
    setCartItems([]);
    storage.cart.clear();
  }, []);

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