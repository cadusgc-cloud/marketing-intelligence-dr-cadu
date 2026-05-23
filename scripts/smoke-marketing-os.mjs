import { spawnSync } from "node:child_process";

const result = spawnSync("npx tsx scripts/smoke-marketing-os.ts", {
  stdio: "inherit",
  shell: true
});

process.exit(result.status ?? 1);
