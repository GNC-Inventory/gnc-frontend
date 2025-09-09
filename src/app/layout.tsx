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
      <body 
        className={`${inter.variable} ${geist.variable} antialiased`}
        style={{
          backgroundImage: 'url(/glob.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div style={{ 
          maxWidth: '1440px', 
          margin: '0 auto',
          minHeight: '100vh',
          position: 'relative'
        }}>
          {children}
        </div>
      </body>
    </html>
  );
}