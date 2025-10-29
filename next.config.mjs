const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure PDF.js worker can be loaded
      config.resolve.alias.canvas = false
      config.resolve.alias.encoding = false
    }
    return config
  },
}

export default nextConfig
