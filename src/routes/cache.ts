// src/routes/cache.ts
import type { BunRequest } from "bun";
import {
  setCacheLiveTime,
  flushCache,
  getCacheList,
  deleteCacheEntry,
} from "../dns-proxy/cache";

export const cacheRoute = {
  POST: {
    "/setCacheLiveTime": async (req: BunRequest) => {
      const body = await req.json();
      const cacheLiveTime = body.cacheLiveTime;

      if (typeof cacheLiveTime !== "number" || cacheLiveTime <= 0) {
        return Response.json(
          { success: false, message: "Invalid cache live time" },
          { status: 400 }
        );
      }

      setCacheLiveTime(cacheLiveTime);
      return Response.json({ success: true });
    },

    "/flushCache": () => {
      flushCache();
      return Response.json({
        success: true,
        message: "Cache flushed successfully",
      });
    },
  },

  GET: {
    "/cacheList": () => {
      const list = getCacheList();
      return Response.json({ success: true, data: list });
    },
  },

  DELETE: {
    "/cache/:domain": (req: BunRequest) => {
      const { domain } = req.params as { domain: string };
      deleteCacheEntry(domain);
      return Response.json({
        success: true,
        message: `${domain} removed from cache.`,
      });
    },
  },
};
