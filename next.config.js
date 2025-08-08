/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Allow production builds with TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow production builds with ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // turbo config removed as per instructions
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
};

module.exports = nextConfig; 