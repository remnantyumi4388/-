import { rmSync } from "node:fs";

for (const target of [".next", ".next-dev", "dev-server.log", "dev-server.err"]) {
  rmSync(target, { recursive: true, force: true });
}

console.log("Cleaned Next.js cache and local dev logs.");
