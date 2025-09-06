'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('joseph@example.com');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md mx-4">
        <h1 className="text-3xl font-semibold text-center mb-2">Welcome Back</h1>
        <p className="text-center mb-8 text-gray-600">Continue from where you left off</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 font-medium">
              Email Address/Username
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="joseph@example.com"
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="password" className="block mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}