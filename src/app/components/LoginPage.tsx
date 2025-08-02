'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('joseph@example.com');
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/background-image.png')", 
        }}
      />
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div 
          className="rounded-2xl p-8 shadow-xl"
          style={{ backgroundColor: 'var(--bg-white-0, #FFFFFF)' }}
        >
          {/* Welcome Back Title */}
          <h1 
            className="text-center mb-2"
            style={{
              fontFamily: 'var(--font-geist), Geist, sans-serif',
              fontWeight: 500,
              fontSize: '40px',
              lineHeight: '48px',
              letterSpacing: '-1%',
              color: 'var(--text-main-900, #0A0D14)',
            }}
          >
            Welcome Back
          </h1>
          
          {/* Subtitle */}
          <p 
            className="text-center mb-8"
            style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.6%',
              color: 'var(--text-sub-500, #525866)',
            }}
          >
            Continue from where you left off
          </p>
          
          {/* Email Field */}
          <div className="mb-6">
            <label 
              htmlFor="email"
              className="block mb-2"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.6%',
                color: 'var(--text-main-900, #0A0D14)',
              }}
            >
              Email Address/Username
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="joseph@example.com"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: '#9CA3AF',
              }}
            />
          </div>
          
          {/* Password Field */}
          <div className="mb-8">
            <label 
              htmlFor="password"
              className="block mb-2"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.6%',
                color: 'var(--text-main-900, #0A0D14)',
              }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '14px',
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full rounded-lg"
            style={{
              height: '40px',
              padding: '10px',
              backgroundColor: 'var(--primary-base, #375DFB)',
              borderRadius: '10px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.6%',
                color: 'var(--text-white-0, #FFFFFF)',
              }}
            >
              Sign in
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}