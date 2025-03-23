// app.config.ts
import { API_URL } from "@/lib/env";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  server: {
    routeRules: {
      "/api": { proxy: { to: API_URL } }
    },
    prerender: {
      routes: ["/"],
      crawlLinks: true
    }
  },
  tsr: {
    appDirectory: "./src"
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"]
      }),
      tailwindcss()
    ]
  }
});
export {
  app_config_default as default
};
