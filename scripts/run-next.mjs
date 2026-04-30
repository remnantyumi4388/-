import { rmSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const mode = process.argv[2] ?? "dev";
const extraArgs = process.argv.slice(3);
const distDir = mode === "dev" ? ".next-dev" : ".next";

if (!["dev", "build", "start"].includes(mode)) {
  console.error(`Unknown Next.js mode: ${mode}`);
  process.exit(1);
}

if (mode !== "start") {
  rmSync(distDir, { recursive: true, force: true });
}

const defaultDevArgs = mode === "dev" && extraArgs.length === 0 ? ["-H", "127.0.0.1", "-p", "3000"] : [];
const nextBin = join("node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, mode, ...defaultDevArgs, ...extraArgs], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_DIST_DIR: distDir,
    NEXT_TELEMETRY_DISABLED: "1"
  }
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
