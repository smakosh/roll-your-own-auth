import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    devProxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
    prerender: {
      routes: ["/"],
      crawlLinks: true,
    },
  },

  tsr: {
    appDirectory: "./src",
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
    ],
  },
});
