'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function SupportPage() {
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
          title="Support" 
          subtitle="Get help and access documentation."
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
              backgroundColor: '#DBEAFE',
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
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" 
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
              Support & Help
            </h2>
            
            <p style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '14px',
              color: '#6B7280',
              lineHeight: '20px',
              marginBottom: '24px'
            }}>
              This feature is coming soon. You'll have access to documentation, 
              tutorials, and direct support channels.
            </p>
            
            <div style={{
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              textAlign: 'left',
              marginBottom: '16px'
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
                <li>User documentation and guides</li>
                <li>Video tutorials</li>
                <li>FAQ section</li>
                <li>Live chat support</li>
                <li>Contact support team</li>
                <li>System status and updates</li>
              </ul>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#EFF6FF',
              borderRadius: '8px',
              border: '1px solid #BFDBFE',
              textAlign: 'left'
            }}>
              <p style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '14px',
                color: '#1E40AF',
                lineHeight: '20px',
                margin: 0
              }}>
                <strong>Need immediate help?</strong><br />
                Contact us at: support@example.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}