// resolver.ts

import { NEXTDNS_ID } from "./dns-proxy"; // Import NEXTDNS_ID from dns-proxy.ts

// DNS resolver: NextDNS
export async function resolveWithNextDNS(query: Buffer) {
  try {
    const url = `https://dns.nextdns.io/${NEXTDNS_ID}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/dns-message",
      },
      body: query,
    });

    const result = await response.arrayBuffer();
    return Buffer.from(result);
  } catch (error) {
    console.error("Error resolving DNS with NextDNS:", error);
    return null;
  }
}

// DNS resolver: Cloudflare fallback
export async function resolveWithCloudflare(query: Buffer) {
  try {
    const response = await fetch("https://cloudflare-dns.com/dns-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/dns-message",
        accept: "application/dns-json",
      },
      body: query,
    });

    const result = await response.arrayBuffer();
    return Buffer.from(result);
  } catch (error) {
    console.error("Error resolving DNS with Cloudflare:", error);
    return null;
  }
}

// Extract hostname from DNS query
export function getHostnameFromQuery(
  query: Buffer,
  offset = 12,
  visitedOffsets = new Set<number>()
): string {
  let labels: string[] = [];

  while (offset < query.length) {
    const length = query[offset];
    if (length === undefined) break;

    if (length === 0) break;

    // Compression pointer
    if ((length & 0b11000000) === 0b11000000) {
      const nextByte = query[offset + 1];
      if (nextByte === undefined) break;

      const pointer = ((length & 0b00111111) << 8) | nextByte;

      // Prevent infinite loop
      if (visitedOffsets.has(pointer)) break;
      visitedOffsets.add(pointer);

      labels.push(getHostnameFromQuery(query, pointer, visitedOffsets));
      break;
    } else {
      offset++;
      if (offset + length > query.length) break;

      const label = query.slice(offset, offset + length).toString();
      labels.push(label);
      offset += length;
    }
  }

  return labels.join(".");
}
