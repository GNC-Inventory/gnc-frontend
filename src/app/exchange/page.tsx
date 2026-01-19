'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function ExchangePage() {
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
          title="Exchange" 
          subtitle="Process product exchanges and swaps."
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
              backgroundColor: '#FEF3C7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg 
                style={{ width: '40px', height: '40px', color: '#F59E0B' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
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
              Product Exchange
            </h2>
            
            <p style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '14px',
              color: '#6B7280',
              lineHeight: '20px',
              marginBottom: '24px'
            }}>
              This feature is coming soon. You'll be able to process product exchanges 
              when customers want to swap items without refunds.
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
                <li>Exchange products from previous sales</li>
                <li>Handle price differences in exchanges</li>
                <li>Track exchange history</li>
                <li>Update inventory automatically</li>
                <li>Generate exchange receipts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}