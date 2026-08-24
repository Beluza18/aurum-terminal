import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,  // This will skip TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true,  // This will skip ESLint errors
  },
  images: {
    domains: ['rasbnfvatyqyfebreslw.supabase.co'],
  },
};

export default nextConfig;