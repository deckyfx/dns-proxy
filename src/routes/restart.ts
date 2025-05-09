// src/routes/restart.ts
import { restartProxy } from "../dns-proxy/index";

export const restartRoute = {
  POST: () => {
    restartProxy();
    return Response.json({ status: "restarted" });
  },
};
