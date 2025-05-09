import * as dgram from "dgram";

// NextDNS DoH server URL (replace with your profile ID)
const NEXTDNS_URL = "https://dns.nextdns.io/";

// List of domains to resolve using NextDNS (whitelist)
let NEXTDNS_WHITELIST = [
  "javdb.com",
  "example.com",
  "www.aventertainments.com",
  "www.javdatabase.com",
  "pics.dmm.co.jp",
  "www.javlibrary.com",
  "missav.ai",
  "r18.dev",
  // Add any other domains that should be resolved by NextDNS
];

const PORT = 53;

// DNS resolver: NextDNS
async function resolveWithNextDNS(query: Buffer) {
  try {
    const response = await fetch(NEXTDNS_URL, {
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
async function resolveWithCloudflare(query: Buffer) {
  try {
    const response = await fetch(`https://cloudflare-dns.com/dns-query`, {
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
function getHostnameFromQuery(
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

// Handle DNS request
async function handleDnsQuery(msg: Buffer, rinfo: dgram.RemoteInfo) {
  if (!server) {
    return;
  }

  const hostname = getHostnameFromQuery(msg);
  console.log(
    `Received DNS query for: ${hostname} from ${rinfo.address}:${rinfo.port}`
  );

  let response: Buffer | null = null;

  if (NEXTDNS_WHITELIST.includes(hostname)) {
    console.log(`Resolving ${hostname} with NextDNS...`);
    response = await resolveWithNextDNS(msg);
  }

  if (!response) {
    console.log(`Resolving ${hostname} with Cloudflare...`);
    response = await resolveWithCloudflare(msg);
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

let server: dgram.Socket | null = null;

// Exported commands:
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

  // Wire up the event listener once
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

// Function to add a domain to the whitelist
export function addDomainToWhitelist(domain: string): boolean {
  if (!NEXTDNS_WHITELIST.includes(domain)) {
    NEXTDNS_WHITELIST.push(domain);
    return true;
  }
  return false;
}

// Function to remove a domain from the whitelist
export function removeDomainFromWhitelist(domain: string): boolean {
  const index = NEXTDNS_WHITELIST.indexOf(domain);
  if (index !== -1) {
    NEXTDNS_WHITELIST.splice(index, 1);
    return true;
  }
  return false;
}

// Function to get the current whitelist
export function getWhitelist(): string[] {
  return NEXTDNS_WHITELIST;
}
