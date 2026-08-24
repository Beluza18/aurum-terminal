import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNavBar from './components/BottomNavBar';

export const metadata: Metadata = {
  title: 'Aurum Trading Terminal',
  description: 'Professional MT4 Trading System',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aurum Terminal',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f0f0f0' }}>
        {children}
        <BottomNavBar />
      </body>
    </html>
  );
}