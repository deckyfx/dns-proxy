// cache.ts

// cache.ts
let cache: Record<string, { data: any; timestamp: number }> = {};
let CACHE_LIVE_TIME = 10 * 60 * 1000; // Default to 10 minutes

export function setCacheLiveTime(newCacheLiveTime: number) {
  CACHE_LIVE_TIME = newCacheLiveTime;
}

export function flushCache() {
  cache = {}; // Clear all cached data
}

export function cacheResponse(query: string, response: any) {
  cache[query] = {
    data: response,
    timestamp: Date.now(),
  };
}

export function getCachedResponse(query: string) {
  const cached = cache[query];
  if (cached && Date.now() - cached.timestamp < CACHE_LIVE_TIME) {
    return cached.data;
  }
  return null;
}

// Function to check if the cache is still valid based on the timestamp
export function isCacheValid(hostname: string): boolean {
  const cacheEntry = cache[hostname];
  if (!cacheEntry) return false; // No cache entry
  const currentTime = Date.now();
  return currentTime - cacheEntry.timestamp < CACHE_LIVE_TIME;
}
