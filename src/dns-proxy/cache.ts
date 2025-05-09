// src/dns-proxy/cache.ts

let cache: Record<
  string,
  {
    data: any;
    timestamp: number;
    resolvedTo: string;
    resolvedBy: string;
  }
> = {};
let CACHE_LIVE_TIME = 10 * 60 * 1000; // 10 minutes

export function setCacheLiveTime(newCacheLiveTime: number) {
  CACHE_LIVE_TIME = newCacheLiveTime;
}

export function flushCache() {
  cache = {};
}

export function cacheResponse(
  query: string,
  data: any,
  { resolvedTo, resolvedBy }: { resolvedTo: string; resolvedBy: string }
) {
  const cached = cache[query];
  if (cached) {
    cached.data = data;
    if (resolvedTo !== "unknown") {
      cached.resolvedTo = resolvedTo;
    }
    cache[query] = cached;
    return;
  }
  cache[query] = {
    data,
    resolvedTo, // Store the resolved IP address
    resolvedBy, // Store which resolver was used
    timestamp: Date.now(),
  };
}

export function getCachedResponse(query: string) {
  const cached = cache[query];
  if (cached && Date.now() - cached.timestamp < CACHE_LIVE_TIME) {
    return cached; // Return the full cache entry
  }
  return null;
}

export function isCacheValid(hostname: string): boolean {
  const cacheEntry = cache[hostname];
  if (!cacheEntry) return false; // No cache entry
  const currentTime = Date.now();
  return currentTime - cacheEntry.timestamp < CACHE_LIVE_TIME;
}

// New: List cache entries
export function getCacheList() {
  return Object.entries(cache).map(([domain, entry]) => ({
    domain,
    resolvedAt: new Date(entry.timestamp).toISOString(),
    resolvedTo: entry.resolvedTo,
    resolvedBy: entry.resolvedBy,
  }));
}

// New: Delete single cache entry
export function deleteCacheEntry(domain: string) {
  delete cache[domain];
}
