// src/routes/cache.ts
import type { BunRequest } from "bun";

import { setCacheLiveTime, flushCache } from "../dns-proxy";

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

      setCacheLiveTime(cacheLiveTime); // Update the cache live time
      return Response.json({ success: true });
    },

    "/flushCache": () => {
      flushCache(); // Clear the cache
      return Response.json({
        success: true,
        message: "Cache flushed successfully",
      });
    },
  },
};
