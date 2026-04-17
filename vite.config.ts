import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * UI shows `v${__APP_VERSION__}`. Prefer matching the git branch when it looks like semver (e.g. branch `v0.0.01` → `0.0.01`). Override with APP_VERSION=1.2.3 when building without git.
 */
function resolveAppVersion(fallback: string): string {
  const env = process.env.APP_VERSION?.trim();
  if (env) return env.replace(/^v/i, "");

  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
      cwd: join(__dirname),
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    const numeric = branch.replace(/^v/i, "");
    if (/^\d+(?:\.\d+){1,3}$/.test(numeric)) {
      return numeric;
    }
  } catch {
    /* not a git checkout or git unavailable */
  }
  return fallback;
}

const appVersion = resolveAppVersion(pkg.version);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion)
  }
});
