/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  experimental: {
    // Enable if needed for better path resolution
    esmExternals: true,
  },
}

module.exports = nextConfig