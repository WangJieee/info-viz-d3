/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable default image optimization
  },
  assetPrefix: isProd ? '/info-viz-d3/' : '',
  basePath: isProd ? '/info-viz-d3' : '',
  output: 'export'
};

export default nextConfig;
