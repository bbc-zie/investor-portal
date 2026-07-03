import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { API_BASE_PATH } from "@bbc-investor-portal/shared";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      [API_BASE_PATH]: {
        target: "http://localhost:4000",
        changeOrigin: true
      }
    }
  }
});
