// src/hooks/usePendingSales.ts

import { useState, useEffect, useCallback } from 'react';
import { storage, type PendingSale, type CartItem } from '../utils/storage';
import { showToast } from '../utils/toast';

interface UsePendingSalesReturn {
  pendingSales: PendingSale[];
  holdSale: (items: CartItem[], total: number) => void;
  resumeSale: (saleId: string) => CartItem[] | null;
  deletePendingSale: (saleId: string) => void;
  clearAllPendingSales: () => void;
}

export const usePendingSales = (): UsePendingSalesReturn => {
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);

  // Load pending sales from storage on mount
  useEffect(() => {
    const saved = storage.pendingSales.load();
    setPendingSales(saved);
  }, []);

  // Save pending sales to storage whenever they change
  useEffect(() => {
    storage.pendingSales.save(pendingSales);
  }, [pendingSales]);

  const holdSale = useCallback((items: CartItem[], total: number): void => {
    if (items.length === 0) {
      showToast('Cannot hold empty cart', 'error');
      return;
    }

    const newPendingSale: PendingSale = {
      id: `pending-${Date.now()}`,
      items: [...items], // Deep copy to avoid mutations
      total,
      createdAt: new Date()
    };

    setPendingSales(current => [...current, newPendingSale]);
    showToast('Sale held successfully', 'success');
  }, []);

  const resumeSale = useCallback((saleId: string): CartItem[] | null => {
    const sale = pendingSales.find(s => s.id === saleId);
    if (!sale) {
      showToast('Pending sale not found', 'error');
      return null;
    }

    // Remove the sale from pending sales
    setPendingSales(current => current.filter(s => s.id !== saleId));
    showToast('Sale resumed', 'success');
    
    return sale.items;
  }, [pendingSales]);

  const deletePendingSale = useCallback((saleId: string): void => {
    const sale = pendingSales.find(s => s.id === saleId);
    if (!sale) {
      showToast('Pending sale not found', 'error');
      return;
    }

    setPendingSales(current => current.filter(s => s.id !== saleId));
    showToast('Pending sale deleted', 'info');
  }, [pendingSales]);

  const clearAllPendingSales = useCallback((): void => {
    setPendingSales([]);
    storage.pendingSales.clear();
    showToast('All pending sales cleared', 'info');
  }, []);

  return {
    pendingSales,
    holdSale,
    resumeSale,
    deletePendingSale,
    clearAllPendingSales
  };
};