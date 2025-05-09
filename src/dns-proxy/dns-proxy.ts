import dgram from "dgram";

import {
  resolveWithNextDNS,
  resolveWithCloudflare,
  getHostnameFromQuery,
  extractAnswerIP, // ⬅️ New helper
} from "./resolver";
import { cacheResponse, getCachedResponse } from "./cache";
import { NEXTDNS_WHITELIST } from "./whitelist";
import { server } from "./server";

export let NEXTDNS_ID = ""; // initially empty

export function setNextdnsId(id: string) {
  NEXTDNS_ID = id;
}

// Handle DNS query
export async function handleDnsQuery(msg: Buffer, rinfo: dgram.RemoteInfo) {
  if (!server) return;

  const hostname = getHostnameFromQuery(msg);
  console.log(
    `Received DNS query for: ${hostname} from ${rinfo.address}:${rinfo.port}`
  );

  let response: Buffer | null = null;
  let resolvedBy = ""; // Will track which resolver answered
  let resolvedIp = ""; // Will track the resolved IP

  // ✅ Check cache first
  const cachedResponse = getCachedResponse(hostname);
  if (cachedResponse) {
    console.log(`Serving cached response for ${hostname}`);
    response = cachedResponse.data;
    resolvedBy = "Cache";
    resolvedIp = cachedResponse.resolvedTo; // Use the cached resolved IP
  }

  if (!response) {
    // ✅ Try NextDNS if whitelisted
    if (NEXTDNS_WHITELIST.includes(hostname)) {
      console.log(`Resolving ${hostname} with NextDNS...`);
      response = await resolveWithNextDNS(msg);
      resolvedBy = "NextDNS";
    }

    // ✅ Else fallback to Cloudflare
    if (!response) {
      console.log(`Resolving ${hostname} with Cloudflare...`);
      response = await resolveWithCloudflare(msg);
      resolvedBy = "Cloudflare";
    }

    // ✅ Extract resolved IP from response (optional)
    if (response) {
      resolvedIp = extractAnswerIP(response) || "unknown";
      console.log(`Caching response for ${hostname} (${resolvedIp})`);

      // Store the result with the resolved IP in cache immediately
      cacheResponse(hostname, response, {
        resolvedTo: resolvedIp,
        resolvedBy,
      });
    }
  }

  // ✅ Send back the DNS response
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
