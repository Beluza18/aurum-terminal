import type { NextConfig } from 'next';
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['rasbnfvatyqyfebreslw.supabase.co'],
  },
  // 🔥 CRITICAL FIX: Allow your phone's local IP to access the dev server
  allowedDevOrigins: ['192.168.0.161'], 
};

const pwaWrapper = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
} as any);

export default pwaWrapper(nextConfig);