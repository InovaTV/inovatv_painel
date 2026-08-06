import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Cobre o maior tipo de arquivo (APK, até 300MB — ver STORAGE.md).
      bodySizeLimit: "300mb",
    },
    // Limite separado do acima: toda requisição passa por src/proxy.ts
    // (Next 16), que tem seu próprio teto de body (default 10MB) — sem
    // isso, o multipart era cortado antes de chegar na Server Action
    // ("Unexpected end of form").
    proxyClientMaxBodySize: "300mb",
  },
};

export default nextConfig;
