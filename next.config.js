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
  }
}

module.exports = nextConfig
