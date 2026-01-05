'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // MOCK LOGIN - Accept any credentials
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data
      const emailPrefix = email.split('@')[0];
      const nameParts = emailPrefix.split(/[._-]/); // Split by dot, underscore, or dash
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUser = {
        id: '1',
        email: email.trim(),
        name: emailPrefix,
        firstName: nameParts[0] || emailPrefix,
        lastName: nameParts[1] || 'User',
        role: 'admin',
        forcePasswordChange: false
      };

      // Store auth data
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Redirect to dashboard
      router.push('/dashboard');

      /* REAL API CALL - Uncomment when backend is ready
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (data.success && data.data.token && data.data.user) {
        const { token, user } = data.data;

        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Check if user needs to change password (first login)
        if (user.forcePasswordChange) {
          router.push('/change-password');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error?.message || 'Login failed. Please check your credentials.');
      }
      */
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(/bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '500',
              textAlign: 'center',
              marginBottom: '8px',
              color: '#111827',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              Welcome Back
            </h1>
            
            <p style={{
              textAlign: 'center',
              marginBottom: '32px',
              color: '#6B7280',
              fontSize: '14px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              Continue from where you left off
            </p>

            {/* Error Message */}
            {error && (
              <div style={{
                marginBottom: '24px',
                padding: '12px 16px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px'
              }}>
                <p style={{
                  color: '#DC2626',
                  fontSize: '14px',
                  margin: '0',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  {error}
                </p>
              </div>
            )}
            
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="email" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#111827',
                fontSize: '14px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: isLoading ? 0.6 : 1
                }}
                placeholder="Enter your email"
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <label htmlFor="password" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#111827',
                fontSize: '14px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                    opacity: isLoading ? 0.6 : 1
                  }}
                  placeholder="Enter your password"
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: isLoading ? 'default' : 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.color = '#6B7280';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.currentTarget.style.color = '#9CA3AF';
                  }}
                >
                  {showPassword ? (
                    <EyeSlashIcon style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <EyeIcon style={{ width: '20px', height: '20px' }} />
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '40px',
                backgroundColor: isLoading ? '#93C5FD' : '#3B82F6',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '14px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#2563EB';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#3B82F6';
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Help Text */}
            <p style={{
              textAlign: 'center',
              marginTop: '20px',
              color: '#6B7280',
              fontSize: '12px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              Use credentials provided by your administrator
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}