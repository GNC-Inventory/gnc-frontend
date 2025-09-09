// src/utils/storage.ts

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface PendingSale {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
}

// Storage key prefix for POS system
const POS_PREFIX = 'pos:';

// Typed storage operations
export const storage = {
  // Generic typed operations
  load<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(`${POS_PREFIX}${key}`);
      if (!item) return fallback;
      const parsed = JSON.parse(item);
      return parsed || fallback;
    } catch {
      return fallback;
    }
  },

  save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`${POS_PREFIX}${key}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`${POS_PREFIX}${key}`);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  },

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(POS_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear POS storage:', error);
    }
  },

  // Specific typed operations for POS entities
  cart: {
    load: (): CartItem[] => storage.load('cart', []),
    save: (items: CartItem[]) => storage.save('cart', items),
    clear: () => storage.remove('cart'),
  },

  pendingSales: {
    load: (): PendingSale[] => {
      const sales = storage.load<Array<Record<string, unknown>>>('pending-sales', []);
      // Convert date strings back to Date objects
      return sales.map(sale => ({
        id: String(sale.id),
        items: Array.isArray(sale.items) ? sale.items as CartItem[] : [],
        total: typeof sale.total === 'number' ? sale.total : 0,
        createdAt: new Date(sale.createdAt as string)
      }));
    },
    save: (sales: PendingSale[]) => storage.save('pending-sales', sales),
    clear: () => storage.remove('pending-sales'),
  },

  ui: {
    showCart: {
      load: (): boolean => storage.load('show-cart', false),
      save: (show: boolean) => storage.save('show-cart', show),
    }
  }
};

// Storage event listeners for cross-tab synchronization
export const createStorageListener = (callback: (key: string) => void) => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key?.startsWith(POS_PREFIX)) {
      const cleanKey = e.key.replace(POS_PREFIX, '');
      callback(cleanKey);
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
};

export type { CartItem, PendingSale };