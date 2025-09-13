'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeOffIcon, UserIcon, LockIcon } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
    } catch (error) {
      showToast('Failed to change password', 'error');
    } finally {
      setIsLoading(false);
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
    { id: 'password', label: 'Password', icon: LockIcon }
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
                onClick={() => setActiveTab(tab.id as 'profile' | 'password')}
                style={{
                  padding: '16px 24px',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
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
        </div>
      </div>
    </div>
  );
}