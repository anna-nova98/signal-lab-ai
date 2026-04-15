/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/grafana/:path*',
        destination: `${process.env.GRAFANA_INTERNAL_URL || 'http://grafana:3000'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
