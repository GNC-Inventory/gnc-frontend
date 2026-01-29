'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
        <Toaster position="top-right" />
      </AuthProvider>
    </Provider>
  );
}