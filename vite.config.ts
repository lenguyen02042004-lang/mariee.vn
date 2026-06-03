import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Load all env vars (no prefix) into process.env so server routes
// can read SUPABASE_SERVICE_ROLE_KEY etc. during local dev.
const serverEnv = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    resolve: {
      alias: {
        "entities/lib/decode.js": path.resolve(__dirname, "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(__dirname, "node_modules/entities/lib/encode.js"),
        "entities": path.resolve(__dirname, "node_modules/entities"),
      },
    },
  },
});
