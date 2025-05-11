import dgram from "dgram";

import {
  resolveWithNextDNS,
  resolveWithCloudflare,
  getHostnameFromQuery,
  extractAnswerIP, // ⬅️ New helper
} from "./resolver";
import { cacheResponse, getCachedResponse } from "./cache";
import { BLOCK_LIST } from "./blacklist"; // Import BLOCK_LIST
import { NEXTDNS_WHITELIST } from "./whitelist";
import { server } from "./server";

export let NEXTDNS_ID = ""; // initially empty

export function setNextdnsId(id: string) {
  NEXTDNS_ID = id;
}

// Handle DNS query
export async function handleDnsQuery(msg: Buffer, rinfo: dgram.RemoteInfo) {
  if (!server) return;

  // Ensure message is at least 2 bytes to read the transaction ID
  if (msg.length < 2) {
    console.error(`Received invalid DNS query from ${rinfo.address}:${rinfo.port}: message too short (${msg.length} bytes).`);
    return;
  }

  const hostname = getHostnameFromQuery(msg);
  console.log(
    `Received DNS query for: ${hostname} from ${rinfo.address}:${rinfo.port}`
  );

  let response: Buffer | null = null;
  let resolvedBy = ""; // Will track which resolver answered
  let resolvedIp = ""; // Will track the resolved IP

  // ❌ Check blocklist first
  if (BLOCK_LIST.includes(hostname)) {
    console.log(`Domain ${hostname} is in blocklist. Sending unresolved response.`);
    // Craft a DNS response indicating NXDOMAIN (No Such Domain)
    // This is a simplified example, a proper DNS library would be better
    // for crafting complex responses. This response signifies that the domain
    // does not exist.
    const blockedResponse = Buffer.from([ 
      msg[0]!, msg[1]!, // Keep original transaction ID
      0x81, 0x83, // Flags: Response, Opcode: QUERY, Authoritative: No, Truncated: No, Recursion Desired: Yes, Recursion Available: Yes, Rcode: NXDOMAIN (3)
      0x00, 0x00, // Question Count
      0x00, 0x00, // Answer Record Count
      0x00, 0x00, // Authority Record Count
      0x00, 0x00, // Additional Record Count
      // The original question section should follow, but for a basic NXDOMAIN
      // response where the client shouldn't retry, just sending the header might suffice
      // depending on the client implementation. A full implementation would copy the question section.
    ]);
    response = blockedResponse;
  }

  // ✅ Check cache first
  const cachedResponse = getCachedResponse(hostname);
  if (cachedResponse) {
    console.log(`Serving cached response for ${hostname}`);
    response = cachedResponse.data;
    resolvedBy = "Cache";
    resolvedIp = cachedResponse.resolvedTo; // Use the cached resolved IP
  }

  if (!response) {
    // ✅ Try NextDNS if whitelisted (only if not blocked)
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
