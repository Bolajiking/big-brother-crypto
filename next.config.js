/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in production to avoid the missing sourcemap error
  productionBrowserSourceMaps: false,
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable source maps in development to prevent the error
      config.devtool = false;
    }
    return config;
  },
};

module.exports = nextConfig;
