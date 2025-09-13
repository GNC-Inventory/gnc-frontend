'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeOffIcon, SaveIcon, UserIcon, LockIcon } from 'lucide-react';

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
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Password form state
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
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // No user found, redirect to login
      router.push('/');
    }
  }, [router]);

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
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
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        setMessage('Password changed successfully');
      } else {
        setError(data.error?.message || 'Failed to change password');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #f3f4f6',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '8px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Settings
        </h1>
        <p style={{
          color: '#6b7280',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          borderBottom: '1px solid #e5e7eb',
          display: 'flex'
        }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '16px 24px',
              borderBottom: activeTab === 'profile' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: '500',
              fontSize: '14px',
              color: activeTab === 'profile' ? '#3b82f6' : '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            <UserIcon style={{ width: '16px', height: '16px' }} />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            style={{
              padding: '16px 24px',
              borderBottom: activeTab === 'password' ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: '500',
              fontSize: '14px',
              color: activeTab === 'password' ? '#3b82f6' : '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            <LockIcon style={{ width: '16px', height: '16px' }} />
            Password
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Messages */}
          {message && (
            <div style={{
              marginBottom: '16px',
              padding: '12px 16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px'
            }}>
              <p style={{
                color: '#166534',
                fontSize: '14px',
                margin: '0',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                {message}
              </p>
            </div>
          )}
          {error && (
            <div style={{
              marginBottom: '16px',
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px'
            }}>
              <p style={{
                color: '#dc2626',
                fontSize: '14px',
                margin: '0',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={user.firstName}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                      color: '#6b7280',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={user.lastName}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                      color: '#6b7280',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px',
                  margin: '4px 0 0 0',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  Contact your administrator to change your profile information
                </p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  Role
                </label>
                <input
                  type="text"
                  value={user.role}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 48px 12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer'
                    }}
                  >
                    {showPasswords.current ? <EyeOffIcon style={{ width: '16px', height: '16px' }} /> : <EyeIcon style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 48px 12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer'
                    }}
                  >
                    {showPasswords.new ? <EyeOffIcon style={{ width: '16px', height: '16px' }} /> : <EyeIcon style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 48px 12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer'
                    }}
                  >
                    {showPasswords.confirm ? <EyeOffIcon style={{ width: '16px', height: '16px' }} /> : <EyeIcon style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

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
                    gap: '8px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
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