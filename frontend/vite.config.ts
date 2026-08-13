import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tmpdir } from "node:os";
import { join } from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";

  return {
    plugins: [react(), tailwindcss()],
    cacheDir: isDev
      ? join(tmpdir(), "annance-app-vite-cache")
      : ".vite-cache",
    define: {
      __APP_MODE__: JSON.stringify(mode),
      ...(env.VITE_APP_BRAND
        ? { __APP_BRAND__: JSON.stringify(env.VITE_APP_BRAND) }
        : {}),
    },
    server: {
      allowedHosts: true,
      preTransformRequests: false,
      hmr: {
        overlay: true,
      },
      watch: {
        usePolling: false,
        awaitWriteFinish: {
          stabilityThreshold: 200,
          pollInterval: 50,
        },
      },
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
        "/storage": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      force: isDev,
      holdUntilCrawlEnd: true,
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-dev-runtime",
        "react-router-dom",
        "axios",
        "lucide-react",
        "@solar-icons/react",
        "@phosphor-icons/react",
        "recharts",
        "@mui/material",
        "@mui/icons-material",
        "@emotion/react",
        "@emotion/styled",
        "framer-motion",
        "chart.js",
        "laravel-echo",
        "pusher-js",
        "ziggy-js",
        "qrcode.react",
        "papaparse",
        "file-saver",
        "@tensorflow/tfjs",
        "@tensorflow-models/mobilenet",
      ],
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return id
                .toString()
                .split("node_modules/")[1]
                .split("/")[0]
                .toString();
            }
          },
        },
      },
    },
  };
});
