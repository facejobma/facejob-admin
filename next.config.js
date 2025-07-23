/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false,
  images: {
    domains: ["picsum.photos", "d1csarkz8obe9u.cloudfront.net"],
  },
  output: 'standalone'
};

module.exports = nextConfig;
