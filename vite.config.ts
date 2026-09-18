import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ command }) => {
  const version =
    command === "serve" ? "development" : new Date().toISOString();
  return {
    define: { __APP_VERSION__: JSON.stringify(version) },
    plugins: [
      react(),
      {
        name: "release-version",
        generateBundle() {
          this.emitFile({
            type: "asset",
            fileName: "version.json",
            source: JSON.stringify({ version }),
          });
        },
        configureServer(server) {
          server.middlewares.use("/version.json", (_req, res) => {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Cache-Control", "no-cache");
            res.end(JSON.stringify({ version }));
          });
        },
      },
    ],
    server: { port: 5173, strictPort: true },
    preview: { port: 4173, strictPort: true },
  };
});
