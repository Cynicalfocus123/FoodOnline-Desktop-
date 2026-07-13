import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

declare const process: {
  env: Record<string, string | undefined>;
};

function getProductionBase() {
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH;
  }

  if (process.env.GITHUB_REPOSITORY?.toLowerCase().endsWith("/foodonline-desktop-")) {
    return "/FoodOnline-Desktop-/";
  }

  return "/";
}

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? getProductionBase() : "/",
  publicDir: false,
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        admin: "admin.html",
      },
    },
  },
}));
