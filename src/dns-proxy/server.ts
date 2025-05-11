// server.ts

import * as dgram from "dgram";
import { handleDnsQuery } from "./dns-proxy";

const PORT = Number(process.env.DNS_DGRAM_PORT) || 53;

// Server management
export let server: dgram.Socket | null = null;

export function startProxy() {
  if (server) {
    console.log("Server already running.");
    return;
  }

  server = dgram.createSocket("udp4");

  server.on("listening", () => {
    if (!server) {
      return;
    }
    const address = server.address();
    console.log(`Server listening on ${address.address}:${address.port}`);
  });

  server.on("message", handleDnsQuery);

  server.bind(PORT, () => {
    console.log(`DNS server started on port ${PORT}`);
  });
}

export function stopProxy() {
  if (!server) {
    console.log("DNS proxy is not running");
    return;
  }

  console.log("Stopping DNS proxy...");
  server.close(() => {
    console.log("Server stopped.");
    server = null;
  });
}

export function restartProxy() {
  stopProxy();
  setTimeout(() => {
    startProxy();
  }, 1000);
}

export function isRunning() {
  return server !== null;
}
