'use client';

import { useState, useEffect } from 'react';
import { WifiIcon, PrinterIcon, CircleStackIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';

export default function SupportPage() {
  const [user, setUser] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState({ connected: false, ping: 0 });
  const [printerStatus, setPrinterStatus] = useState({ connected: false, name: 'Not detected' });
  const [testing, setTesting] = useState({ network: false, printer: false });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    checkNetworkStatus();
  }, []);

  const checkNetworkStatus = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales`, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY! }
      });
      const pingTime = Date.now() - startTime;
      setNetworkStatus({ connected: response.ok, ping: pingTime });
    } catch {
      setNetworkStatus({ connected: false, ping: 0 });
    }
  };

  const testNetwork = async () => {
    setTesting({ ...testing, network: true });
    await checkNetworkStatus();
    setTesting({ ...testing, network: false });
  };

  const testPrinter = () => {
    setTesting({ ...testing, printer: true });
    try {
      const testContent = `
=============================
   PRINTER TEST
=============================
Date: ${new Date().toLocaleString()}
Cashier: ${user?.firstName || 'Unknown'}

If you can read this,
your printer works! ✓
=============================`;
      
      window.print();
      alert('✓ Print command sent! Check your printer.');
      setPrinterStatus({ connected: true, name: 'Default Printer' });
    } catch (error) {
      alert('❌ Printer error: ' + error);
    }
    setTesting({ ...testing, printer: false });
  };

  const clearCache = () => {
    if (confirm('Clear cache? App will reload.')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello Task Atlantic Support,\n\nI need help with GNC Sales App.\n\nCashier: ${user?.firstName || 'Unknown'}\nTime: ${new Date().toLocaleString()}\n\nIssue: `
    );
    window.open(`https://wa.me/2349076336101?text=${message}`, '_blank');
  };

  const sendEmail = () => {
    const subject = encodeURIComponent('GNC Sales App Support Request');
    const body = encodeURIComponent(
      `Issue Description:\n\n\nCashier: ${user?.firstName || 'Unknown'}\nTime: ${new Date().toLocaleString()}\nApp Version: 1.0.2`
    );
    window.location.href = `mailto:taskatlanticcooperation@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F9FAFB' }}>
      <Sidebar />
      
      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Support & Help</h1>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Diagnostics and support contact information</p>
          </div>

          {/* Diagnostics Section */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Quick Diagnostics</h2>
            
            {/* Printer Status */}
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <PrinterIcon style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>Printer Status</h3>
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>
                <span>Status: </span>
                <span style={{ color: printerStatus.connected ? '#10B981' : '#EF4444' }}>
                  {printerStatus.connected ? '✓ Connected' : '○ Not detected'}
                </span>
              </div>
              <button
                onClick={testPrinter}
                disabled={testing.printer}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: testing.printer ? 'not-allowed' : 'pointer',
                  opacity: testing.printer ? 0.6 : 1
                }}
              >
                {testing.printer ? 'Testing...' : 'Test Print'}
              </button>
            </div>

            {/* Network Status */}
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <WifiIcon style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>Network Status</h3>
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                <span>Backend: </span>
                <span style={{ color: networkStatus.connected ? '#10B981' : '#EF4444' }}>
                  {networkStatus.connected ? '✓ Connected' : '○ Disconnected'}
                </span>
              </div>
              {networkStatus.connected && (
                <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>
                  Ping: {networkStatus.ping}ms
                </div>
              )}
              <button
                onClick={testNetwork}
                disabled={testing.network}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: testing.network ? 'not-allowed' : 'pointer',
                  opacity: testing.network ? 0.6 : 1
                }}
              >
                {testing.network ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {/* Data Management */}
            <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <CircleStackIcon style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>Data & Cache</h3>
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>
                Cache stored in browser memory
              </div>
              <button
                onClick={clearCache}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Clear Cache
              </button>
            </div>
          </div>

          {/* Contact Support Section */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Contact Support</h2>
            
            {/* Email */}
            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <EnvelopeIcon style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>Email Support</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#1E40AF', margin: '0 0 8px 0' }}>
                taskatlanticcooperation@gmail.com
              </p>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
                Response within 24 hours
              </p>
              <button
                onClick={sendEmail}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Send Email
              </button>
            </div>

            {/* WhatsApp */}
            <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <PhoneIcon style={{ width: '20px', height: '20px', color: '#10B981' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>WhatsApp Support</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#065F46', margin: '0 0 8px 0' }}>
                +234 907 633 6101
              </p>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
                Mon-Sat, 9AM-6PM WAT
              </p>
              <button
                onClick={openWhatsApp}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Chat on WhatsApp
              </button>
            </div>
          </div>

          {/* Common Issues */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>Common Issues</h2>
            
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Printer not responding:</strong><br/>
                Check power and USB connection, then click "Test Print"
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Internet connection lost:</strong><br/>
                App works offline. Data syncs when connection restored.
              </div>
              <div>
                <strong>Product not found:</strong><br/>
                Contact admin to add product to inventory
              </div>
            </div>
          </div>

          {/* System Info */}
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', fontSize: '12px', color: '#6B7280' }}>
            <div>App Version: 1.0.2</div>
            <div>Last Updated: January 15, 2026</div>
            {user && <div>Cashier: {user.firstName} {user.lastName}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}