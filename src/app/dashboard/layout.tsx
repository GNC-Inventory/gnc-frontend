'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div style={{
        height: '100vh',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Navbar 
          title="Dashboard" 
          subtitle="View your recent activities."
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
    </ProtectedRoute>
  );
}