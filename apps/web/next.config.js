const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  transpilePackages: ['@digital-umroh/ui', '@digital-umroh/schemas', '@digital-umroh/config'],

  // Environment variables for API
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  },

  // Images configuration
  images: {
    domains: [
      'localhost',
      'your-appmu-domain.com',
      '*.appmu.com',
      'r2.cloudflarestorage.com',
      'your-account-id.r2.cloudflarestorage.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Internationalization
  i18n: {
    locales: ['id-ID', 'en-US'],
    defaultLocale: 'id-ID',
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Rewrites for API
  async rewrites() {
    return {
      beforeFiles: [
        // API rewrites
        {
          source: '/api/v1/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
        },
      ],
    };
  },

  // Middleware for tenant resolution
  async middleware() {
    return [
      // This will be handled by middleware.ts
    ];
  },
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));