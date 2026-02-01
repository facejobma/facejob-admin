/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false,
  images: {
    remotePatterns: [
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
      }
    ],
    // Fallback pour la compatibilité
    domains: ["picsum.photos", "d1csarkz8obe9u.cloudfront.net", "via.placeholder.com", "placeholder.com", "images.unsplash.com", "source.unsplash.com", "cdn.vectorstock.com", "static.vecteezy.com"],
  },
  output: 'standalone'
};

module.exports = nextConfig;
