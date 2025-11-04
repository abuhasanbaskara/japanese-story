import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-2cb00cd498db403f87493524abf2de89.r2.dev",
        port: "",
        pathname: "/**",
      },
      // Keep old hostname for backward compatibility (can be removed later)
      {
        protocol: "https",
        hostname: "7f72e5725723b730914022716eb32164.r2.cloudflarestorage.com",
        port: "",
        pathname: "/**",
      },
      // Add your custom domain here when configured for production
      // Example:
      // {
      //   protocol: "https",
      //   hostname: "your-custom-domain.com",
      //   port: "",
      //   pathname: "/**",
      // },
    ],
  },
};

export default nextConfig;
