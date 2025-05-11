// src/routes/blacklist.ts
import type { BunRequest } from "bun";
import {
  getBlocklist,
  addDomainToBlocklist,
  removeDomainFromBlocklist,
} from "../dns-proxy/index";

export const blacklistRoute = {
  GET: () => {
    return Response.json({ success: true, data: getBlocklist() });
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

    const added = addDomainToBlocklist(domain);
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

    const removed = removeDomainFromBlocklist(domain);
    return Response.json({
      success: removed,
      message: removed ? "Domain removed" : "Not found",
    });
  },
};