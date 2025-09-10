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

  // Function to restore inventory when items are removed
  // Function to restore inventory when items are removed
const restoreInventory = async (productId: string, quantity: number) => {
  try {
    // ADD DEBUGGING LOGS HERE
    console.log('Environment variables check:');
    console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log('NEXT_PUBLIC_API_KEY:', process.env.NEXT_PUBLIC_API_KEY ? 'SET' : 'NOT SET');
    console.log('Making restore inventory call for productId:', productId, 'quantity:', quantity);

    const response = await fetch('https://gnc-inventory-backend.onrender.com/api/admin/inventory', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
      },
      body: JSON.stringify({
        productId: productId,
        action: 'restore',
        quantity: quantity
      })
    });

    // ADD MORE DEBUGGING LOGS HERE
    console.log('Response status:', response.status);
    console.log('Response URL:', response.url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Details:', errorText);
      console.error('Request headers sent:', {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY
      });
      console.error('Request body sent:', JSON.stringify({
        productId: productId,
        action: 'restore',
        quantity: quantity
      }));
    }

    const result = await response.json();
    console.log('API Response:', result);
    
    if (!result.success) {
      console.error('Failed to restore inventory:', result.error);
      // Don't throw error here as cart removal should still proceed
      toast.warning('Item removed from cart, but inventory restoration failed');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error occurred:', error);
    console.error('Error restoring inventory:', error);
    toast.warning('Item removed from cart, but inventory restoration failed');
    return false;
  }
};

  const addToCart = useCallback((product: Product, price: number, quantity: number = 1): boolean => {
    // Note: Inventory deduction is now handled in ProductDetailModal before this function is called
    // This function now just adds to cart assuming inventory was already deducted

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
      // Remove item directly instead of calling removeItem to avoid circular dependency
      const item = cartItems.find(item => item.id === id);
      if (item) {
        await restoreInventory(item.id, item.quantity);
        setCartItems(current => current.filter(item => item.id !== id));
        toast.success(`${item.name} removed from cart and inventory restored`);
      }
      return;
    }

    const currentItem = cartItems.find(item => item.id === id);
    if (!currentItem) return;

    const quantityDifference = quantity - currentItem.quantity;
    
    if (quantityDifference > 0) {
      // Increasing quantity - need to deduct more from inventory
      const product = products.find(p => p.id === id);
      if (product && quantity > product.stockLeft + currentItem.quantity) {
        toast.error(`Only ${product.stockLeft + currentItem.quantity} items available in stock`);
        return;
      }

      try {
        const response = await fetch('https://gnc-inventory-backend.onrender.com/api/admin/inventory', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
          },
          body: JSON.stringify({
            productId: id,
            action: 'deduct',
            quantity: quantityDifference
          })
        });

        const result = await response.json();
        if (!result.success) {
          toast.error('Failed to update inventory');
          return;
        }
      } catch (error) {
        console.error('Error occurred:', error);
        toast.error('Failed to update inventory');
        return;
      }
    } else if (quantityDifference < 0) {
      // Decreasing quantity - need to restore to inventory
      await restoreInventory(id, Math.abs(quantityDifference));
    }

    setCartItems(current => 
      current.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [products, cartItems]);

  const removeItem = useCallback(async (id: string): Promise<void> => {
    const item = cartItems.find(item => item.id === id);
    
    if (item) {
      // Restore inventory before removing from cart
      await restoreInventory(item.id, item.quantity);
      
      setCartItems(current => current.filter(item => item.id !== id));
      toast.success(`${item.name} removed from cart and inventory restored`);
    }
  }, [cartItems]);

  const clearCart = useCallback(async (): Promise<void> => {
    // Restore inventory for all items when clearing cart
    const restorePromises = cartItems.map(item => 
      restoreInventory(item.id, item.quantity)
    );
    
    try {
      await Promise.all(restorePromises);
      toast.success('Cart cleared and inventory restored');
    } catch (error) {
      console.error('Error occurred:', error);
      console.error('Error clearing cart:', error);
      toast.warning('Cart cleared, but some inventory restoration failed');
    }
    
    setCartItems([]);
    storage.cart.clear();
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