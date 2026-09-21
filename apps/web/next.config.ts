import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@portfolio/contracts'],
  experimental: {
    outputFileTracingRoot: new URL('../../', import.meta.url).pathname
  }
};

export default nextConfig;

