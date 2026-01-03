'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeOffIcon, UserIcon, LockIcon, AlertTriangle, Trash2, X } from 'lucide-react';
import { showToast } from '../../utils/toast';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'danger'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Reset Sales State
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/');
    }
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showToast('Password changed successfully', 'success');
      } else {
        showToast(data.error?.message || 'Failed to change password', 'error');
      }
    } catch {
  showToast('Failed to change password', 'error');
} finally {
      setIsLoading(false);
    }
  };

  const handleResetSales = async () => {
    if (confirmationText !== 'RESET') {
      showToast('Please type RESET to confirm', 'error');
      return;
    }

    setIsResetting(true);

    try {
      const response = await fetch('https://gnc-inventory-backend.onrender.com/api/sales/reset', {
        method: 'DELETE',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
        }
      });

      const result = await response.json();

      if (result.success) {
        localStorage.removeItem('transactionData');
        setShowResetModal(false);
        setConfirmationText('');
        showToast(`Sales data has been reset successfully. ${result.data?.recordsArchived || 0} records archived.`, 'success');
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to reset sales data');
      }
    } catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  showToast(`Failed to reset sales data: ${errorMessage}`, 'error');
} finally {
      setIsResetting(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTop: '3px solid #3b82f6', borderRadius: '50%' }}></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'password', label: 'Password', icon: LockIcon },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ];

  const passwordFields = [
    { key: 'current', label: 'Current Password', value: passwordData.currentPassword },
    { key: 'new', label: 'New Password', value: passwordData.newPassword },
    { key: 'confirm', label: 'Confirm New Password', value: passwordData.confirmPassword }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: '#6b7280' }}>Manage your account settings and preferences</p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', display: 'flex' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'password' | 'danger')}
                style={{
                  padding: '16px 24px',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: activeTab === tab.id ? (tab.id === 'danger' ? '#dc2626' : '#3b82f6') : '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>First Name</label>
                  <input type="text" value={user.firstName} readOnly style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', color: '#6b7280', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Last Name</label>
                  <input type="text" value={user.lastName} readOnly style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', color: '#6b7280', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email Address</label>
                <input type="email" value={user.email} readOnly style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', color: '#6b7280', boxSizing: 'border-box' }} />
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Contact your administrator to change your profile information</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Role</label>
                <input type="text" value={user.role} readOnly style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', color: '#6b7280', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
              {passwordFields.map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>{field.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords[field.key as keyof typeof showPasswords] ? 'text' : 'password'}
                      value={field.value}
                      onChange={(e) => setPasswordData({ ...passwordData, [field.key + 'Password']: e.target.value })}
                      style={{ width: '100%', padding: '12px 48px 12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, [field.key]: !showPasswords[field.key as keyof typeof showPasswords] })}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                    >
                      {showPasswords[field.key as keyof typeof showPasswords] ? <EyeOffIcon style={{ width: '16px', height: '16px' }} /> : <EyeIcon style={{ width: '16px', height: '16px' }} />}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading ? '#93c5fd' : '#3b82f6',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <LockIcon style={{ width: '16px', height: '16px' }} />
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'danger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <AlertTriangle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Reset Sales Data</h3>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
  This will permanently delete all sales transaction records and reset &quot;Stock Out&quot; and &quot;Gross Total Sales Value&quot; to zero.
</p>
                    <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500', margin: 0 }}>
                      ⚠️ This action cannot be undone. Use only for clearing testing data.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResetModal(true)}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                    Reset Sales
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '24px', 
            width: '500px', 
            maxWidth: '90vw', 
            padding: '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle style={{ width: '24px', height: '24px', color: '#dc2626' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Confirm Sales Data Reset</h3>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setConfirmationText('');
                }}
                disabled={isResetting}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '2px solid #fecaca', 
              borderRadius: '12px', 
              padding: '16px', 
              marginBottom: '16px' 
            }}>
              <p style={{ fontSize: '14px', color: '#991b1b', fontWeight: '500', marginBottom: '8px' }}>
                ⚠️ WARNING: This action will permanently:
              </p>
              <ul style={{ fontSize: '14px', color: '#b91c1c', marginLeft: '16px', lineHeight: '1.6' }}>
                <li>Delete all sales transaction records</li>
                <li>Reset &quot;Total Stock Out&quot; to 0 items</li>
                <li>Reset &quot;Gross Total Sales Value&quot; to ₦ 0.00</li>
                <li>Clear all testing phase sales data</li>
              </ul>
              <p style={{ fontSize: '14px', color: '#991b1b', fontWeight: '500', marginTop: '12px', marginBottom: 0 }}>
                This action CANNOT be undone!
              </p>
            </div>

            <div style={{ 
              backgroundColor: '#eff6ff', 
              border: '1px solid #bfdbfe', 
              borderRadius: '8px', 
              padding: '12px', 
              marginBottom: '16px' 
            }}>
              <p style={{ fontSize: '12px', color: '#1e40af', margin: 0 }}>
                ℹ️ Note: All data will be archived before deletion for audit purposes.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                Type <span style={{ fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>RESET</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                placeholder="Type RESET"
                disabled={isResetting}
                style={{ 
                  width: '100%', 
                  height: '40px', 
                  borderRadius: '8px', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  textAlign: 'center', 
                  fontFamily: 'monospace', 
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setConfirmationText('');
                }}
                disabled={isResetting}
                style={{
                  padding: '12px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetSales}
                disabled={isResetting || confirmationText !== 'RESET'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: confirmationText === 'RESET' && !isResetting ? '#dc2626' : '#fca5a5',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: confirmationText === 'RESET' && !isResetting ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isResetting ? (
                  <>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid white', 
                      borderTop: '2px solid transparent', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite' 
                    }}></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                    Reset All Sales Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}