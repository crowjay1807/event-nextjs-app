/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/event-nextjs-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/event-nextjs-app/' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
