export interface Config {
  FRONTEND_PORT: number;
  DNS_DGRAM_PORT: number;
  DEV_MODE: boolean;
}

export function loadConfig(): Config {
  const frontendPort = process.env.FRONTEND_PORT
    ? parseInt(process.env.FRONTEND_PORT, 10)
    : 3000;

  const dnsDgramPort = process.env.DNS_DGRAM_PORT
    ? parseInt(process.env.DNS_DGRAM_PORT, 10)
    : 53;

  const devMode = process.env.DEV_MODE === "true";

  return {
    FRONTEND_PORT: frontendPort,
    DNS_DGRAM_PORT: dnsDgramPort,
    DEV_MODE: devMode,
  };
}

