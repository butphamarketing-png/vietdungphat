import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const cmsProxy = {
  "/cms": {
    target: "http://vietdungphat.com",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/cms/, ""),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true, proxy: cmsProxy },
  preview: { proxy: cmsProxy },
});
