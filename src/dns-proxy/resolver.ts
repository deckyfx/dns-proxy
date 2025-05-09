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

// resolver.ts

// ⬇️ New Helper: Extract Answer IP from DNS response buffer
export function extractAnswerIP(response: Buffer | undefined): string | null {
  if (!response) return null; // Return null if response is undefined or empty

  // Skip DNS Header (12 bytes) and Question section
  let offset = 12;

  // Skip Question Name
  while (offset < response.length) {
    const length = response[offset];

    // Ensure that `length` is a valid value (it must be between 0 and 255)
    if (length === undefined || length === 0) break;

    offset += length + 1;
  }
  
  offset += 5; // Skip null byte, QTYPE, and QCLASS

  // Ensure we're within bounds before accessing the Answer section
  if (offset + 12 > response.length) return null;

  // Now at Answer section
  // Read TYPE (2 bytes) — looking for Type A (0x0001)
  const type = response.readUInt16BE(offset + 2);
  if (type !== 1) return null; // Only handle IPv4

  // Read Data length
  const dataLen = response.readUInt16BE(offset + 10);
  if (dataLen !== 4) return null; // Only handle 4-byte IPv4

  const ipOffset = offset + 12;

  // Ensure we're within bounds before accessing IP data
  if (ipOffset + 3 >= response.length) return null;

  const ip = `${response[ipOffset]}.${response[ipOffset + 1]}.${
    response[ipOffset + 2]
  }.${response[ipOffset + 3]}`;
  return ip;
}
