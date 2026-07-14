import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

async function log(hypothesisId, message, data) {
  // #region agent log
  await fetch("http://127.0.0.1:7278/ingest/deed2be7-59e8-415a-baa5-5050a8557b83", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "579b69",
    },
    body: JSON.stringify({
      sessionId: "579b69",
      runId: process.env.DEBUG_RUN_ID || "next-build-check",
      hypothesisId,
      location: "scripts/debug-build-output.mjs",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

await log("A", "output directories before Next build", {
  nextExists: existsSync(".next"),
  vinextExists: existsSync(".vinext"),
  node: process.version,
  platform: process.platform,
  arch: process.arch,
});

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: false,
});

const data = {
  status: result.status,
  signal: result.signal,
  nextExists: existsSync(".next"),
  routesManifestExists: existsSync(".next/routes-manifest.json"),
  vinextExists: existsSync(".vinext"),
};

await log("C", "Next build result and output directories", data);
console.log(JSON.stringify(data, null, 2));
process.exit(result.status ?? 1);
