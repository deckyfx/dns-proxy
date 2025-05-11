import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from './src/config';

const envShimPath = path.resolve(__dirname, path.join("src", "frontend", "env-shim.ts"));

// Generate env-shim.ts content
const content = `
export const process = {
  env: ${JSON.stringify(loadConfig())},
};
`;

// Write the content to env-shim.ts
fs.writeFileSync(envShimPath, content, 'utf8');
console.log('env-shim.ts generated successfully!');