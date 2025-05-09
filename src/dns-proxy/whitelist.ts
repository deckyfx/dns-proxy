// whitelist.ts

export let NEXTDNS_WHITELIST = [
  "javdb.com",
  "example.com",
  "www.aventertainments.com",
  "www.javdatabase.com",
  "pics.dmm.co.jp",
  "www.javlibrary.com",
  "missav.ai",
  "r18.dev",
];

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
