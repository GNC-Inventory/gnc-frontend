import './globals.css';

export const metadata = {
  title: 'Login | GNC',
  description: 'Login page for GNC app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
