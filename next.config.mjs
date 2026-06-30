/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      // S3 presigned media (bucket host is injected at deploy time).
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
  async rewrites() {
    // Proxy API calls so the browser talks to a same-origin path.
    const api = process.env.API_PROXY_TARGET || 'https://cpm-backend-1035324904785.asia-south1.run.app';
    return [{ source: '/api/:path*', destination: `${api}/api/:path*` }];
  },
};

export default nextConfig;
