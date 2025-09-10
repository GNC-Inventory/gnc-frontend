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

const extractCategory = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('generator') || lower.includes('inverter') || lower.includes('solar') || lower.includes('tv')) 
    return 'Electronics';
  if (lower.includes('washing') || lower.includes('refrigerator') || lower.includes('fan') || lower.includes('air conditioner')) 
    return 'Appliances';
  if (lower.includes('theatre') || lower.includes('sound')) 
    return 'Audio & Video';
  return 'General';
};

const transformProduct = (item: Record<string, unknown>): Product => {
  const product = item.product as {
    id?: number;
    name?: string;
    make?: string;       // Add this
    model?: string;      // Add this
    type?: string;       // Add this
    capacity?: string;   // Add this
    description?: string; // Add this
    imageUrl?: string;
    category?: string;
    basePrice?: string;
    createdAt?: string;
  };
  
  return {
    id: String(product?.id || item.id),
    name: String(product?.name || 'Unknown Product'),
    make: product?.make || undefined,        // Add this
    model: product?.model || undefined,      // Add this
    type: product?.type || undefined,        // Add this
    capacity: product?.capacity || undefined, // Add this
    description: product?.description || undefined, // Add this
    image: typeof product?.imageUrl === 'string' ? product.imageUrl : '/products/default.png',
    category: typeof product?.category === 'string' ? product.category : extractCategory(String(product?.name)), 
    sku: `SKU-${String(product?.id || item.id).slice(-6).toUpperCase()}`,
    basePrice: typeof product?.basePrice === 'string' ? parseFloat(product.basePrice) : 0,
    stockLeft: typeof item.quantity === 'number' ? item.quantity : 0,
    dateAdded: typeof product?.createdAt === 'string' ? product.createdAt : new Date().toISOString(),
    types: ['Standard'],
    brands: ['Generic'],
    sizes: ['Default']
  };
};

export const useInventory = (): UseInventoryReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://gnc-inventory-backend.onrender.com/api/admin/inventory', {
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
      
      const transformedProducts = result.data.map(transformProduct);
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