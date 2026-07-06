import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

function getLocalDevOrigins() {
  return Object.values(networkInterfaces())
    .flatMap((networkInterface) => networkInterface ?? [])
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalDevOrigins(),
};

export default nextConfig;
