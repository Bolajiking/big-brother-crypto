/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in production to avoid the missing sourcemap error
  productionBrowserSourceMaps: false,
  
  // Experimental features for better Turbopack support
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
  },
  
  // Webpack configuration (only applies when not using Turbopack)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable source maps in development to prevent the error
      config.devtool = false;
    }
    return config;
  },
};

module.exports = nextConfig;
