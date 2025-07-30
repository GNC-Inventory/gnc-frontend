// src/app/page.tsx
'use client';
import Image from 'next/image';
import LoginForm from '../components/LoginForm';

export default function Home() {
  return (
    <main className="relative w-full h-screen">
      {/* Background Image */}
      <Image
        src="/bg.jpg"
        alt="Background"
        fill
        className="object-cover w-full h-full -z-10"
        priority
      />

      {/* Centered Card */}
      <div className="flex items-center justify-center h-full">
        <LoginForm />
      </div>
    </main>
  );
}
