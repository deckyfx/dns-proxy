// src/routes/stop.ts
import { stopProxy } from "../dns-proxy/index";

export const stopRoute = {
  POST: () => {
    stopProxy();
    return Response.json({ status: "stopped" });
  },
};
