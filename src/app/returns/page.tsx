'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function ReturnsPage() {
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
          title="Returns Management" 
          subtitle="Process and track product returns and refunds."
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
              backgroundColor: '#EBF8FF',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg 
                style={{ width: '40px', height: '40px', color: '#3B82F6' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" 
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
              Returns Management
            </h2>
            
            <p style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '14px',
              color: '#6B7280',
              lineHeight: '20px',
              marginBottom: '24px'
            }}>
              This feature is coming soon. You'll be able to process product returns, 
              issue refunds, and track return history from this page.
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
                <li>Process product returns from sales</li>
                <li>Issue full or partial refunds</li>
                <li>Track return reasons and patterns</li>
                <li>Restore returned items to inventory</li>
                <li>Generate return reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}