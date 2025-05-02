/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverExternalPackages: ['puppeteer'],
  },
  images: {
    domains: [
      'chotot.com',
      'cdn.chotot.com',
      'static.chotot.com',
      'scontent.fhan1-1.fna.fbcdn.net',
      'scontent.fhan1-2.fna.fbcdn.net',
      'scontent.fhan1-3.fna.fbcdn.net',
      'scontent.fhan1-4.fna.fbcdn.net',
      'scontent.fhan1-5.fna.fbcdn.net',
      'scontent.fhan1-6.fna.fbcdn.net',
    ],
  },
};

module.exports = nextConfig;
