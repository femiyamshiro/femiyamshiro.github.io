import vinext from "vinext";
import { defineConfig } from "vite";
import { sites } from "@openai/sites-vite-plugin";
import hostingConfig from "./.openai/hosting.json";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gunzipSync } from "node:zlib";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;
const RULE_PACK_ID = "virtual:juance-rules-pack";
const RESOLVED_RULE_PACK_ID = `\0${RULE_PACK_ID}`;

const juanceRulePack = () => ({
  name: "juance-rule-pack",
  resolveId(id: string) {
    return id === RULE_PACK_ID ? RESOLVED_RULE_PACK_ID : undefined;
  },
  async load(id: string) {
    if (id !== RESOLVED_RULE_PACK_ID) return undefined;
    const compressed = await readFile(resolve(process.cwd(), "native/Data/rules.pack.json.gz"));
    // Expand the bundled rule pack at build time. The previous runtime
    // DecompressionStream/top-level-await module worked locally but could fail
    // while the deployed Worker rendered the initial route.
    const rulesJson = gunzipSync(compressed).toString("utf8");
    JSON.parse(rulesJson);
    return `export default ${rulesJson};`;
  },
});

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      juanceRulePack(),
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
