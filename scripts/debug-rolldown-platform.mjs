#!/usr/bin/env node
/**
 * Diagnose Vercel EBADPLATFORM for @rolldown/binding-darwin-arm64
 * Hypotheses:
 * A: direct dep requires darwin/arm64 → fails on linux/x64
 * B: lockfile marks it required (not optional)
 * C: rolldown already has optional platform bindings (direct dep redundant)
 * D: npm treats platform mismatch as hard error for non-optional deps
 * E: removing direct dep allows linux optional binding to resolve
 */
import { appendFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOG = join(ROOT, ".cursor/debug-579b69.log");
const SESSION = "579b69";
const require = createRequire(import.meta.url);

function log(hypothesisId, message, data) {
  // #region agent log
  const payload = {
    sessionId: SESSION,
    runId: process.env.DEBUG_RUN_ID || "pre-fix",
    hypothesisId,
    location: "scripts/debug-rolldown-platform.mjs",
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
      "X-Debug-Session-Id": SESSION,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
  // #endregion
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const lock = JSON.parse(readFileSync(join(ROOT, "package-lock.json"), "utf8"));

const directDep = pkg.dependencies?.["@rolldown/binding-darwin-arm64"];
log("A", "direct dependency present", {
  directDep,
  host: { os: process.platform, arch: process.arch, node: process.version },
  vercelLike: { os: "linux", cpu: "x64" },
});

const lockEntry = lock.packages?.["node_modules/@rolldown/binding-darwin-arm64"];
log("B", "lockfile entry for darwin-arm64 binding", {
  exists: Boolean(lockEntry),
  optional: lockEntry?.optional ?? null,
  version: lockEntry?.version ?? null,
  inRootDeps: Boolean(
    lock.packages?.[""]?.dependencies?.["@rolldown/binding-darwin-arm64"],
  ),
});

let bindingMeta = null;
try {
  bindingMeta = require("@rolldown/binding-darwin-arm64/package.json");
} catch (err) {
  bindingMeta = { error: String(err.message || err) };
}
log("A", "binding package os/cpu constraints", {
  name: bindingMeta?.name,
  version: bindingMeta?.version,
  os: bindingMeta?.os,
  cpu: bindingMeta?.cpu,
  libc: bindingMeta?.libc,
});

let rolldownMeta = null;
try {
  rolldownMeta = require("rolldown/package.json");
} catch (err) {
  rolldownMeta = { error: String(err.message || err) };
}
const optional = rolldownMeta?.optionalDependencies || {};
log("C", "rolldown optionalDependencies (platform bindings)", {
  rolldownVersion: rolldownMeta?.version,
  optionalBindingKeys: Object.keys(optional).filter((k) =>
    k.includes("binding"),
  ),
  hasLinuxX64Gnu: Boolean(optional["@rolldown/binding-linux-x64-gnu"]),
  hasDarwinArm64Optional: Boolean(optional["@rolldown/binding-darwin-arm64"]),
});

// Simulate npm's platform check logic for a required dep
const wantedOs = bindingMeta?.os || ["darwin"];
const wantedCpu = bindingMeta?.cpu || ["arm64"];
const vercelOs = "linux";
const vercelCpu = "x64";
const osOk = !wantedOs || wantedOs.includes(vercelOs);
const cpuOk = !wantedCpu || wantedCpu.includes(vercelCpu);
const wouldFailAsRequired = !(osOk && cpuOk);
log("D", "simulate EBADPLATFORM on Vercel for required dep", {
  wantedOs,
  wantedCpu,
  vercelOs,
  vercelCpu,
  osOk,
  cpuOk,
  wouldFailAsRequired,
  note: "optional deps are skipped; required deps throw EBADPLATFORM",
});

// Dry-run: npm install with --dry-run won't fully simulate platform, but
// we can check if removing the dep leaves install graph healthy via npm ls
const ls = spawnSync("npm", ["ls", "@rolldown/binding-darwin-arm64", "--json"], {
  cwd: ROOT,
  encoding: "utf8",
  shell: false,
});
let lsJson = null;
try {
  lsJson = JSON.parse(ls.stdout || "{}");
} catch {
  lsJson = { parseError: true, stdout: ls.stdout?.slice(0, 200) };
}
log("E", "current install graph for darwin-arm64 binding", {
  status: ls.status,
  version: lsJson?.dependencies?.["@rolldown/binding-darwin-arm64"]?.version,
  extraneous: lsJson?.dependencies?.["@rolldown/binding-darwin-arm64"]?.extraneous,
  problems: lsJson?.problems?.slice?.(0, 5) ?? lsJson?.problems,
});

console.log(
  JSON.stringify(
    {
      directDep,
      inRootDeps: Boolean(
        lock.packages?.[""]?.dependencies?.["@rolldown/binding-darwin-arm64"],
      ),
      wouldFailOnVercelAsRequiredRootDep: Boolean(directDep),
      hasLinuxOptional: Boolean(optional["@rolldown/binding-linux-x64-gnu"]),
      bindingConstraints: { os: bindingMeta?.os, cpu: bindingMeta?.cpu },
    },
    null,
    2,
  ),
);

log("E", "post-check vercel risk", {
  directDep: directDep ?? null,
  wouldFailOnVercelAsRequiredRootDep: Boolean(directDep),
  linuxDryRunHint: "use: npm install --os=linux --cpu=x64 --dry-run",
});
