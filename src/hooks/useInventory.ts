// src/hooks/useInventory.ts

import { useState, useEffect, useCallback } from 'react';

export interface Product {
  id: string;
  name: string;
  make?: string;        // Add this
  model?: string;       // Add this
  type?: string;        // Add this
  capacity?: string;    // Add this
  description?: string; // Add this
  image: string;
  category: string;
  sku: string;
  basePrice: number;
  stockLeft: number;
  dateAdded: string;
  types?: string[];
  brands?: string[];
  sizes?: string[];
}

interface UseInventoryReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useInventory = (): UseInventoryReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://gnc-inventory-backend.onrender.com/api/admin/products', {
  headers: {
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
  }
});
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();

      console.log('Raw API response:', result.data);
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response format');
      }
      
      const transformedProducts = result.data;
      setProducts(transformedProducts);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      console.error('Error loading inventory:', err);
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    products,
    loading,
    error,
    refetch: fetchInventory
  };
};