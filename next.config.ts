import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Ignore TypeScript errors during build (useful for quick deployments)
    ignoreBuildErrors: true,
  },
  images: {
    // Updated to remotePatterns for better security and to remove the deprecation warning
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rasbnfvatyqyfebreslw.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;