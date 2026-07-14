#!/usr/bin/env node
import { appendFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOG = join(ROOT, ".cursor/debug-579b69.log");

function log(hypothesisId, message, data) {
  // #region agent log
  const payload = {
    sessionId: "579b69",
    runId: process.env.DEBUG_RUN_ID || "verify",
    hypothesisId,
    location: "scripts/verify-vercel-install.mjs",
    message,
    data,
    timestamp: Date.now(),
  };
  mkdirSync(dirname(LOG), { recursive: true });
  appendFileSync(LOG, JSON.stringify(payload) + "\n");
  fetch("http://127.0.0.1:7278/ingest/deed2be7-59e8-415a-baa5-5050a8557b83", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "579b69",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
  // #endregion
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const lock = JSON.parse(readFileSync(join(ROOT, "package-lock.json"), "utf8"));
const rootDeps = lock.packages?.[""]?.dependencies || {};
const hasDirectDarwin = Boolean(
  pkg.dependencies?.["@rolldown/binding-darwin-arm64"] ||
    rootDeps["@rolldown/binding-darwin-arm64"],
);
const lockPkg = lock.packages?.["node_modules/@rolldown/binding-darwin-arm64"];

log("A", "root dependency check", {
  hasDirectDarwin,
  packageJsonDeps: Object.keys(pkg.dependencies || {}),
  lockRootHasDarwin: Boolean(rootDeps["@rolldown/binding-darwin-arm64"]),
  lockDarwinEntry: lockPkg
    ? { version: lockPkg.version, optional: lockPkg.optional ?? false }
    : null,
});

// Real install into temp dir simulating Vercel linux/x64
const tmp = join(ROOT, ".cursor/vercel-linux-install-sim");
spawnSync("rm", ["-rf", tmp], { cwd: ROOT });
mkdirSync(tmp, { recursive: true });
spawnSync("cp", ["package.json", "package-lock.json", tmp], { cwd: ROOT });

const install = spawnSync(
  "npm",
  ["ci", "--os=linux", "--cpu=x64", "--ignore-scripts"],
  {
    cwd: tmp,
    encoding: "utf8",
    env: { ...process.env, npm_config_os: "linux", npm_config_cpu: "x64" },
  },
);

const combined = `${install.stdout || ""}\n${install.stderr || ""}`;
const hasEbad = /EBADPLATFORM|binding-darwin-arm64/.test(combined);
log("B", "linux/x64 npm ci result", {
  status: install.status,
  hasEbadPlatform: hasEbad,
  stderrTail: (install.stderr || "").slice(-800),
  stdoutTail: (install.stdout || "").slice(-400),
});

console.log(
  JSON.stringify(
    {
      hasDirectDarwin,
      linuxCiStatus: install.status,
      hasEbadPlatform: hasEbad,
    },
    null,
    2,
  ),
);

spawnSync("rm", ["-rf", tmp], { cwd: ROOT });
process.exit(hasEbad || install.status !== 0 ? 1 : 0);
