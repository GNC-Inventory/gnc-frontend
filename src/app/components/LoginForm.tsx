// src/components/LoginForm.tsx
'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-bg-white-0 p-8 rounded-2xl shadow-md w-[432px]">
      <h1 className="text-[40px] leading-[48px] font-medium font-geist text-text-main-900 text-center mb-2">
        Welcome Back
      </h1>
      <p className="text-[14px] leading-[20px] font-sora font-normal text-text-sub-500 text-center mb-6">
        Continue from where you left off
      </p>

      <label className="block text-sm font-medium font-inter text-text-main-900 mb-1">
        Email Address/Username
      </label>
      <input
        type="text"
        placeholder="joseph@example.com"
        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md outline-none"
      />

      <label className="block text-sm font-medium font-inter text-text-main-900 mb-1">
        Password
      </label>
      <div className="relative mb-6">
        <input
          type={showPassword ? 'text' : 'password'}
          className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10 outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <button className="w-full h-10 rounded-[10px] bg-primary-base text-text-white-0 text-[14px] leading-[20px] font-inter font-medium">
        Sign in
      </button>
    </div>
  );
}
