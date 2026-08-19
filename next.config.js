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
  // Proxy API requests to backend ALB to avoid Mixed Content (HTTPS -> HTTP) and double /api
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://facejobalb-1619101788.eu-west-3.elb.amazonaws.com/api/:path*',
      },
    ];
  },
  output: 'standalone'
};

module.exports = nextConfig;
