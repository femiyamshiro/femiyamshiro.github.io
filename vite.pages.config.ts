import react from "@vitejs/plugin-react";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gunzipSync } from "node:zlib";
import { defineConfig } from "vite";

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
    const rulesJson = gunzipSync(compressed).toString("utf8");
    JSON.parse(rulesJson);
    return `export default ${rulesJson};`;
  },
});

export default defineConfig({
  base: "/",
  plugins: [juanceRulePack(), react()],
  build: {
    outDir: "dist-pages",
    emptyOutDir: true,
  },
});
