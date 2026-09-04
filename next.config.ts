import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product art is uploaded to Cloudinary from the admin dashboard, so
    // next/image has to be told that host is allowed to be optimised.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
