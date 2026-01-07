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
  clearCart: (shouldRestoreInventory?: boolean) => Promise<void>; // Updated interface
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
  console.log('🔄 === RESTORE INVENTORY DEBUG START ===');
  console.log('🔄 Product ID:', productId);
  console.log('🔄 Quantity to restore:', quantity);

  try {
    // Step 1: Get current product to find its inventory item ID
    console.log('🔄 Step 1: Fetching current product data...');
    const productResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
      }
    });

    if (!productResponse.ok) {
      throw new Error('Failed to fetch products');
    }

    const productsResult = await productResponse.json();
    const product = productsResult.data.find((p: any) => p.id === productId);
    
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const currentStock = product.stockLeft;
    const newStock = currentStock + quantity;
    
    console.log('🔄 Current stock:', currentStock);
    console.log('🔄 Restoring:', quantity);
    console.log('🔄 New stock will be:', newStock);

    // Step 2: Update inventory with new quantity
    // The endpoint expects inventory item ID, not product ID
    // We need to find the inventory item ID from the product
    const inventoryResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/inventory`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
      }
    });

    const inventoryResult = await inventoryResponse.json();
    const inventoryItem = inventoryResult.data.find((item: any) => 
      item.product.id.toString() === productId
    );

    if (!inventoryItem) {
      throw new Error(`Inventory item for product ${productId} not found`);
    }

    console.log('🔄 Found inventory item ID:', inventoryItem.id);
    console.log('🔄 Updating inventory...');

    // Step 3: Update the inventory item with new quantity
    const updateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/inventory/${inventoryItem.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
        },
        body: JSON.stringify({
          quantity: newStock  // Send the new total quantity
        })
      }
    );

    console.log('🔄 Response Status:', updateResponse.status);
    
    const responseText = await updateResponse.text();
    console.log('🔄 Raw Response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('🔄 Parsed Response:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON');
      toast.error('Invalid response from server');
      return false;
    }

    if (!updateResponse.ok || !result.success) {
      console.error('❌ Restore failed:', result.error);
      toast.error(`Failed to restore inventory: ${result.error?.message || 'Unknown error'}`);
      return false;
    }

    console.log('✅ Inventory restored successfully!');
    console.log('✅ New stock level:', newStock);
    console.log('🔄 === RESTORE INVENTORY DEBUG END ===');
    toast.success(`Restored ${quantity} unit(s) to inventory`);
    return true;

  } catch (error) {
    console.error('❌ === RESTORE INVENTORY ERROR ===');
    console.error('Error:', error);
    console.error('❌ === ERROR END ===');
    toast.error('Network error when restoring inventory');
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

const clearCart = useCallback(async (shouldRestoreInventory: boolean = true): Promise<void> => {
  console.log('=== CLEAR CART DEBUG ===');
  console.log('shouldRestoreInventory:', shouldRestoreInventory);
  console.log('cartItems to process:', cartItems);
  
  if (shouldRestoreInventory && cartItems.length > 0) {
    console.log('RESTORING inventory for', cartItems.length, 'items');
    
    // Restore inventory for each item
    const restorePromises = cartItems.map(item => 
      restoreInventory(item.id, item.quantity)
    );
    
    const results = await Promise.all(restorePromises);
    const successCount = results.filter(r => r === true).length;
    
    console.log(`Restored ${successCount}/${cartItems.length} items successfully`);
    
    if (successCount === cartItems.length) {
      toast.success('Cart cleared and inventory restored');
    } else if (successCount > 0) {
      toast.warning(`Cart cleared. ${successCount}/${cartItems.length} items restored to inventory`);
    } else {
      toast.warning('Cart cleared but inventory restoration failed');
    }
  } else {
    console.log('NOT restoring inventory (sale completed)');
    toast.success('Cart cleared');
  }
  
  setCartItems([]);
  storage.cart.clear();
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