import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@namhastro/shared"],
  reactStrictMode: true,
};

export default nextConfig;
