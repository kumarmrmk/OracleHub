import type { NextConfig } from "next";
import { networkInterfaces } from "os";

/**
 * Collect the machine's non-internal IPv4 addresses so `next dev` accepts
 * requests coming in over the local network (e.g. testing from a phone via
 * the computer's LAN IP). Without this, Next.js dev blocks cross-origin
 * requests to internal assets and returns 403, so the page renders but never
 * hydrates — visible icons, but nothing is clickable.
 */
function getLanAddresses(): string[] {
  const addresses: string[] = [];
  for (const ifaces of Object.values(networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getLanAddresses(),
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  devIndicators: false,
};

export default nextConfig;