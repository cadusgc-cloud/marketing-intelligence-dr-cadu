import { spawnSync } from "node:child_process";

const args = process.argv.slice(2).map((arg) => JSON.stringify(arg)).join(" ");
const result = spawnSync(`npx tsx scripts/release-readiness-v9-check.ts ${args}`.trim(), {
  stdio: "inherit",
  shell: true
});

process.exit(result.status ?? 1);
