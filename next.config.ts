import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Allow production builds with TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow production builds with ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Enable server actions
    serverActions: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        child_process: false,
        'snowflake-sdk': false,
      };
    }
    return config;
  },
  // Vercel specific optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
};

module.exports = nextConfig;

export default nextConfig;
