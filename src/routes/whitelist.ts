// src/routes/whitelist.ts
import type { BunRequest } from "bun";
import {
  getWhitelist,
  addDomainToWhitelist,
  removeDomainFromWhitelist,
} from "../dns-proxy/index";

export const whitelistRoute = {
  GET: () => {
    return Response.json({ success: true, data: getWhitelist() });
  },
  POST: async (req: BunRequest) => {
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
  DELETE: async (req: BunRequest) => {
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
};
