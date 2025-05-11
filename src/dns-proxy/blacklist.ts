// src/dns-proxy/blacklist.ts

export let BLOCK_LIST: string[] = [];

/**
 * Adds a domain to the blocklist.
 * @param domain The domain to add.
 * @returns true if the domain was added, false if it was already in the list.
 */
export function addDomainToBlocklist(domain: string): boolean {
  if (!BLOCK_LIST.includes(domain)) {
    BLOCK_LIST.push(domain);
    return true;
  }
  return false;
}

/**
 * Removes a domain from the blocklist.
 * @param domain The domain to remove.
 * @returns true if the domain was removed, false if it was not found in the list.
 */
export function removeDomainFromBlocklist(domain: string): boolean {
  const index = BLOCK_LIST.indexOf(domain);
  if (index !== -1) {
    BLOCK_LIST.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Gets the current blocklist.
 * @returns The array of domains in the blocklist.
 */
export function getBlocklist(): string[] {
  return BLOCK_LIST;
}