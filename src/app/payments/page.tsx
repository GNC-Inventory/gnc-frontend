'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function PaymentsPage() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#F9FAFB'
    }}>
      <Sidebar />
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Navbar 
          title="Payments" 
          subtitle="Manage payment methods and view payment history."
          showNewSaleButton={false}
        />
        
        <div style={{ 
          flex: 1, 
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#F0FDF4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg 
                style={{ width: '40px', height: '40px', color: '#22C55E' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
                />
              </svg>
            </div>
            
            <h2 style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '24px',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '12px'
            }}>
              Payments
            </h2>
            
            <p style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '14px',
              color: '#6B7280',
              lineHeight: '20px',
              marginBottom: '24px'
            }}>
              This feature is coming soon. You'll be able to manage payment methods, 
              view payment analytics, and reconcile daily transactions.
            </p>
            
            <div style={{
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              textAlign: 'left'
            }}>
              <h3 style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '12px'
              }}>
                Planned Features:
              </h3>
              <ul style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '14px',
                color: '#6B7280',
                lineHeight: '20px',
                margin: 0,
                paddingLeft: '20px'
              }}>
                <li>View all payment transactions</li>
                <li>Payment method breakdown (POS, Transfer, Cash)</li>
                <li>Daily payment reconciliation</li>
                <li>Payment analytics and trends</li>
                <li>Export payment reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}