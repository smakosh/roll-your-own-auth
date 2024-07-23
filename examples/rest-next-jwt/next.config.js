/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_AUTH_API}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
