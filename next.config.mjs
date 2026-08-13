// When GITHUB_PAGES=true we produce a fully static export (no Node server) that
// can be published to GitHub Pages. Otherwise we keep the default 'standalone'
// output used by the Docker/Cloud Run deployment.
const isPages = process.env.GITHUB_PAGES === 'true';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];

// GitHub Pages project sites are served from https://<user>.github.io/<repo>/,
// so assets must be prefixed with the repo name. Override with NEXT_PUBLIC_BASE_PATH.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isPages ? `/${repositoryName || 'cpm-frontend'}` : '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isPages
    ? {
        output: 'export',
        basePath,
        assetPrefix: basePath || undefined,
        trailingSlash: true,
      }
    : { output: 'standalone' }),
  images: {
    // Next's image optimizer needs a server; static export must serve raw images.
    unoptimized: isPages,
    remotePatterns: [
      // S3 presigned media (bucket host is injected at deploy time).
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
  // The /api proxy rewrite only exists on the Node server. In static-export mode
  // the browser must call the backend directly (NEXT_PUBLIC_API_BASE_URL + CORS).
  ...(isPages
    ? {}
    : {
        async rewrites() {
          // Proxy API calls so the browser talks to a same-origin path.
          const api = process.env.API_PROXY_TARGET || 'https://cpm-backend-1035324904785.asia-south1.run.app';
          return [{ source: '/api/:path*', destination: `${api}/api/:path*` }];
        },
      }),
};

export default nextConfig;
