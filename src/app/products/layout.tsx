'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#F9FAFB',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar 
        title="Products" 
        subtitle="View and sell available products."
        showNewSaleButton={false}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <main style={{
        flex: 1,
        overflow: 'auto',
        width: '100%'
      }}>
        {children}
      </main>
    </div>
  );
}