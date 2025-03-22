/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable default image optimization
  },
  assetPrefix: '/info-viz-d3/',
  basePath: '/info-viz-d3',
  output: 'export'
};

export default nextConfig;
