/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/folders',
        destination: "/folders/0",
        permanent: true,
      }
    ]
  },
  headers: () => [
    {
      source: '/folders/:inode_id',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store'
        }
      ]
    }
  ],
  webpack: (config) => {
    config.externals.push({
      canvas: "commonjs canvas",
    })
    return config
    }
}

module.exports = nextConfig
