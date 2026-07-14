#!/usr/bin/env node
/**
 * Debug probe for vinext glob import failure.
 * Hypotheses:
 * A: Node < 22 so fs.promises.glob is missing
 * B: Wrong node binary / PATH (not the engines-required Node)
 * C: vinext version expects Node 22+ engines
 * D: package.json engines not enforced at runtime
 * E: node:fs/promises module resolves but lacks named export glob
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const LOG_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "../.cursor/debug-579b69.log",
);
const SESSION = "579b69";

function log(hypothesisId, location, message, data) {
  // #region agent log
  const payload = {
    sessionId: SESSION,
    runId: process.env.DEBUG_RUN_ID || "pre-fix",
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  mkdirSync(dirname(LOG_PATH), { recursive: true });
  appendFileSync(LOG_PATH, JSON.stringify(payload) + "\n");
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

const require = createRequire(import.meta.url);
const pkg = require("../package.json");
const vinextPkg = require("../node_modules/vinext/package.json");

const nodeVersion = process.version;
const major = Number(nodeVersion.slice(1).split(".")[0]);
const processExecPath = process.execPath;

log("A", "debug-node-env.mjs:nodeVersion", "Node runtime version", {
  nodeVersion,
  major,
  meetsProjectEngines: major >= 22,
  projectEngines: pkg.engines,
});

log("B", "debug-node-env.mjs:execPath", "Which node binary is active", {
  execPath: processExecPath,
  argv0: process.argv0,
  pathEnv: (process.env.PATH || "").split(":").slice(0, 8),
});

log("C", "debug-node-env.mjs:vinext", "vinext package engines", {
  vinextVersion: vinextPkg.version,
  vinextEngines: vinextPkg.engines,
});

log("D", "debug-node-env.mjs:engines", "engines field vs runtime", {
  packageEngines: pkg.engines?.node,
  currentNode: nodeVersion,
  enginesSatisfied: major >= 22,
  note: "npm may warn EBADENGINE but still install/run",
});

let globExport = null;
let globImportError = null;
try {
  const fsPromises = await import("node:fs/promises");
  globExport = typeof fsPromises.glob;
  const keys = Object.keys(fsPromises).filter((k) => k.toLowerCase().includes("glob"));
  log("E", "debug-node-env.mjs:globExport", "fs.promises.glob availability", {
    globType: globExport,
    hasGlob: "glob" in fsPromises,
    globRelatedKeys: keys,
  });
} catch (err) {
  globImportError = String(err);
  log("E", "debug-node-env.mjs:globExport", "fs.promises import failed", {
    error: globImportError,
  });
}

// Reproduce the exact vinext import pattern (absolute path bypasses package exports)
let vinextImportError = null;
try {
  const matcherUrl = new URL(
    "../node_modules/vinext/dist/routing/file-matcher.js",
    import.meta.url,
  );
  await import(matcherUrl.href);
  log("A", "debug-node-env.mjs:vinextImport", "vinext file-matcher imported OK", {
    ok: true,
    hasGlob: globExport === "function",
  });
} catch (err) {
  vinextImportError = {
    name: err?.name,
    message: err?.message,
    code: err?.code,
  };
  log("A", "debug-node-env.mjs:vinextImport", "vinext file-matcher import failed", {
    ok: false,
    error: vinextImportError,
    hasGlob: globExport === "function",
  });
}

console.log(
  JSON.stringify(
    {
      nodeVersion,
      major,
      hasGlob: globExport === "function",
      vinextImportError,
    },
    null,
    2,
  ),
);
