import path from "node:path";
import {
  startProxy,
  stopProxy,
  restartProxy,
  isRunning,
  getWhitelist,
  addDomainToWhitelist,
  removeDomainFromWhitelist,
} from "./dns-proxy";

Bun.serve({
  port: 3000,
  development: true,

  routes: {
    "/api/start": {
      POST: () => {
        startProxy();
        return Response.json({ status: "started" });
      },
    },

    "/api/stop": {
      POST: () => {
        stopProxy();
        return Response.json({ status: "stopped" });
      },
    },

    "/api/restart": {
      POST: () => {
        restartProxy();
        return Response.json({ status: "restarted" });
      },
    },

    "/api/status": {
      GET: () => {
        return Response.json({ running: isRunning() });
      },
    },

    "/api/whitelist": {
      GET: () => {
        return Response.json({ success: true, data: getWhitelist() });
      },
      POST: async (req) => {
        const body = await req.json();
        const domain = body.domain;
        if (typeof domain !== "string" || !domain) {
          return Response.json(
            { success: false, message: "Invalid domain" },
            { status: 400 }
          );
        }

        const added = addDomainToWhitelist(domain);
        return Response.json({
          success: added,
          message: added ? "Domain added" : "Already exists",
        });
      },
      DELETE: async (req) => {
        const body = await req.json();
        const domain = body.domain;
        if (typeof domain !== "string" || !domain) {
          return Response.json(
            { success: false, message: "Invalid domain" },
            { status: 400 }
          );
        }

        const removed = removeDomainFromWhitelist(domain);
        return Response.json({
          success: removed,
          message: removed ? "Domain removed" : "Not found",
        });
      },
    },

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

console.log("Server running at http://localhost:3000");
