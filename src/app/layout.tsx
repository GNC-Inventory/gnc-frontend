import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Welcome Back - Sign In",
  description: "Continue from where you left off",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geist.variable} antialiased`}>
        {/* Side background images - fills white spaces on left and right of max-width container */}
        <>
          {/* Left side background */}
          <div 
            className="fixed left-0 top-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/glob.jpg)',
              clipPath: 'polygon(0 0, calc((100vw - 1440px) / 2) 0, calc((100vw - 1440px) / 2) 100%, 0 100%)',
              zIndex: -1
            }}
          />
          
          {/* Right side background */}
          <div 
            className="fixed right-0 top-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/glob.jpg)',
              clipPath: 'polygon(calc(50vw + 720px) 0, 100% 0, 100% 100%, calc(50vw + 720px) 100%)',
              zIndex: -1
            }}
          />
        </>

        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {children}
        </div>
      </body>
    </html>
  );
}