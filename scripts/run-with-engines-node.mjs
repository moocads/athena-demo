#!/usr/bin/env node
/**
 * Runs a command under a Node that satisfies package engines / .nvmrc.
 * When the shell Node is too old (e.g. nvm default 20), re-launches using
 * the matching nvm binary and prepends its bin dir to PATH.
 */
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";
import { homedir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOG_PATH = join(ROOT, ".cursor/debug-579b69.log");
const SESSION = "579b69";
const MIN_MAJOR = 22;
const MIN_MINOR = 13;

function debugLog(hypothesisId, message, data) {
  // #region agent log
  const payload = {
    sessionId: SESSION,
    runId: process.env.DEBUG_RUN_ID || "ensure-node",
    hypothesisId,
    location: "scripts/run-with-engines-node.mjs",
    message,
    data,
    timestamp: Date.now(),
  };
  try {
    mkdirSync(dirname(LOG_PATH), { recursive: true });
    appendFileSync(LOG_PATH, JSON.stringify(payload) + "\n");
  } catch {
    /* ignore */
  }
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

function parseVersion(v) {
  const [major = 0, minor = 0, patch = 0] = String(v)
    .replace(/^v/, "")
    .split(".")
    .map((n) => Number.parseInt(n, 10) || 0);
  return { major, minor, patch };
}

function satisfies(version) {
  const { major, minor } = parseVersion(version);
  if (major > MIN_MAJOR) return true;
  if (major < MIN_MAJOR) return false;
  return minor >= MIN_MINOR;
}

function readNvmrc() {
  const path = join(ROOT, ".nvmrc");
  if (!existsSync(path)) return "22.14.0";
  return readFileSync(path, "utf8").trim() || "22.14.0";
}

function resolveNvmNodeSync(wanted) {
  const nvmDir = process.env.NVM_DIR || join(homedir(), ".nvm");
  const candidates = [
    join(nvmDir, "versions/node", `v${wanted}`, "bin/node"),
    join(nvmDir, "versions/node", wanted, "bin/node"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  const versionsDir = join(nvmDir, "versions/node");
  if (!existsSync(versionsDir)) return null;
  try {
    const dirs = readdirSync(versionsDir)
      .filter((d) => /^v22\./.test(d))
      .sort((a, b) => {
        const pa = parseVersion(a);
        const pb = parseVersion(b);
        return pb.major - pa.major || pb.minor - pa.minor || pb.patch - pa.patch;
      });
    for (const d of dirs) {
      const bin = join(versionsDir, d, "bin/node");
      if (existsSync(bin) && satisfies(d)) return bin;
    }
  } catch {
    /* ignore */
  }
  return null;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/run-with-engines-node.mjs <command> [args...]");
  process.exit(1);
}

const current = process.version;
const wanted = readNvmrc();
const alreadyOk = satisfies(current);

debugLog("A", "engines check", {
  current,
  wanted,
  alreadyOk,
  execPath: process.execPath,
  arch: process.arch,
});

let nodeBin = process.execPath;
let reexec = false;

if (!alreadyOk) {
  const nvmNode = resolveNvmNodeSync(wanted);
  debugLog("B", "resolve nvm node for engines", {
    wanted,
    nvmNode,
    found: Boolean(nvmNode),
  });
  if (!nvmNode) {
    console.error(
      `[engines] Need Node >=${MIN_MAJOR}.${MIN_MINOR}.0 (current ${current}).\n` +
        `Install and select it with:\n` +
        `  nvm install ${wanted} && nvm use\n` +
        `(this project pins ${wanted} in .nvmrc)`,
    );
    process.exit(1);
  }
  const probe = spawnSync(nvmNode, ["-e", "console.log(process.version)"], {
    encoding: "utf8",
  });
  const probed = (probe.stdout || "").trim();
  if (!satisfies(probed)) {
    console.error(`[engines] Found ${nvmNode} but version ${probed} is still too old.`);
    process.exit(1);
  }
  nodeBin = nvmNode;
  reexec = true;
  console.error(`[engines] Switching from ${current} → ${probed}`);
}

debugLog("A", "launch command", {
  nodeBin,
  reexec,
  args,
  arch: process.arch,
});

const env = { ...process.env };
if (reexec) {
  const binDir = dirname(nodeBin);
  env.PATH = `${binDir}${env.PATH ? `:${env.PATH}` : ""}`;
}

const child = spawn(args[0], args.slice(1), {
  stdio: "inherit",
  env,
  shell: false,
});

child.on("exit", (code, signal) => {
  debugLog("A", "child exit", { code, signal, reexec, nodeBin });
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (err) => {
  console.error(`[engines] Failed to start ${args[0]}:`, err.message);
  process.exit(1);
});
