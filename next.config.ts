import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Cobre o maior tipo de arquivo (APK, até 300MB — ver STORAGE.md).
      bodySizeLimit: "300mb",
    },
  },
};

export default nextConfig;
