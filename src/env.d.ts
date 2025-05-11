declare namespace NodeJS {
  interface ProcessEnv {
    FRONTEND_PORT?: string;
    DNS_DGRAM_PORT?: string;
    DEV_MODE?: string;
  }
}