/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'd1csarkz8obe9u.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.vectorstock.com',
      },
      {
        protocol: 'https',
        hostname: 'static.vecteezy.com',
      },
      {
        protocol: 'https',
        hostname: '*.freepik.com',
      },
      {
        protocol: 'https',
        hostname: '*.shutterstock.com',
      },
      {
        protocol: 'https',
        hostname: '*.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
    domains: ["utfs.io", "picsum.photos", "d1csarkz8obe9u.cloudfront.net", "via.placeholder.com", "placeholder.com", "images.unsplash.com", "source.unsplash.com", "cdn.vectorstock.com", "static.vecteezy.com", "lh3.googleusercontent.com"],
  },
  // Proxy API requests to the backend to avoid Mixed Content (HTTPS -> HTTP) and double /api.
  // 2026-09-21: the production fallback below still pointed at
  // facejobalb-... — the ALB from the pre-Lambda ECS setup, destroyed in
  // facejobBackend's API Gateway + Lambda migration (see facejob_infra's
  // DEPLOYMENT_CHECKLIST.md). Same bug as facejob's next.config.js (PR #278
  // there): whenever NEXT_PUBLIC_BACKEND_URL wasn't set on this Amplify app
  // at runtime, every /api/* request rewritten here 500'd. Falls back to
  // the real API Gateway domain now; NEXT_PUBLIC_BACKEND_URL should still
  // be set explicitly in Amplify so this fallback is never load-bearing.
  async rewrites() {
    const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000'
        : 'https://api.facejob.ma');
    const backendUrl = rawBackendUrl.replace(/\/$/, '').replace(/\/api$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  output: 'standalone'
};

module.exports = nextConfig;
