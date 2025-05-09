// src/routes/status.ts
import { isRunning } from "../dns-proxy/index";

export const statusRoute = {
  GET: () => {
    return Response.json({ running: isRunning() });
  },
};
