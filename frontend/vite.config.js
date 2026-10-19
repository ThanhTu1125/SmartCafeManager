import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: "window",
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://192.168.1.100:8080",
        changeOrigin: true,
      },
      "/ws-news": {
        target: "http://192.168.1.100:8080",
        changeOrigin: true,
        ws: true,
      },
      "/ws": {
        target: "http://192.168.1.100:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
