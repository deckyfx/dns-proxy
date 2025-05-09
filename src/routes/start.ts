// src/routes/start.ts
import type { BunRequest } from "bun";

import { setNextdnsId, startProxy } from "../dns-proxy/index";

export const startRoute = {
  POST: async (req: BunRequest) => {
    const body = await req.json();
    const id = body.id;

    if (typeof id !== "string" || !id) {
      return Response.json(
        { success: false, message: "NextDNS ID is required" },
        { status: 400 }
      );
    }

    setNextdnsId(id);
    startProxy();
    return Response.json({ success: true });
  },
};
