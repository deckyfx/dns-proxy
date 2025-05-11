import path from "node:path";

import { loadConfig } from "./config";

import { startRoute } from "./routes/start";
import { stopRoute } from "./routes/stop";
import { restartRoute } from "./routes/restart";
import { statusRoute } from "./routes/status";
import { whitelistRoute } from "./routes/whitelist";
import { blacklistRoute } from "./routes/blacklist"; // Import the blacklist route
import { cacheRoute } from "./routes/cache"; // Import the cache route
import { testDomainRoute } from "./routes/test-domain";

const config = loadConfig();
Bun.serve({
  port: config.FRONTEND_PORT,
  development: true,

  routes: {
    "/api/start": startRoute,
    "/api/stop": stopRoute,
    "/api/restart": restartRoute,
    "/api/status": statusRoute,
    "/api/whitelist": whitelistRoute,

    // Blacklist Route
    "/api/blacklist": blacklistRoute,

    // Test Route
    "/api/test-domain": { POST: testDomainRoute },

    // Cache Routes
    "/api/cache/setCacheLiveTime": cacheRoute.POST["/setCacheLiveTime"],
    "/api/cache/flushCache": cacheRoute.POST["/flushCache"],

    // New cache-related routes for list and deletion
    "/api/cache/cacheList": cacheRoute.GET["/cacheList"], // Get list of cached entries
    "/api/cache/:domain": cacheRoute.DELETE["/cache/:domain"], // Delete specific cache entry

    // Optional: serve your frontend
    "/": {
      GET: async () => {
        const html = await Bun.file(
          path.join(__dirname, "..", "public", "index.html")
        ).text();
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      },
    },

    // Static assets (JS, CSS, etc)
    "/:file*": {
      GET: async (req) => {
        const url = new URL(req.url);
        const filePath = url.pathname;

        const file = Bun.file(path.join(__dirname, "..", "public", filePath));

        if (await file.exists()) {
          return new Response(file);
        } else {
          return new Response("Not Found", { status: 404 });
        }
      },
    },
  },

  // Fallback (optional)
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});


console.log(`Server running at http://localhost:${config.FRONTEND_PORT}`);
