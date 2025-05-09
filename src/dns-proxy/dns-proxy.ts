import dgram from "dgram";

import {
  resolveWithNextDNS,
  resolveWithCloudflare,
  getHostnameFromQuery,
} from "./resolver";
import { cacheResponse, getCachedResponse, isCacheValid } from "./cache";
import { NEXTDNS_WHITELIST } from "./whitelist";
import { server } from "./server";

// NEXTDNS_ID management
export let NEXTDNS_ID = ""; // initially empty

export function setNextdnsId(id: string) {
  NEXTDNS_ID = id;
}

// Handle DNS query
export async function handleDnsQuery(msg: Buffer, rinfo: dgram.RemoteInfo) {
  if (!server) {
    return;
  }
  const hostname = getHostnameFromQuery(msg);
  console.log(
    `Received DNS query for: ${hostname} from ${rinfo.address}:${rinfo.port}`
  );

  let response: Buffer | null = null;

  // Check cache first
  if (isCacheValid(hostname)) {
    console.log(`Serving cached response for ${hostname}`);
    response = getCachedResponse(hostname); // Serve cached result
  }

  if (!response) {
    // Resolve DNS from whitelist or fallback to Cloudflare
    if (NEXTDNS_WHITELIST.includes(hostname)) {
      console.log(`Resolving ${hostname} with NextDNS...`);
      response = await resolveWithNextDNS(msg);
    }

    if (!response) {
      console.log(`Resolving ${hostname} with Cloudflare...`);
      response = await resolveWithCloudflare(msg);
    }

    // Cache the resolved response
    if (response) {
      console.log(`Caching response for ${hostname}`);
      cacheResponse(hostname, response);
    }
  }

  if (response) {
    server.send(
      response,
      0,
      response.length,
      rinfo.port,
      rinfo.address,
      (err) => {
        if (err) {
          console.error("Error sending DNS response:", err);
        } else {
          console.log(`Sent DNS response to ${rinfo.address}:${rinfo.port}`);
        }
      }
    );
  } else {
    console.error("Failed to resolve DNS query for", hostname);
  }
}
